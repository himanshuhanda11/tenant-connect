import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Library, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PRE_APPROVED_TEMPLATES, PreApprovedTemplate } from '@/data/preApprovedTemplates';
import { cn } from '@/lib/utils';

export interface LibrarySelection {
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  body: string;
  variables?: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (template: LibrarySelection) => void;
}

const META_BADGE: Record<string, string> = {
  UTILITY: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  MARKETING: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  AUTHENTICATION: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
};

const TABS = [
  { id: 'ALL', label: 'All', dot: 'bg-muted-foreground' },
  { id: 'MARKETING', label: 'Marketing', dot: 'bg-blue-500' },
  { id: 'UTILITY', label: 'Utility', dot: 'bg-emerald-500' },
  { id: 'AUTHENTICATION', label: 'Authentication', dot: 'bg-purple-500' },
] as const;

export function LibraryPickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [metaCat, setMetaCat] = useState<'ALL' | 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('ALL');

  const list = useMemo(() => {
    const q = search.toLowerCase();
    return PRE_APPROVED_TEMPLATES.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesMeta = metaCat === 'ALL' || t.metaCategory === metaCat;
      return matchesSearch && matchesMeta;
    });
  }, [search, metaCat]);

  const handlePick = (t: PreApprovedTemplate) => {
    onSelect({
      name: t.name.toLowerCase().replace(/\s+/g, '_'),
      category: t.metaCategory,
      body: t.body,
      variables: t.variables,
    });
    onOpenChange(false);
  };

  const countFor = (id: string) =>
    id === 'ALL' ? PRE_APPROVED_TEMPLATES.length : PRE_APPROVED_TEMPLATES.filter((t) => t.metaCategory === id).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Choose a template</DialogTitle>
              <DialogDescription className="text-xs">
                Pick a ready-made template to start. You can edit it before submitting.
              </DialogDescription>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Simple category tabs */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {TABS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetaCat(m.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                  metaCat === m.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border/60 hover:border-foreground/40'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', m.dot)} />
                {m.label}
                <span className={cn(
                  'text-[10px] px-1.5 rounded-full',
                  metaCat === m.id ? 'bg-background/20' : 'bg-muted'
                )}>
                  {countFor(m.id)}
                </span>
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Templates list */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="px-6 py-5">
            <p className="text-xs text-muted-foreground mb-4">
              Showing <span className="font-semibold text-foreground">{list.length}</span> templates
            </p>

            {list.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-12 w-12 rounded-full bg-muted items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No templates found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search or category.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {list.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handlePick(t)}
                    className="group text-left rounded-xl border border-border/60 bg-card p-5 hover:border-primary hover:shadow-md transition-all"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base leading-tight mb-1">{t.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                      </div>
                      <span className={cn(
                        'shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md border',
                        META_BADGE[t.metaCategory]
                      )}>
                        {t.metaCategory}
                      </span>
                    </div>

                    {/* Body preview - bigger */}
                    <div className="rounded-lg bg-muted/40 border border-border/40 p-4 mb-3">
                      <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap line-clamp-6">
                        {t.body}
                      </p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[11px]">
                          {t.category}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Pre-approved style
                        </span>
                        {t.variables.length > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            {t.variables.length} variable{t.variables.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        Use
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
