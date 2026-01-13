import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationEvent {
  tenantId: string;
  eventType: string;
  contactId?: string;
  conversationId?: string;
  messageId?: string;
  phoneNumberId?: string;
  wabaId?: string;
  payload?: Record<string, unknown>;
}

interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  enforce_opt_in_for_marketing: boolean;
  max_messages_per_contact_per_day: number | null;
  cooldown_seconds: number | null;
  stop_on_customer_reply: boolean;
  stop_on_conversation_closed: boolean;
  business_hours_config: Record<string, unknown> | null;
  timezone: string;
  created_by: string | null;
}

interface WorkflowNode {
  id: string;
  workflow_id: string;
  type: string;
  node_key: string;
  name: string | null;
  config: Record<string, unknown>;
  sort_order: number;
}

interface WorkflowEdge {
  id: string;
  workflow_id: string;
  from_node_id: string;
  to_node_id: string;
  label: string | null;
  condition: Record<string, unknown> | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: AutomationEvent = await req.json();
    console.log("Automation event received:", event);

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(event);

    // Cancel queued jobs if customer replies (stop_on_customer_reply)
    if (event.eventType === "message_received" && event.conversationId) {
      const { data: cancelledCount } = await supabase.rpc("cancel_conversation_jobs", {
        p_tenant_id: event.tenantId,
        p_conversation_id: event.conversationId,
        p_only_stop_on_reply: true,
      });
      if (cancelledCount && cancelledCount > 0) {
        console.log(`Cancelled ${cancelledCount} queued jobs due to customer reply`);
      }
    }

    // Cancel queued jobs if conversation closed
    if (event.eventType === "conversation_closed" && event.conversationId) {
      const { data: cancelledCount } = await supabase.rpc("cancel_conversation_jobs", {
        p_tenant_id: event.tenantId,
        p_conversation_id: event.conversationId,
        p_only_stop_on_reply: false,
      });
      if (cancelledCount && cancelledCount > 0) {
        console.log(`Cancelled ${cancelledCount} queued jobs due to conversation close`);
      }
    }

    // Load active workflows matching this trigger
    const { data: workflows, error: workflowsError } = await supabase
      .from("automation_workflows")
      .select("*")
      .eq("tenant_id", event.tenantId)
      .eq("status", "active")
      .eq("trigger_type", event.eventType)
      .eq("is_deleted", false);

    if (workflowsError) {
      console.error("Error loading workflows:", workflowsError);
      throw workflowsError;
    }

