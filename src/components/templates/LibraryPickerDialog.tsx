import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, Library, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PRE_APPROVED_TEMPLATES, TEMPLATE_CATEGORIES, PreApprovedTemplate } from '@/data/preApprovedTemplates';
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

export function LibraryPickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [metaCat, setMetaCat] = useState<'ALL' | 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('ALL');

  const list = useMemo(() => {
    return PRE_APPROVED_TEMPLATES.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = category === 'All' || t.category === category;
      const matchesMeta = metaCat === 'ALL' || t.metaCategory === metaCat;
      return matchesSearch && matchesCat && matchesMeta;
    });
  }, [search, category, metaCat]);

  const handlePick = (t: PreApprovedTemplate) => {
    onSelect({
      name: t.name.toLowerCase().replace(/\s+/g, '_'),
      category: t.metaCategory,
      body: t.body,
      variables: t.variables,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Template Library</DialogTitle>
              <DialogDescription className="text-xs">
                {PRE_APPROVED_TEMPLATES.length}+ ready-made WhatsApp templates · Pick one to pre-fill the builder
              </DialogDescription>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background border-border/60 focus-visible:ring-primary"
            />
          </div>

          {/* Meta category filter */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {([
              { id: 'ALL', label: 'All Types', dot: 'bg-muted-foreground' },
              { id: 'UTILITY', label: 'Utility', dot: 'bg-emerald-500' },
              { id: 'MARKETING', label: 'Marketing', dot: 'bg-blue-500' },
              { id: 'AUTHENTICATION', label: 'Auth', dot: 'bg-purple-500' },
            ] as const).map((m) => (
              <button
                key={m.id}
                onClick={() => setMetaCat(m.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  metaCat === m.id
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-background text-muted-foreground border-border/60 hover:border-foreground/40'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
                {m.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Industry tabs - horizontal scroll */}
        <div className="border-b bg-muted/20 px-6 py-3">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => setCategory('All')}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap',
                  category === 'All'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-foreground border-border/60 hover:border-primary/50 hover:bg-accent'
                )}
              >
                All
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-background/30">
                  {PRE_APPROVED_TEMPLATES.length}
                </Badge>
              </button>
              {TEMPLATE_CATEGORIES.filter(c => c.name !== 'All').map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap',
                    category === c.name
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-foreground border-border/60 hover:border-primary/50 hover:bg-accent'
                  )}
                >
                  {c.name}
                  <Badge variant="secondary" className={cn(
                    'h-4 px-1.5 text-[10px]',
                    category === c.name ? 'bg-background/30' : 'bg-muted'
                  )}>
                    {c.count}
                  </Badge>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>

        {/* Templates grid */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{list.length}</span> templates
              </p>
            </div>

            {list.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-12 w-12 rounded-full bg-muted items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No templates found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {list.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handlePick(t)}
                    className="group text-left rounded-xl border border-border/60 bg-card p-4 hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden"
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-2 relative">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h4 className="font-semibold text-sm leading-tight truncate">{t.name}</h4>
                          {t.isTrending && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-600 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                              🔥 HOT
                            </span>
                          )}
                          {t.isNew && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</p>
                      </div>
                      <span className={cn(
                        'shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                        META_BADGE[t.metaCategory]
                      )}>
                        {t.metaCategory}
                      </span>
                    </div>

                    {/* Body preview - full content */}
                    <div className="rounded-lg bg-muted/40 border border-border/40 p-3 mb-3 relative max-h-40 overflow-y-auto">
                      <p className="text-[12px] leading-relaxed text-foreground/85 whitespace-pre-wrap">
                        {t.body}
                      </p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between gap-2 relative">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 truncate max-w-[140px]">
                          {t.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                          {t.variables.length} vars
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        <Sparkles className="h-3 w-3" /> Use
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
