// Flow validation engine — pre-publish checklist.
// Pure functions; no Supabase dependency so it can run in builder UI live.

export type FlowIssueSeverity = 'error' | 'warning';

export interface FlowIssue {
  id: string;
  severity: FlowIssueSeverity;
  message: string;
  fix?: string;
  nodeKey?: string;
}

export interface ValidationInput {
  nodes: Array<{
    id?: string;
    node_key: string;
    node_type: string;
    label?: string;
    config?: Record<string, any> | null;
  }>;
  edges: Array<{
    source_node_key: string;
    target_node_key: string;
    source_handle?: string | null;
  }>;
  triggers: Array<{
    trigger_type: string;
    is_enabled?: boolean;
    config?: Record<string, any> | null;
  }>;
}

const TERMINAL_TYPES = new Set(['end', 'assign-agent', 'human-handover']);
const MESSAGE_TYPES = new Set(['text-buttons', 'message', 'list-message', 'media']);
const TEMPLATE_TYPES = new Set(['template']);
const CONDITION_TYPES = new Set(['condition']);
const ASSIGN_TYPES = new Set(['assign-agent']);

export function validateFlow(input: ValidationInput): FlowIssue[] {
  const issues: FlowIssue[] = [];
  const { nodes, edges, triggers } = input;

  // 1. Trigger present and enabled
  const enabledTriggers = triggers.filter((t) => t.is_enabled !== false);
  if (enabledTriggers.length === 0) {
    issues.push({
      id: 'no-trigger',
      severity: 'error',
      message: 'No active trigger configured',
      fix: 'Add at least one trigger (keyword, QR, ad, or webhook) and enable it.',
    });
  }

  for (const t of enabledTriggers) {
    if (t.trigger_type === 'keyword') {
      const kw = (t.config?.keyword || t.config?.keywords || '').toString().trim();
      if (!kw) {
        issues.push({
          id: `trigger-${t.trigger_type}-empty`,
          severity: 'error',
          message: 'Keyword trigger is missing a keyword',
          fix: 'Enter one or more comma-separated keywords on the trigger.',
        });
      }
    }
  }

  // 2. At least one node
  if (nodes.length === 0) {
    issues.push({
      id: 'no-nodes',
      severity: 'error',
      message: 'Flow has no nodes',
      fix: 'Drag nodes from the palette or load a prebuilt template.',
    });
    return issues;
  }

  // 3. Build adjacency
  const keysByKey = new Map(nodes.map((n) => [n.node_key, n]));
  const outgoing = new Map<string, Array<{ target: string; handle?: string | null }>>();
  const incoming = new Map<string, number>();
  for (const e of edges) {
    if (!outgoing.has(e.source_node_key)) outgoing.set(e.source_node_key, []);
    outgoing.get(e.source_node_key)!.push({ target: e.target_node_key, handle: e.source_handle ?? null });
    incoming.set(e.target_node_key, (incoming.get(e.target_node_key) || 0) + 1);
    if (!keysByKey.has(e.source_node_key)) {
      issues.push({
        id: `edge-orphan-src-${e.source_node_key}`,
        severity: 'error',
        message: `Edge references missing source node "${e.source_node_key}"`,
        fix: 'Delete the broken edge or re-add the source node.',
      });
    }
    if (!keysByKey.has(e.target_node_key)) {
      issues.push({
        id: `edge-orphan-tgt-${e.target_node_key}`,
        severity: 'error',
        message: `Edge references missing target node "${e.target_node_key}"`,
        fix: 'Delete the broken edge or re-add the target node.',
      });
    }
  }

  // 4. Each non-start, non-terminal node must be connected
  for (const n of nodes) {
    const isStart = n.node_type === 'start';
    const isTerminal = TERMINAL_TYPES.has(n.node_type);
    const hasIn = (incoming.get(n.node_key) || 0) > 0;
    const hasOut = (outgoing.get(n.node_key) || []).length > 0;

    if (!isStart && !hasIn) {
      issues.push({
        id: `node-no-in-${n.node_key}`,
        severity: 'warning',
        message: `"${n.label || n.node_key}" has no incoming connection`,
        fix: 'Connect it from a previous node, or delete it.',
        nodeKey: n.node_key,
      });
    }
    if (!hasOut && !isTerminal) {
      issues.push({
        id: `node-no-out-${n.node_key}`,
        severity: 'warning',
        message: `"${n.label || n.node_key}" is a dead end`,
        fix: 'Connect it forward, mark it as End, or add an Assign-agent / Handover step.',
        nodeKey: n.node_key,
      });
    }
  }

  // 5. Per-node config validation
  for (const n of nodes) {
    const cfg = n.config || {};
    if (MESSAGE_TYPES.has(n.node_type)) {
      const msg = (cfg.message || cfg.text || '').toString().trim();
      if (!msg) {
        issues.push({
          id: `node-no-msg-${n.node_key}`,
          severity: 'error',
          message: `"${n.label || n.node_key}" has no message text`,
          fix: 'Open the node and type a WhatsApp message body.',
          nodeKey: n.node_key,
        });
      }
    }
    if (TEMPLATE_TYPES.has(n.node_type)) {
      if (!cfg.template_id && !cfg.template_name) {
        issues.push({
          id: `node-no-tpl-${n.node_key}`,
          severity: 'error',
          message: `"${n.label || n.node_key}" has no template selected`,
          fix: 'Pick an approved WhatsApp template from the dropdown.',
          nodeKey: n.node_key,
        });
      }
    }
    if (CONDITION_TYPES.has(n.node_type)) {
      const kw = (cfg.keyword || cfg.value || '').toString().trim();
      if (!kw) {
        issues.push({
          id: `node-cond-empty-${n.node_key}`,
          severity: 'error',
          message: `Condition "${n.label || n.node_key}" has no matching value`,
          fix: 'Set the keyword / value to compare against in the condition.',
          nodeKey: n.node_key,
        });
      }
    }
    if (ASSIGN_TYPES.has(n.node_type)) {
      const strat = cfg.strategy || cfg.mode;
      if (!strat) {
        issues.push({
          id: `node-assign-empty-${n.node_key}`,
          severity: 'warning',
          message: `Assignment "${n.label || n.node_key}" has no strategy`,
          fix: 'Choose Round-robin, Specific agent, or Team.',
          nodeKey: n.node_key,
        });
      }
    }
  }

  // 6. Must have a terminal / leaf
  const hasTerminal = nodes.some((n) => TERMINAL_TYPES.has(n.node_type) || (outgoing.get(n.node_key) || []).length === 0);
  if (!hasTerminal) {
    issues.push({
      id: 'no-end',
      severity: 'warning',
      message: 'Flow has no End or Assign step',
      fix: 'Add an End node or Assign-agent to clearly close the conversation.',
    });
  }

  // 7. Cycle detection
  const visited = new Set<string>();
  const stack = new Set<string>();
  let hasCycle = false;
  function dfs(key: string) {
    if (hasCycle) return;
    if (stack.has(key)) {
      hasCycle = true;
      return;
    }
    if (visited.has(key)) return;
    visited.add(key);
    stack.add(key);
    for (const next of outgoing.get(key) || []) dfs(next.target);
    stack.delete(key);
  }
  const startNode = nodes.find((n) => n.node_type === 'start') || nodes[0];
  if (startNode) dfs(startNode.node_key);
  if (hasCycle) {
    issues.push({
      id: 'cycle',
      severity: 'warning',
      message: 'Flow contains a loop — runs may bounce between nodes',
      fix: 'Break the loop or add a condition to exit it.',
    });
  }

  return issues;
}

export function summariseIssues(issues: FlowIssue[]) {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { errors, warnings, canPublish: errors === 0 };
}