    if (!workflows || workflows.length === 0) {
      console.log("No active workflows for this event type");
      return new Response(
        JSON.stringify({ success: true, message: "No matching workflows", runsCreated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const workflow of workflows as Workflow[]) {
      try {
        // Check cooldown
        const cooldownOk = await checkCooldown(supabase, event.tenantId, workflow.id, event.contactId);
        if (!cooldownOk) {
          console.log(`Workflow ${workflow.id} skipped due to cooldown`);
          results.push({ workflowId: workflow.id, status: "skipped", reason: "cooldown" });
          continue;
        }

        // Check rate limit
        const rateLimitOk = await checkRateLimit(supabase, event.tenantId, workflow.id, event.contactId);
        if (!rateLimitOk) {
          console.log(`Workflow ${workflow.id} skipped due to rate limit`);
          results.push({ workflowId: workflow.id, status: "skipped", reason: "rate_limit" });
          continue;
        }

        // Check trigger conditions
        const triggerMatch = await evaluateTriggerConditions(workflow, event);
        if (!triggerMatch) {
          console.log(`Workflow ${workflow.id} skipped - trigger conditions not met`);
          results.push({ workflowId: workflow.id, status: "skipped", reason: "trigger_mismatch" });
          continue;
        }

        // Check opt-in for marketing workflows
        if (workflow.enforce_opt_in_for_marketing && event.contactId) {
          const optedIn = await checkOptInStatus(supabase, event.contactId);
          if (!optedIn) {
            console.log(`Workflow ${workflow.id} skipped - contact not opted in`);
            results.push({ workflowId: workflow.id, status: "skipped", reason: "not_opted_in" });
            continue;
          }
        }

        // Create workflow run (with idempotency)
        const { data: existingRun } = await supabase
          .from("automation_runs")
          .select("id")
          .eq("workflow_id", workflow.id)
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();

        if (existingRun) {
          console.log(`Run already exists for workflow ${workflow.id} with key ${idempotencyKey}`);
          results.push({ workflowId: workflow.id, status: "skipped", reason: "duplicate" });
          continue;
        }

        const { data: run, error: runError } = await supabase
          .from("automation_runs")
          .insert({
            tenant_id: event.tenantId,
            workflow_id: workflow.id,
            status: "running",
            trigger_type: event.eventType,
            trigger_payload: event.payload || {},
            contact_id: event.contactId,
            conversation_id: event.conversationId,
            message_id: event.messageId,
            idempotency_key: idempotencyKey,
          })
          .select()
          .single();

        if (runError) {
          console.error(`Error creating run for workflow ${workflow.id}:`, runError);
          results.push({ workflowId: workflow.id, status: "error", error: runError.message });
          continue;
        }

        // Load workflow nodes and edges
        const [nodesResult, edgesResult] = await Promise.all([
          supabase.from("automation_nodes").select("*").eq("workflow_id", workflow.id).order("sort_order"),
          supabase.from("automation_edges").select("*").eq("workflow_id", workflow.id),
        ]);

        if (nodesResult.error || edgesResult.error) {
          console.error("Error loading workflow structure:", nodesResult.error || edgesResult.error);
          await updateRunStatus(supabase, run.id, "failed", "Failed to load workflow structure");
          results.push({ workflowId: workflow.id, runId: run.id, status: "error", error: "structure_load_failed" });
          continue;
        }

        const nodes = nodesResult.data as WorkflowNode[];
        const edges = edgesResult.data as WorkflowEdge[];

        // Execute workflow nodes
        const executionResult = await executeWorkflow(
          supabase,
          workflow,
          run.id,
          nodes,
          edges,
          event
        );

        // Set cooldown after successful run
        if (workflow.cooldown_seconds && workflow.cooldown_seconds > 0) {
          await setCooldown(supabase, event.tenantId, workflow.id, event.contactId, workflow.cooldown_seconds);
        }

        // Increment rate limit counter
        await incrementRateLimit(supabase, event.tenantId, workflow.id, event.contactId);

        // Update run status
        await updateRunStatus(supabase, run.id, executionResult.status, executionResult.error);

        results.push({
          workflowId: workflow.id,
          runId: run.id,
          status: executionResult.status,
          stepsCompleted: executionResult.stepsCompleted,
          messagesSent: executionResult.messagesSent,
        });

      } catch (workflowError) {
        console.error(`Error executing workflow ${workflow.id}:`, workflowError);
        results.push({ workflowId: workflow.id, status: "error", error: String(workflowError) });
      }
    }

    return new Response(
      JSON.stringify({ success: true, runsCreated: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Automation event error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateIdempotencyKey(event: AutomationEvent): string {
  const parts = [event.eventType];
  if (event.messageId) parts.push(event.messageId);
  else if (event.contactId) parts.push(event.contactId, Date.now().toString());
  return parts.join(":");
}

async function checkCooldown(
  supabase: any,
  tenantId: string,
  workflowId: string,
  contactId?: string
): Promise<boolean> {
  const cooldownKey = contactId
    ? `wf:${workflowId}:c:${contactId}`
    : `wf:${workflowId}`;

  const { data } = await supabase.rpc("check_automation_cooldown", {
    p_tenant_id: tenantId,
    p_cooldown_key: cooldownKey,
  });

  return data === true;
}

async function setCooldown(
  supabase: any,
  tenantId: string,
  workflowId: string,
  contactId: string | undefined,
  seconds: number
): Promise<void> {
  const cooldownKey = contactId
    ? `wf:${workflowId}:c:${contactId}`
    : `wf:${workflowId}`;

  await supabase.rpc("set_automation_cooldown", {
    p_tenant_id: tenantId,
    p_cooldown_key: cooldownKey,
    p_seconds: seconds,
    p_scope: "workflow",
    p_workflow_id: workflowId,
    p_contact_id: contactId || null,
  });
}

async function checkRateLimit(
  supabase: any,
  tenantId: string,
  workflowId: string,
  contactId?: string
): Promise<boolean> {
  if (!contactId) return true;

  const { data } = await supabase.rpc("check_automation_rate_limit", {
    p_tenant_id: tenantId,
    p_workflow_id: workflowId,
    p_contact_id: contactId,
    p_scope: "workflow_per_contact",
  });

  return data === true;
}

async function incrementRateLimit(
  supabase: any,
  tenantId: string,
  workflowId: string,
  contactId?: string
): Promise<void> {
  if (!contactId) return;

  await supabase.rpc("increment_automation_rate_limit", {
    p_tenant_id: tenantId,
    p_workflow_id: workflowId,
    p_contact_id: contactId,
    p_limit: 10,
    p_scope: "workflow_per_contact",
  });
}

async function checkOptInStatus(supabase: any, contactId: string): Promise<boolean> {
  const { data: contact } = await supabase
    .from("contacts")
    .select("opt_in_status, opt_out")
    .eq("id", contactId)
    .single();

  if (!contact) return false;
  return contact.opt_in_status === true && contact.opt_out !== true;
}

function evaluateTriggerConditions(workflow: Workflow, event: AutomationEvent): boolean {
  const config = workflow.trigger_config;
  const payload = event.payload || {};

  switch (workflow.trigger_type) {
    case "keyword_received":
      const keywords = (config.keywords as string[]) || [];
      const matchType = config.match || "contains";
      const caseSensitive = config.caseSensitive || false;
      const messageText = (payload.text as string) || "";
      
      return keywords.some((keyword) => {
        const kw = caseSensitive ? keyword : keyword.toLowerCase();
        const text = caseSensitive ? messageText : messageText.toLowerCase();
        
        if (matchType === "exact") return text === kw;
        if (matchType === "contains") return text.includes(kw);
        if (matchType === "regex") {
          try { return new RegExp(keyword, caseSensitive ? "" : "i").test(messageText); }
          catch { return false; }
        }
        return false;
      });

    case "scheduled_time":
      // Scheduled triggers are handled by the job runner
      return true;

    case "inactivity_no_reply":
      // Inactivity is handled separately
      return true;

    default:
      // For other triggers, just match the event type
      return true;
  }
}

async function executeWorkflow(
  supabase: any,
  workflow: Workflow,
  runId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  event: AutomationEvent
): Promise<{ status: string; stepsCompleted: number; messagesSent: number; error?: string }> {
  let stepsCompleted = 0;
  let messagesSent = 0;

  // Find trigger node(s)
  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  if (triggerNodes.length === 0) {
    return { status: "failed", stepsCompleted: 0, messagesSent: 0, error: "No trigger node found" };
  }

  // BFS through the workflow graph
  const visited = new Set<string>();
  const queue: string[] = triggerNodes.map((n) => n.id);
  const context: Record<string, unknown> = {
    contact_id: event.contactId,
    conversation_id: event.conversationId,
    message_id: event.messageId,
    payload: event.payload,
  };

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    // Create step log
    const { data: step } = await supabase
      .from("automation_steps")
      .insert({
        run_id: runId,
        node_id: node.id,
        node_type: node.type,
        node_name: node.name,
        status: "started",
        input_data: { context, config: node.config },
      })
      .select()
      .single();

    try {
      const result = await executeNode(supabase, workflow, node, context, event);

      // Update step with result
      await supabase
        .from("automation_steps")
        .update({
          status: result.success ? "success" : "failed",
          finished_at: new Date().toISOString(),
          output_data: result.output,
          error: result.error,
        })
        .eq("id", step.id);

      stepsCompleted++;
      if (result.messageSent) messagesSent++;

      // Handle stop or delay
      if (result.shouldStop) break;
      if (result.delayUntil) {
        // Schedule continuation
        await supabase.rpc("schedule_automation_job", {
          p_tenant_id: workflow.tenant_id,
          p_workflow_id: workflow.id,
          p_run_id: runId,
          p_node_id: nodeId,
          p_contact_id: event.contactId || null,
          p_conversation_id: event.conversationId || null,
          p_execute_at: result.delayUntil,
          p_payload: { context, nextNodes: getNextNodes(edges, nodeId, result.branchLabel) },
        });
        break;
      }

      // Find next nodes based on edges and branch labels
      const nextNodeIds = getNextNodes(edges, nodeId, result.branchLabel);
      for (const nextId of nextNodeIds) {
        if (!visited.has(nextId)) {
          queue.push(nextId);
        }
      }

    } catch (nodeError) {
      console.error(`Error executing node ${node.id}:`, nodeError);
      await supabase
        .from("automation_steps")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error: String(nodeError),
        })
        .eq("id", step.id);

      return { status: "failed", stepsCompleted, messagesSent, error: String(nodeError) };
    }
  }

  return { status: "success", stepsCompleted, messagesSent };
}

function getNextNodes(edges: WorkflowEdge[], fromNodeId: string, branchLabel?: string): string[] {
  return edges
    .filter((e) => e.from_node_id === fromNodeId && (!branchLabel || e.label === branchLabel || !e.label))
    .map((e) => e.to_node_id);
}

interface NodeResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  shouldStop?: boolean;
  delayUntil?: string;
  branchLabel?: string;
  messageSent?: boolean;
}

async function executeNode(
  supabase: any,
  workflow: Workflow,
  node: WorkflowNode,
  context: Record<string, unknown>,
  event: AutomationEvent
): Promise<NodeResult> {
  const config = node.config;

  switch (node.type) {
    case "trigger":
      // Trigger nodes just pass through
      return { success: true, output: { triggered: true } };

    case "condition":
      const conditionResult = evaluateCondition(config, context, event);
      return { success: true, output: { result: conditionResult }, branchLabel: conditionResult ? "true" : "false" };

    case "action":
      return await executeAction(supabase, workflow, config, context, event);

    case "delay":
      const delayMinutes = (config.minutes as number) || 0;
      const delayHours = (config.hours as number) || 0;
      const delayDays = (config.days as number) || 0;
      const totalMs = (delayMinutes * 60 + delayHours * 3600 + delayDays * 86400) * 1000;
      
      if (totalMs > 0) {
        const executeAt = new Date(Date.now() + totalMs).toISOString();
        return { success: true, output: { delayUntil: executeAt }, delayUntil: executeAt };
      }
      return { success: true };

    case "stop":
      return { success: true, shouldStop: true, output: { stopped: true } };

    case "branch":
      // Branch logic is handled via conditions + edges
      return { success: true };

    default:
      return { success: false, error: `Unknown node type: ${node.type}` };
  }
}

function evaluateCondition(
  config: Record<string, unknown>,
  context: Record<string, unknown>,
  event: AutomationEvent
): boolean {
  const conditionType = config.type as string;
  const payload = event.payload || {};

  switch (conditionType) {
    case "contact_has_tag":
      // Would need to check contact_tags table
      return true;

    case "time_window":
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const startHour = config.startHour as number || 9;
      const endHour = config.endHour as number || 18;
      const workDays = config.workDays as number[] || [1, 2, 3, 4, 5];
      return workDays.includes(day) && hour >= startHour && hour < endHour;

    case "conversation_status":
      return true;

    case "opt_in_required":
      return true;

    default:
      return true;
  }
}

async function executeAction(
  supabase: any,
  workflow: Workflow,
  config: Record<string, unknown>,
  context: Record<string, unknown>,
  event: AutomationEvent
): Promise<NodeResult> {
  const actionType = config.type as string;

  switch (actionType) {
    case "send_template":
      // Call send-template-message edge function
      try {
        const templateName = config.templateName as string;
        const language = config.language as string || "en";
        
        const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-template-message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            tenantId: event.tenantId,
            contactId: event.contactId,
            templateName,
            language,
            variables: config.variables || [],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Template send failed: ${error}` };
        }

        return { success: true, output: { templateSent: templateName }, messageSent: true };
      } catch (e) {
        return { success: false, error: `Template error: ${e}` };
      }

    case "add_tag":
      const tagIdToAdd = config.tagId as string;
      if (tagIdToAdd && event.contactId) {
        await supabase.from("contact_tags").upsert({
          contact_id: event.contactId,
          tag_id: tagIdToAdd,
        }, { onConflict: "contact_id,tag_id" });
      }
      return { success: true, output: { tagAdded: tagIdToAdd } };

    case "remove_tag":
      const tagIdToRemove = config.tagId as string;
      if (tagIdToRemove && event.contactId) {
        await supabase
          .from("contact_tags")
          .delete()
          .eq("contact_id", event.contactId)
          .eq("tag_id", tagIdToRemove);
      }
      return { success: true, output: { tagRemoved: tagIdToRemove } };

    case "assign_agent":
      const strategy = config.strategy as string || "SPECIFIC_AGENT";
      const teamId = config.teamId as string;
      let selectedAgentId = config.agentId as string;
      
      if (event.conversationId) {
        // Round Robin assignment
        if (strategy === "ROUND_ROBIN" && teamId) {
          const { data: rrAgent } = await supabase.rpc("pick_agent_round_robin", {
            p_tenant_id: event.tenantId,
            p_team_id: teamId,
          });
          selectedAgentId = rrAgent || config.fallbackAgentId as string || selectedAgentId;
        }
        // Least Busy assignment
        else if (strategy === "LEAST_BUSY" && teamId) {
          const { data: agents } = await supabase
            .from("agents")
            .select("id, tenant_id")
            .eq("tenant_id", event.tenantId)
            .eq("is_active", true);
          
          if (agents && agents.length > 0) {
            // Count open conversations per agent
            const agentCounts = await Promise.all(
              agents.map(async (agent: any) => {
                const { count } = await supabase
                  .from("conversations")
                  .select("*", { count: "exact", head: true })
                  .eq("assigned_to", agent.id)
                  .eq("status", "open");
                return { id: agent.id, count: count || 0 };
              })
            );
            agentCounts.sort((a, b) => a.count - b.count);
            selectedAgentId = agentCounts[0]?.id || selectedAgentId;
          }
        }
        
        if (selectedAgentId) {
          await supabase
            .from("conversations")
            .update({ assigned_to: selectedAgentId })
            .eq("id", event.conversationId);
        }
      }
      return { success: true, output: { agentAssigned: selectedAgentId, strategy } };

    case "set_status":
      const status = config.status as string;
      if (event.conversationId && status) {
        await supabase
          .from("conversations")
          .update({ status })
          .eq("id", event.conversationId);
      }
      return { success: true, output: { statusSet: status } };

    case "update_contact_attr":
      const attributes = config.attributes as Record<string, unknown>;
      if (event.contactId && attributes) {
        await supabase
          .from("contacts")
          .update(attributes)
          .eq("id", event.contactId);
      }
      return { success: true, output: { attributesUpdated: Object.keys(attributes || {}) } };

    case "add_internal_note":
      const noteContent = config.content as string;
      if (event.conversationId && noteContent) {
        await supabase.from("conversation_notes").insert({
          tenant_id: event.tenantId,
          conversation_id: event.conversationId,
          user_id: workflow.created_by,
          content: `[Automation: ${workflow.name}] ${noteContent}`,
        });
      }
      return { success: true, output: { noteAdded: true } };

    case "call_webhook":
      try {
        const webhookUrl = config.url as string;
        const webhookMethod = config.method as string || "POST";
        
        const response = await fetch(webhookUrl, {
          method: webhookMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: event.eventType,
            contactId: event.contactId,
            conversationId: event.conversationId,
            payload: event.payload,
            workflowId: workflow.id,
            workflowName: workflow.name,
          }),
        });

        return { 
          success: response.ok, 
          output: { webhookCalled: webhookUrl, status: response.status },
          error: response.ok ? undefined : `Webhook returned ${response.status}`
        };
      } catch (e) {
        return { success: false, error: `Webhook error: ${e}` };
      }

    case "stop_workflow":
      return { success: true, shouldStop: true, output: { workflowStopped: true } };

    default:
      return { success: false, error: `Unknown action type: ${actionType}` };
  }
}

async function updateRunStatus(
  supabase: any,
  runId: string,
  status: string,
  error?: string
): Promise<void> {
  await supabase
    .from("automation_runs")
    .update({
      status,
      finished_at: new Date().toISOString(),
      error,
    })
    .eq("id", runId);
}
