import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { csvToDealRows, type ParsedDealRow } from '@/lib/crmCsv';
import { toast } from 'sonner';
import type { PipelineStage } from '@/types/crm';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stages: PipelineStage[];
  pipelineId: string;
  onCreate: (input: any) => Promise<any>;
  onImported: () => void;
}

export function ImportDealsDialog({ open, onOpenChange, stages, pipelineId, onCreate, onImported }: Props) {
  const [rows, setRows] = useState<ParsedDealRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [defaultStageId, setDefaultStageId] = useState<string>(stages[0]?.id || '');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setRows([]); setErrors([]); setProgress({ done: 0, total: 0, failed: 0 }); };

  const onFile = async (file: File) => {
    reset();
    const text = await file.text();
    const { rows: parsed, errors: errs } = csvToDealRows(text);
    setRows(parsed);
    setErrors(errs);
    if (parsed.length === 0 && errs.length === 0) setErrors(['No valid rows found.']);
  };

  const runImport = async () => {
    if (!pipelineId || !defaultStageId) return;
    setImporting(true);
    setProgress({ done: 0, total: rows.length, failed: 0 });
    const stageByName = new Map(stages.map(s => [s.name.toLowerCase(), s.id]));
    let failed = 0;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const stageId = (r.stage && stageByName.get(r.stage.toLowerCase())) || defaultStageId;
      try {
        const res = await onCreate({
          title: r.title,
          company_name: r.company_name || null,
          value: r.value || 0,
          currency: r.currency || 'USD',
          priority: (['low','normal','high','urgent'].includes(r.priority || '') ? r.priority : 'normal'),
          status: (['open','won','lost'].includes(r.status || '') ? r.status : 'open'),
          stage_id: stageId,
          pipeline_id: pipelineId,
          lead_source: r.lead_source || null,
          tags: r.tags || [],
          expected_close_date: r.expected_close_date || null,
        });
        if (!res) failed++;
      } catch {
        failed++;
      }
      setProgress({ done: i + 1, total: rows.length, failed });
    }
    setImporting(false);
    toast.success(`Imported ${rows.length - failed} of ${rows.length} deals`);
    onImported();
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!importing) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import deals from CSV</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Required column: <code className="font-mono">title</code>. Optional: company_name, value, currency, priority, status, stage, lead_source, tags, expected_close_date.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {rows.length === 0 ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border border-dashed border-border/60 hover:border-primary/60 hover:bg-primary/5 transition py-10 flex flex-col items-center gap-2 text-sm text-muted-foreground"
            >
              <Upload className="h-7 w-7" />
              <span className="font-medium text-foreground">Click to upload a CSV file</span>
              <span className="text-xs">or drag &amp; drop</span>
            </button>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{rows.length} valid rows ready to import</span>
              </div>
              <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-0.5 font-mono">
                {rows.slice(0, 5).map((r, i) => (
                  <div key={i} className="truncate">{r.title} · {r.value} {r.currency} · {r.stage || '(default stage)'}</div>
                ))}
                {rows.length > 5 && <div>...and {rows.length - 5} more</div>}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div>{errors.join(' ')}</div>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Default stage (for rows without a stage column)</label>
              <Select value={defaultStageId} onValueChange={setDefaultStageId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {importing && (
            <div className="rounded-lg bg-muted/40 p-2.5 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Importing {progress.done}/{progress.total}{progress.failed ? ` (${progress.failed} failed)` : ''}</span>
              <div className="h-1 w-24 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        />

        <DialogFooter>
          {rows.length > 0 && (
            <Button variant="outline" onClick={reset} disabled={importing}>Choose different file</Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>Cancel</Button>
          <Button onClick={runImport} disabled={rows.length === 0 || !defaultStageId || importing}>
            {importing ? 'Importing...' : `Import ${rows.length || ''} deals`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
