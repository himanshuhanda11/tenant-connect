import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Check, Plus, Settings2, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pipeline } from '@/types/crm';

interface Props {
  pipelines: Pipeline[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<string | null>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onManageStages: () => void;
}

export function PipelineSwitcher({
  pipelines, selectedId, onSelect, onCreate, onRename, onDelete, onManageStages,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'list' | 'new' | 'rename'>('list');
  const [name, setName] = useState('');
  const [renameTarget, setRenameTarget] = useState<Pipeline | null>(null);

  const current = pipelines.find(p => p.id === selectedId);

  const reset = () => { setMode('list'); setName(''); setRenameTarget(null); };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <PopoverTrigger asChild>
        <button className="group flex items-center gap-1.5 min-w-0 text-left">
          <h1 className="text-base md:text-lg font-bold truncate">{current?.name || 'Sales Pipeline'}</h1>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0 overflow-hidden">
        {mode === 'list' && (
          <>
            <div className="px-3 py-2 border-b border-border/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pipelines
            </div>
            <div className="max-h-[260px] overflow-y-auto py-1">
              {pipelines.map(p => (
                <div key={p.id} className="group flex items-center gap-1 px-1">
                  <button
                    onClick={() => { onSelect(p.id); setOpen(false); }}
                    className={cn(
                      'flex-1 flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted/60 text-left',
                      p.id === selectedId && 'bg-muted/60'
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{p.name}</span>
                      {p.is_default && (
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border/60 px-1 rounded">default</span>
                      )}
                    </span>
                    {p.id === selectedId && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-1">
                    <button
                      onClick={() => { setRenameTarget(p); setName(p.name); setMode('rename'); }}
                      className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Rename"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {!p.is_default && pipelines.length > 1 && (
                      <button
                        onClick={async () => { if (confirm(`Delete pipeline "${p.name}" and all its deals?`)) await onDelete(p.id); }}
                        className="h-6 w-6 rounded hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/60 p-1">
              <button
                onClick={() => setMode('new')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-muted/60 text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Create new pipeline
              </button>
              <button
                onClick={() => { onManageStages(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-muted/60"
              >
                <Settings2 className="h-3.5 w-3.5" /> Edit stages of current pipeline
              </button>
            </div>
          </>
        )}

        {(mode === 'new' || mode === 'rename') && (
          <div className="p-3 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {mode === 'new' ? 'New pipeline' : `Rename "${renameTarget?.name}"`}
              </p>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'new' ? 'e.g. Enterprise deals' : 'New name'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    if (mode === 'new') onCreate(name.trim()).then(() => { reset(); setOpen(false); });
                    else if (renameTarget) onRename(renameTarget.id, name.trim()).then(() => { reset(); });
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
              <Button
                size="sm"
                disabled={!name.trim()}
                onClick={async () => {
                  if (mode === 'new') { await onCreate(name.trim()); reset(); setOpen(false); }
                  else if (renameTarget) { await onRename(renameTarget.id, name.trim()); reset(); }
                }}
              >
                {mode === 'new' ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
