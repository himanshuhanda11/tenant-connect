import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowHealthPillProps {
  nodes: Array<{ node_key: string; node_type: string; config?: any }>;
  edges: Array<{ source_node_key: string; target_node_key: string }>;
  triggers: Array<{ id: string; is_enabled: boolean }>;
}

export const FlowHealthPill: React.FC<FlowHealthPillProps> = ({ nodes, edges, triggers }) => {
  const checks: { label: string; pass: boolean }[] = [];
  checks.push({ label: 'Has trigger', pass: triggers.some(t => t.is_enabled) });
  checks.push({ label: 'Has steps', pass: nodes.filter(n => n.node_type !== 'start').length > 0 });
  // every non-start node has incoming edge
  const incoming = new Set(edges.map(e => e.target_node_key));
  const connected = nodes.filter(n => n.node_type !== 'start').every(n => incoming.has(n.node_key));
  checks.push({ label: 'All connected', pass: connected });
  // every message-ish node has content
  const configured = nodes.filter(n => n.node_type !== 'start')
    .every(n => !!(n.config?.message || n.config?.template_id || n.config?.keyword || n.config?.url || n.config?.delay_seconds || n.config?.attribute));
  checks.push({ label: 'Configured', pass: configured });

  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  const good = score >= 75;

  return (
    <div
      title={checks.map(c => `${c.pass ? '✓' : '✗'} ${c.label}`).join('\n')}
      className={cn(
        'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        good
          ? 'bg-green-500/10 text-green-600 border-green-500/20'
          : 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      )}
    >
      {good ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      Health {score}%
    </div>
  );
};
