import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledJob {
  id: string;
  tenant_id: string;
  run_id: string | null;
  workflow_id: string;
  node_id: string | null;
  contact_id: string | null;
  conversation_id: string | null;
  execute_at: string;
  status: string;
  attempts: number;
  max_attempts: number;
  payload: Record<string, unknown>;
  last_error: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Automation job runner started");

    // Get pending jobs (atomically lock and mark as running)
    const { data: jobs, error: jobsError } = await supabase.rpc("lock_due_automation_jobs", {
      p_limit: 50,
      p_locked_by: `runner-${Date.now()}`,
    });

    if (jobsError) {
      console.error("Error fetching pending jobs:", jobsError);
      throw jobsError;
    }

    if (!jobs || jobs.length === 0) {
      console.log("No pending jobs");
      return new Response(
        JSON.stringify({ success: true, message: "No pending jobs", jobsProcessed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${jobs.length} jobs`);

    const results = [];

    for (const job of jobs as ScheduledJob[]) {
      try {
        console.log(`Processing job ${job.id} for workflow ${job.workflow_id}`);

        // Load workflow
        const { data: workflow, error: workflowError } = await supabase
          .from("automation_workflows")
          .select("*")
          .eq("id", job.workflow_id)
          .single();

        if (workflowError || !workflow) {
          console.error(`Workflow not found for job ${job.id}`);
          await completeJob(supabase, job.id, "failed", "Workflow not found");
          results.push({ jobId: job.id, status: "failed", error: "Workflow not found" });
          continue;
        }

        // Check if workflow is still active
        if (workflow.status !== "active") {
          console.log(`Workflow ${workflow.id} is not active, cancelling job`);
          await completeJob(supabase, job.id, "cancelled", "Workflow not active");
          results.push({ jobId: job.id, status: "cancelled", reason: "workflow_inactive" });
          continue;
        }

        // Check stop conditions
        if (workflow.stop_on_customer_reply && job.conversation_id) {
          const customerReplied = await checkCustomerReply(supabase, job.conversation_id, job.execute_at);
          if (customerReplied) {
            console.log(`Customer replied, stopping job ${job.id}`);
            await completeJob(supabase, job.id, "cancelled", "Customer replied");
            results.push({ jobId: job.id, status: "cancelled", reason: "customer_replied" });
            continue;
          }
        }

        if (workflow.stop_on_conversation_closed && job.conversation_id) {
          const isClosed = await checkConversationClosed(supabase, job.conversation_id);
          if (isClosed) {
            console.log(`Conversation closed, stopping job ${job.id}`);
            await completeJob(supabase, job.id, "cancelled", "Conversation closed");
            results.push({ jobId: job.id, status: "cancelled", reason: "conversation_closed" });
            continue;
          }
        }

        // Check business hours if configured
        if (workflow.business_hours_config) {
          const withinBusinessHours = isWithinBusinessHours(
            workflow.business_hours_config,
            workflow.timezone || "UTC"
          );
          
          if (!withinBusinessHours) {
            // Reschedule to next business hour opening
            const nextOpening = getNextBusinessHourOpening(
              workflow.business_hours_config,
              workflow.timezone || "UTC"
            );
            
            await supabase
              .from("automation_scheduled_jobs")
              .update({
                status: "queued",
                execute_at: nextOpening.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", job.id);
            
            console.log(`Job ${job.id} rescheduled to ${nextOpening.toISOString()}`);
            results.push({ jobId: job.id, status: "rescheduled", nextExecuteAt: nextOpening.toISOString() });
            continue;
          }
        }

        // Execute the continuation
        const payload = job.payload;
        const context = payload.context as Record<string, unknown> || {};
        const nextNodes = payload.nextNodes as string[] || [];

        if (nextNodes.length === 0) {
          await completeJob(supabase, job.id, "done");
          results.push({ jobId: job.id, status: "done", reason: "no_next_nodes" });
          continue;
        }

        // Load nodes
        const { data: nodes } = await supabase
          .from("automation_nodes")
          .select("*")
          .eq("workflow_id", job.workflow_id);

        const { data: edges } = await supabase
          .from("automation_edges")
          .select("*")
          .eq("workflow_id", job.workflow_id);

        // Continue execution from next nodes
        const runId = job.run_id;
        if (!runId) {
          await completeJob(supabase, job.id, "failed", "No run ID");
          results.push({ jobId: job.id, status: "failed", error: "No run ID" });
          continue;
        }

        let messagesSent = 0;
        let stepsCompleted = 0;

        for (const nodeId of nextNodes) {
          const node = nodes?.find((n: any) => n.id === nodeId);
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
            const result = await executeNode(
              supabase,
              workflow,
              node,
              context,
              {
                tenantId: job.tenant_id,
                contactId: job.contact_id || undefined,
                conversationId: job.conversation_id || undefined,
              }
            );

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

            // Handle delays within the job
            if (result.delayUntil) {
              const edgesFromNode = edges?.filter((e: any) => e.from_node_id === nodeId) || [];
              const nextNodeIds = edgesFromNode.map((e: any) => e.to_node_id);

              await supabase.rpc("schedule_automation_job", {
                p_tenant_id: job.tenant_id,
                p_workflow_id: job.workflow_id,
                p_run_id: runId,
                p_node_id: nodeId,
                p_contact_id: job.contact_id,
                p_conversation_id: job.conversation_id,
                p_execute_at: result.delayUntil,
                p_payload: { context, nextNodes: nextNodeIds },
              });
            } else if (!result.shouldStop) {
              // Continue to next nodes
              const edgesFromNode = edges?.filter((e: any) => 
                e.from_node_id === nodeId && 
                (!result.branchLabel || e.label === result.branchLabel || !e.label)
              ) || [];
              
              for (const edge of edgesFromNode) {
                const nextNode = nodes?.find((n: any) => n.id === edge.to_node_id);
                if (nextNode) {
                  nextNodes.push(nextNode.id);
                }
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
          }
        }

        // Update run with stats
        await supabase
          .from("automation_runs")
          .update({
            steps_completed: supabase.rpc("coalesce", { val: stepsCompleted, default: 0 }),
            messages_sent: supabase.rpc("coalesce", { val: messagesSent, default: 0 }),
          })
          .eq("id", runId);

        await completeJob(supabase, job.id, "done");
        results.push({ 
          jobId: job.id, 
          status: "done", 
          stepsCompleted, 
          messagesSent 
        });

      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
        
        if (job.attempts >= job.max_attempts) {
          await completeJob(supabase, job.id, "failed", String(jobError));
          
          // Create deadletter entry
          await supabase.from("automation_deadletters").insert({
            tenant_id: job.tenant_id,
            workflow_id: job.workflow_id,
            run_id: job.run_id,
            error_type: "JOB_EXECUTION_FAILED",
            payload: job.payload,
            error: String(jobError),
            attempts: job.attempts,
            max_attempts: job.max_attempts,
          });
          
          results.push({ jobId: job.id, status: "failed", error: String(jobError) });
        } else {
          // Retry with exponential backoff
          const retryDelay = Math.pow(2, job.attempts) * 60 * 1000; // 2^attempts minutes
          const nextRetry = new Date(Date.now() + retryDelay);
          
          await supabase
            .from("automation_scheduled_jobs")
            .update({
              status: "queued",
              execute_at: nextRetry.toISOString(),
              last_error: String(jobError),
              updated_at: new Date().toISOString(),
            })
            .eq("id", job.id);
          
          results.push({ jobId: job.id, status: "retry_scheduled", nextRetry: nextRetry.toISOString() });
        }
      }
    }

    console.log(`Processed ${results.length} jobs`);

    return new Response(
      JSON.stringify({ success: true, jobsProcessed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Job runner error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function completeJob(
  supabase: any,
  jobId: string,
  status: string,
  error?: string
): Promise<void> {
  await supabase.rpc("complete_automation_job", {
    p_job_id: jobId,
    p_status: status,
    p_error: error || null,
  });
}

async function checkCustomerReply(
  supabase: any,
  conversationId: string,
  sinceTime: string
): Promise<boolean> {
  const { data } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("direction", "inbound")
    .gt("created_at", sinceTime)
    .limit(1);

  return data && data.length > 0;
}

async function checkConversationClosed(
  supabase: any,
  conversationId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("conversations")
    .select("status")
    .eq("id", conversationId)
    .single();

  return data?.status === "closed";
}

function isWithinBusinessHours(
  config: Record<string, unknown>,
  timezone: string
): boolean {
  try {
    const now = new Date();
    // Simple implementation - would need proper timezone handling
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    
    const days = (config.days as number[]) || [1, 2, 3, 4, 5];
    const startHour = parseInt((config.start as string || "09:00").split(":")[0]);
    const endHour = parseInt((config.end as string || "18:00").split(":")[0]);
    
    return days.includes(day) && hour >= startHour && hour < endHour;
  } catch {
    return true;
  }
}

function getNextBusinessHourOpening(
  config: Record<string, unknown>,
  timezone: string
): Date {
  const now = new Date();
  const days = (config.days as number[]) || [1, 2, 3, 4, 5];
  const startHour = parseInt((config.start as string || "09:00").split(":")[0]);
  
  // Find next business day opening
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    checkDate.setUTCHours(startHour, 0, 0, 0);
    
    if (days.includes(checkDate.getUTCDay()) && checkDate > now) {
      return checkDate;
    }
  }
  
  // Fallback: tomorrow at start hour
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setUTCHours(startHour, 0, 0, 0);
  return tomorrow;
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
  workflow: any,
  node: any,
  context: Record<string, unknown>,
  event: { tenantId: string; contactId?: string; conversationId?: string }
): Promise<NodeResult> {
  const config = node.config;

  switch (node.type) {
    case "trigger":
      return { success: true, output: { triggered: true } };

    case "condition":
      const conditionType = config.type as string;
      let result = true;
      
      if (conditionType === "time_window") {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const startHour = config.startHour as number || 9;
        const endHour = config.endHour as number || 18;
        const workDays = config.workDays as number[] || [1, 2, 3, 4, 5];
        result = workDays.includes(day) && hour >= startHour && hour < endHour;
      }
      
      return { success: true, output: { result }, branchLabel: result ? "true" : "false" };

    case "action":
      const actionType = config.type as string;
      
      switch (actionType) {
        case "send_template":
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

        case "stop_workflow":
          return { success: true, shouldStop: true, output: { workflowStopped: true } };

        default:
          return { success: true, output: { actionType } };
      }

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

    default:
      return { success: false, error: `Unknown node type: ${node.type}` };
  }
}
