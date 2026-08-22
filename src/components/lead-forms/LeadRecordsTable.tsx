import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useLeadForms } from '@/hooks/useLeadForms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, RefreshCw, Search, Users, Phone, Mail, Download, ArrowDownToLine, FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type LeadRow = {
  id: string;
  lead_id: string | null;
  form_id: string | null;
  created_at: string;
  status: string;
  normalized_data: Record<string, any> | null;
};

function pick(data: Record<string, any> | null, keys: string[]): string | null {
  if (!data) return null;
  for (const k of keys) {
    const v = data[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return Array.isArray(v) ? String(v[0]) : String(v);
    }
  }
  return null;
}

export function LeadRecordsTable() {
  const { currentTenant } = useTenant();
  const { forms } = useLeadForms();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [q, setQ] = useState('');

  const formNames = useMemo(() => {
    const m = new Map<string, string>();
    forms.forEach((f) => m.set(f.form_id, f.form_name || f.form_id));
    return m;
  }, [forms]);

  const load = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    const query = supabase
      .from('lead_events')
      .select('id, lead_id, form_id, created_at, status, normalized_data')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false })
      .limit(500);
    const { data, error } = await query;
    if (error) toast.error('Failed to load leads');
    setRows((data ?? []) as LeadRow[]);
    setLoading(false);
  }, [currentTenant?.id]);

  useEffect(() => { load(); }, [load]);

  const leads = useMemo(() => {
    return rows.map((r) => {
      const d = r.normalized_data || {};
      return {
        id: r.id,
        lead_id: r.lead_id,
        form_id: r.form_id,
        created_at: r.created_at,
        status: r.status,
        name: pick(d, ['full_name', 'name', 'first_name']) ||
          [pick(d, ['first_name']), pick(d, ['last_name'])].filter(Boolean).join(' ') || null,
        phone: pick(d, ['phone_number', 'phone', 'mobile', 'whatsapp_number']),
        email: pick(d, ['email', 'email_address']),
        city: pick(d, ['city', 'state', 'location']),
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) =>
      [l.name, l.phone, l.email, l.city, l.lead_id, formNames.get(l.form_id || '')]
        .some((v) => (v || '').toLowerCase().includes(s)));
  }, [leads, q, formNames]);

  const importAll = async () => {
    if (!currentTenant?.id) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'backfill_form_leads', maxLeads: 5000 },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Imported ${data.total_inserted ?? 0} lead${data.total_inserted === 1 ? '' : 's'}`, {
          description: `Fetched ${data.total_fetched ?? 0} from Meta across ${data.results?.length ?? 0} form(s).`,
        });
        const firstError = data.results?.find((r: any) => r?.error)?.error;
        if (firstError) toast.error(firstError, { duration: 8000 });
      } else {
        toast.error(data?.error || 'Import failed');
      }
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const exportCsv = () => {
    const header = ['Name', 'Phone', 'Email', 'City', 'Form', 'Lead ID', 'Created'];
    const lines = filtered.map((l) => [
      l.name, l.phone, l.email, l.city, formNames.get(l.form_id || '') || l.form_id, l.lead_id, l.created_at,
    ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, form…" className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export
          </Button>
          <Button size="sm" className="h-9 text-xs" onClick={importAll} disabled={importing}>
            {importing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ArrowDownToLine className="h-3.5 w-3.5 mr-1.5" />}
            Import leads from Meta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">No lead records yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-5">
              Syncing forms only imports the form list. Click “Import leads from Meta” to pull the
              actual lead records for your forms — new leads then arrive automatically via webhook.
            </p>
            <Button size="sm" onClick={importAll} disabled={importing}>
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowDownToLine className="h-4 w-4 mr-2" />}
              Import leads from Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} lead{filtered.length === 1 ? '' : 's'}</p>
          <div className="space-y-2">
            {filtered.map((l) => (
              <Card key={l.id} className="border-border/60">
                <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {(l.name || l.phone || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{l.name || 'Unnamed lead'}</span>
                      {l.status !== 'success' && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{l.status}</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                      {l.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</span>}
                      {l.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span>}
                      {l.city && <span>{l.city}</span>}
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />{formNames.get(l.form_id || '') || l.form_id || '—'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
