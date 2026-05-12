import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Library, Sparkles } from 'lucide-react';
import { PRE_APPROVED_TEMPLATES, TEMPLATE_CATEGORIES, PreApprovedTemplate } from '@/data/preApprovedTemplates';

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

export function LibraryPickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const list = useMemo(() => {
    return PRE_APPROVED_TEMPLATES.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = category === 'All' || t.category === category;
      return matchesSearch && matchesCat;
    });
  }, [search, category]);

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
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            Use from Library
          </DialogTitle>
          <DialogDescription>
            50+ ready-made WhatsApp templates. Pick one to pre-fill the builder.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {TEMPLATE_CATEGORIES.map((c) => (
                <Button
                  key={c.name}
                  size="sm"
                  variant={category === c.name ? 'default' : 'outline'}
                  className="rounded-full h-7 text-xs shrink-0"
                  onClick={() => setCategory(c.name)}
                >
                  {c.name}
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1">
                    {c.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          {list.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No templates match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t)}
                  className="text-left rounded-lg border p-3 hover:border-primary hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-medium text-sm">{t.name}</div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {t.metaCategory}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {t.description}
                  </p>
                  <div className="text-[11px] text-muted-foreground/80 line-clamp-2 whitespace-pre-wrap bg-muted/40 rounded p-2">
                    {t.body}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                    <span className="text-[11px] text-primary opacity-0 group-hover:opacity-100 inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Use this
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
