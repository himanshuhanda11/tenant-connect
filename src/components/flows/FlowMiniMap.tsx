import React from 'react';
import { cn } from '@/lib/utils';

interface FlowMiniMapProps {
  nodes: Array<{ node_key: string; node_type: string; position_x: number; position_y: number }>;
  edges: Array<{ source_node_key: string; target_node_key: string }>;
  selectedNodeKey?: string | null;
  canvasWidth?: number;
  canvasHeight?: number;
}

const typeColor = (t: string) => {
  if (t === 'start') return 'hsl(142 70% 45%)';
  if (t.startsWith('ai-') || t === 'language-router' || t === 'sla-timer') return 'hsl(270 70% 60%)';
  if (['condition', 'switch', 'random-split'].includes(t)) return 'hsl(38 92% 50%)';
  if (['delay', 'timeout', 'business-hours'].includes(t)) return 'hsl(215 16% 55%)';
  if (t === 'webhook') return 'hsl(24 90% 55%)';
  if (['set-attribute','add-tag','assign-agent','create-ticket','notify-team','add-segment'].includes(t)) return 'hsl(142 70% 45%)';
  return 'hsl(217 91% 60%)';
};

export const FlowMiniMap: React.FC<FlowMiniMapProps> = ({ nodes, edges, selectedNodeKey, canvasWidth = 2000, canvasHeight = 1500 }) => {
  if (nodes.length === 0) return null;
  const W = 160, H = 110;
  const sx = W / canvasWidth;
  const sy = H / canvasHeight;
  return (
    <div className="absolute bottom-4 right-4 z-10 rounded-xl border bg-card/90 backdrop-blur-md shadow-xl p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1 px-1">Minimap</div>
      <svg width={W} height={H} className="bg-muted/30 rounded-md">
        {edges.map((e, i) => {
          const s = nodes.find(n => n.node_key === e.source_node_key);
          const t = nodes.find(n => n.node_key === e.target_node_key);
          if (!s || !t) return null;
          return (
            <line
              key={i}
              x1={(s.position_x + 100) * sx}
              y1={(s.position_y + 30) * sy}
              x2={(t.position_x + 100) * sx}
              y2={(t.position_y + 30) * sy}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={0.5}
              opacity={0.4}
            />
          );
        })}
        {nodes.map(n => (
          <rect
            key={n.node_key}
            x={n.position_x * sx}
            y={n.position_y * sy}
            width={Math.max(4, 200 * sx)}
            height={Math.max(3, 60 * sy)}
            rx={1.5}
            fill={typeColor(n.node_type)}
            opacity={selectedNodeKey === n.node_key ? 1 : 0.7}
            stroke={selectedNodeKey === n.node_key ? 'hsl(var(--primary))' : 'none'}
            strokeWidth={selectedNodeKey === n.node_key ? 1.5 : 0}
          />
        ))}
      </svg>
    </div>
  );
};
