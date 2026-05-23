import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, Trophy, X } from 'lucide-react';
import { useStageMutations } from '@/hooks/useCrmPipelines';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/types/crm';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pipelineId: string | null;
  tenantId: string | undefined;
  stages: PipelineStage[];
  onChanged: () => void;
}

interface DraftStage extends PipelineStage { _isNew?: boolean; _dirty?: boolean; }

const PALETTE = ['#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

export function StagesEditorDialog({ open, onOpenChange, pipelineId, tenantId, stages, onChanged }: Props) {
  const { create, update, remove, reorder } = useStageMutations(pipelineId, tenantId);
  const [draft, setDraft] = useState<DraftStage[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setDraft(stages.map(s => ({ ...s })));
  }, [open, stages]);

  const setItem = (id: string, patch: Partial<DraftStage>) => {
    setDraft(d => d.map(s => s.id === id ? { ...s, ...patch, _dirty: !s._isNew } : s));
  };

  const addStage = () => {
    const tmpId = `new-${Date.now()}`;
    setDraft(d => [...d, {
      id: tmpId, tenant_id: tenantId || '', pipeline_id: pipelineId || '',
      name: 'New stage', color: PALETTE[d.length % PALETTE.length],
      stage_order: d.length, is_won: false, is_lost: false, probability: 25,
      _isNew: true,
    }]);
  };

  const removeLocal = (id: string) => setDraft(d => d.filter(s => s.id !== id));

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setDraft(d => {
      const from = d.findIndex(s => s.id === dragId);
      const to = d.findIndex(s => s.id === overId);
      if (from === -1 || to === -1) return d;
      const copy = [...d];
      const [m] = copy.splice(from, 1);
      copy.splice(to, 0, m);
      return copy;
    });
  };

  const save = async () => {
    if (!pipelineId) return;
    setSaving(true);
    // Removed stages = stages present originally but missing from draft
    const draftIds = new Set(draft.map(s => s.id));
    const toRemove = stages.filter(s => !draftIds.has(s.id));
    for (const s of toRemove) {
      const ok = await remove(s.id);
      if (!ok) { setSaving(false); return; }
    }
    // Create new
    for (const s of draft.filter(s => s._isNew)) {
      await create({ name: s.name, color: s.color, probability: s.probability, is_won: s.is_won, is_lost: s.is_lost });
    }
    // Update changed
    for (const s of draft.filter(s => !s._isNew && s._dirty)) {
      await update(s.id, { name: s.name, color: s.color, probability: s.probability, is_won: s.is_won, is_lost: s.is_lost });
    }
    // Reorder all existing (non-new) — order indexes by current draft position
    const existingInOrder = draft.filter(s => !s._isNew).map(s => s.id);
    if (existingInOrder.length) await reorder(existingInOrder);

    setSaving(false);
    onChanged();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Edit pipeline stages</DialogTitle>
          <p className="text-xs text-muted-foreground">Drag to reorder. Mark a stage as Won or Lost to close deals automatically.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {draft.map(s => (
            <div
              key={s.id}
              draggable
              onDragStart={() => onDragStart(s.id)}
              onDragOver={(e) => onDragOver(e, s.id)}
              onDragEnd={() => setDragId(null)}
              className={cn(
                'rounded-xl border border-border/60 bg-card p-3 group',
                dragId === s.id && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                <ColorDot color={s.color} onPick={(c) => setItem(s.id, { color: c })} />
                <Input
                  value={s.name}
                  onChange={(e) => setItem(s.id, { name: e.target.value })}
                  className="h-8 flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Input
                    type="number" min={0} max={100}
                    value={s.probability}
                    onChange={(e) => setItem(s.id, { probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                    className="h-8 w-16 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <button
                  onClick={() => removeLocal(s.id)}
                  className="h-8 w-8 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-4 pl-7 mt-2">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Switch
                    checked={s.is_won}
                    onCheckedChange={(v) => setItem(s.id, { is_won: v, is_lost: v ? false : s.is_lost })}
                  />
                  <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-emerald-500" /> Won</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Switch
                    checked={s.is_lost}
                    onCheckedChange={(v) => setItem(s.id, { is_lost: v, is_won: v ? false : s.is_won })}
                  />
                  <span className="flex items-center gap-1"><X className="h-3 w-3 text-rose-500" /> Lost</span>
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={addStage}
            className="w-full rounded-xl border border-dashed border-border/60 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add stage
          </button>
        </div>

        <DialogFooter className="border-t border-border/60 px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || draft.length === 0}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColorDot({ color, onPick }: { color: string; onPick: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-6 w-6 rounded-md border border-border/60 shadow-sm"
        style={{ background: color }}
        aria-label="Pick color"
      />
      {open && (
        <div className="absolute z-10 mt-1 p-1.5 rounded-lg border border-border/60 bg-popover shadow-lg flex flex-wrap gap-1 w-[152px]">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => { onPick(c); setOpen(false); }}
              className={cn('h-5 w-5 rounded border border-border/60', color === c && 'ring-2 ring-primary')}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
