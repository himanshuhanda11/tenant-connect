import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface ParsedRow {
  raw: Record<string, string>;
  phone: string;
  name: string;
  normalized?: string;
  valid: boolean;
  reason?: string;
  duplicate?: boolean;
}

interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  contactIds: string[];
  tagId?: string | null;
  tagName?: string;
}

interface Props {
  onImported: (summary: ImportSummary) => void;
  defaultCountry?: string;
}

const SAMPLE_CSV = `phone,name,email,city,custom_1,custom_2,tags
+919876543210,Aman Kumar,aman@example.com,Mumbai,VIP,Order#1234,vip;repeat
+14155552671,Sara Khan,sara@example.com,New York,Gold,Order#5678,gold`;

export function CSVContactUploader({ onImported, defaultCountry = 'IN' }: Props) {
  const { currentTenant } = useTenant();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<ImportSummary | null>(null);

  const reset = () => {
    setRows([]);
    setFileName('');
    setImported(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadSample = () => {
    triggerDownload('broadcast-sample.csv', SAMPLE_CSV);
  };

  const downloadInvalid = () => {
    const invalid = rows.filter((r) => !r.valid || r.duplicate);
    if (invalid.length === 0) return;
    const headers = Object.keys(invalid[0].raw);
    const csv = [
      [...headers, 'reason'].join(','),
      ...invalid.map((r) =>
        [...headers.map((h) => JSON.stringify(r.raw[h] ?? '')), JSON.stringify(r.duplicate ? 'duplicate' : r.reason || 'invalid')].join(','),
      ),
    ].join('\n');
    triggerDownload('broadcast-invalid-rows.csv', csv);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setImported(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const seen = new Set<string>();
        const parsed: ParsedRow[] = results.data.map((raw) => {
          const phoneRaw = (raw.phone || raw.mobile || raw.whatsapp || raw.number || '').toString().trim();
          const name = (raw.name || raw.first_name || raw.full_name || '').toString().trim();
          if (!phoneRaw) {
            return { raw, phone: phoneRaw, name, valid: false, reason: 'missing phone' };
          }
          const parsedPhone = parsePhoneNumberFromString(phoneRaw, defaultCountry as any);
          if (!parsedPhone || !parsedPhone.isValid()) {
            return { raw, phone: phoneRaw, name, valid: false, reason: 'invalid number' };
          }
          const normalized = parsedPhone.number.replace('+', '');
          const dup = seen.has(normalized);
          seen.add(normalized);
          return { raw, phone: phoneRaw, name, normalized, valid: true, duplicate: dup };
        });
        setRows(parsed);
      },
      error: (err) => {
        toast.error(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const validRows = rows.filter((r) => r.valid && !r.duplicate);
  const invalidCount = rows.filter((r) => !r.valid).length;
  const duplicateCount = rows.filter((r) => r.duplicate).length;

  const importContacts = async () => {
    if (!currentTenant?.id || validRows.length === 0) return;
    setImporting(true);
    try {
      // 1. Ensure "Broadcast Upload" tag exists
      let tagId: string | null = null;
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('name', 'Broadcast Upload')
        .maybeSingle();
      if (existingTag?.id) {
        tagId = existingTag.id;
      } else {
        const { data: newTag, error: tagErr } = await supabase
          .from('tags')
          .insert({ tenant_id: currentTenant.id, name: 'Broadcast Upload', color: '#16a34a' })
          .select('id')
          .single();
        if (tagErr) throw tagErr;
        tagId = newTag.id;
      }

      // 2. Upsert contacts by (tenant_id, wa_id)
      const contactRows = validRows.map((r) => ({
        tenant_id: currentTenant.id,
        wa_id: r.normalized!,
        name: r.name || null,
        source: 'import',
        campaign_source: 'broadcast_csv',
      }));

      const { data: upserted, error: upsertErr } = await supabase
        .from('contacts')
        .upsert(contactRows, { onConflict: 'tenant_id,wa_id', ignoreDuplicates: false })
        .select('id, wa_id');
      if (upsertErr) throw upsertErr;

      const contactIds = (upserted || []).map((c) => c.id);
      const idByWaId = new Map((upserted || []).map((c) => [c.wa_id, c.id]));

      // 3. Apply tag
      if (tagId && contactIds.length > 0) {
        const tagRows = contactIds.map((cid) => ({ contact_id: cid, tag_id: tagId! }));
        await supabase.from('contact_tags').upsert(tagRows, { onConflict: 'contact_id,tag_id', ignoreDuplicates: true });
      }

      // 4. Save CSV row data as contact attributes (for variable mapping)
      const attrRows: any[] = [];
      validRows.forEach((r) => {
        const cid = idByWaId.get(r.normalized!);
        if (!cid) return;
        Object.entries(r.raw).forEach(([k, v]) => {
          if (!v) return;
          if (['phone', 'mobile', 'whatsapp', 'number'].includes(k)) return;
          attrRows.push({ tenant_id: currentTenant.id, contact_id: cid, key: k, value: String(v) });
        });
      });
      if (attrRows.length > 0) {
        // chunk to avoid request size limits
        for (let i = 0; i < attrRows.length; i += 500) {
          const chunk = attrRows.slice(i, i + 500);
          await supabase.from('contact_attributes').upsert(chunk, { onConflict: 'tenant_id,contact_id,key', ignoreDuplicates: false });
        }
      }

      const summary: ImportSummary = {
        total: rows.length,
        valid: validRows.length,
        invalid: invalidCount,
        duplicates: duplicateCount,
        contactIds,
      };
      setImported(summary);
      onImported(summary);
      toast.success(`Imported ${contactIds.length} contacts`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to import contacts');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Upload contacts from CSV
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Required column: <code className="px-1 bg-muted rounded">phone</code>. Optional: name, email, custom_1, etc. Numbers are normalized to E.164.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={downloadSample}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Sample
          </Button>
        </div>

        {rows.length === 0 && !imported && (
          <label
            className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drop CSV here or click to upload</p>
            <p className="text-xs text-muted-foreground">.csv up to 10 MB</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}

        {rows.length > 0 && !imported && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate">{fileName}</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SummaryTile label="Total rows" value={rows.length} />
              <SummaryTile label="Valid" value={validRows.length} tone="success" />
              <SummaryTile label="Duplicates" value={duplicateCount} tone="warning" />
              <SummaryTile label="Invalid" value={invalidCount} tone="danger" />
            </div>

            {(invalidCount > 0 || duplicateCount > 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>{invalidCount} invalid and {duplicateCount} duplicate rows will be skipped.</span>
                  <Button variant="outline" size="sm" onClick={downloadInvalid}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview first 5 valid rows */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 text-xs font-medium">Preview ({Math.min(5, validRows.length)} of {validRows.length})</div>
              <div className="divide-y text-sm">
                {validRows.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">+{r.normalized}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">valid</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={importContacts} disabled={importing || validRows.length === 0} className="w-full">
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Import {validRows.length} contacts & add to campaign
            </Button>
          </div>
        )}

        {imported && (
          <Alert className="bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="flex items-center justify-between gap-3 text-emerald-800">
              <span>
                {imported.contactIds.length} contacts added to this campaign. {imported.invalid + imported.duplicates} skipped.
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>
                Upload another
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'warning' | 'danger' }) {
  const colorMap = {
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  } as const;
  return (
    <div className="border rounded-lg px-3 py-2 text-center">
      <p className={`text-lg font-bold ${tone ? colorMap[tone] : ''}`}>{value.toLocaleString()}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
