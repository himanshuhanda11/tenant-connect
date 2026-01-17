import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'deprecated' | 'removed';
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.5.0',
    date: 'January 15, 2026',
    type: 'minor',
    title: 'AI-Powered Intent Detection',
    changes: [
      { type: 'added', description: 'AI intent detection for incoming messages' },
      { type: 'added', description: 'Smart routing based on conversation context' },
      { type: 'changed', description: 'Improved webhook delivery reliability' },
      { type: 'fixed', description: 'Template variable parsing edge cases' }
    ]
  },
  {
    version: '2.4.2',
    date: 'January 8, 2026',
    type: 'patch',
    title: 'Bug Fixes & Improvements',
    changes: [
      { type: 'fixed', description: 'Rate limiting calculation for high-volume accounts' },
      { type: 'fixed', description: 'Media upload timeout for large files' },
      { type: 'changed', description: 'Increased webhook retry attempts to 5' }
    ]
  },
  {
    version: '2.4.0',
    date: 'December 20, 2025',
    type: 'minor',
    title: 'WhatsApp Flows Support',
    changes: [
      { type: 'added', description: 'Full WhatsApp Flows API support' },
      { type: 'added', description: 'Flow builder UI in dashboard' },
      { type: 'added', description: 'Flow analytics and conversion tracking' },
      { type: 'deprecated', description: 'Legacy menu-based flows (migration guide available)' }
    ]
  },
  {
    version: '2.3.0',
    date: 'December 1, 2025',
    type: 'minor',
    title: 'Enhanced Campaign Analytics',
    changes: [
      { type: 'added', description: 'Real-time campaign performance dashboard' },
      { type: 'added', description: 'A/B testing for message templates' },
      { type: 'changed', description: 'Campaign scheduling now supports timezone selection' }
    ]
  }
];

const typeColors = {
  added: 'bg-green-500/10 text-green-600 border-green-500/20',
  changed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  fixed: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  deprecated: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  removed: 'bg-red-500/10 text-red-600 border-red-500/20'
};

const versionColors = {
  major: 'bg-purple-500/20 text-purple-600',
  minor: 'bg-blue-500/20 text-blue-600',
  patch: 'bg-slate-500/20 text-slate-600'
};

export function Changelog() {
  return (
    <div className="space-y-8">
      {changelog.map((entry, index) => (
        <div 
          key={entry.version}
          className={cn(
            "relative pl-8 pb-8",
            index < changelog.length - 1 && "border-l-2 border-border/50"
          )}
        >
          {/* Timeline dot */}
          <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
          
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className={cn("font-mono", versionColors[entry.type])}>
              v{entry.version}
            </Badge>
            <span className="text-sm text-muted-foreground">{entry.date}</span>
          </div>
          
          <h4 className="text-lg font-semibold text-foreground mb-3">{entry.title}</h4>
          
          {/* Changes */}
          <ul className="space-y-2">
            {entry.changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] px-1.5 py-0 mt-0.5 capitalize border", typeColors[change.type])}
                >
                  {change.type}
                </Badge>
                <span className="text-muted-foreground">{change.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <a href="#" className="text-sm text-primary hover:underline">
          View Full Changelog →
        </a>
      </div>
    </div>
  );
}
