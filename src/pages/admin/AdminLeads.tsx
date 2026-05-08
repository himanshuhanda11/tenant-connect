import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, Download, RefreshCw, Mail, Phone, Globe, Building2, Calendar, MessageSquare } from 'lucide-react';
import { TableSkeleton } from '@/components/admin/AdminSkeletons';
import { format } from 'date-fns';

interface Lead {
  id: string;
  source: 'contact' | 'demo';
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  industry: string | null;
  team_size: string | null;
  use_case: string | null;
  message: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  timezone: string | null;
  status: string;
  internal_notes: string | null;
  metadata: any;
  created_at: string;
  referrer: string | null;
}

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 border-blue-200',
  contacted: 'bg-amber-500/10 text-amber-700 border-amber-200',
  qualified: 'bg-purple-500/10 text-purple-700 border-purple-200',
  converted: 'bg-green-500/10 text-green-700 border-green-200',
  closed: 'bg-slate-500/10 text-slate-700 border-slate-200',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'contact' | 'demo'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [active, setActive] = useState<Lead | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('marketing_leads').select('*').order('created_at', { ascending: false }).limit(500);
    if (sourceFilter !== 'all') q = q.eq('source', sourceFilter);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data, error } = await q;
    if (error) {
      toast({ title: 'Failed to load leads', description: error.message, variant: 'destructive' });
    } else {
      setLeads((data as Lead[]) || []);
    }
    setLoading(false);
  }, [sourceFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.full_name?.toLowerCase().includes(s) ||
      l.email?.toLowerCase().includes(s) ||
      l.company?.toLowerCase().includes(s) ||
      l.phone?.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: leads.length,
    demo: leads.filter((l) => l.source === 'demo').length,
    contact: leads.filter((l) => l.source === 'contact').length,
    newCount: leads.filter((l) => l.status === 'new').length,
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('marketing_leads').update({ status }).eq('id', id);
    if (error) return toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    if (active?.id === id) setActive({ ...active, status });
    toast({ title: 'Status updated' });
  };

  const saveNotes = async () => {
    if (!active) return;
    setSavingNotes(true);
    const { error } = await supabase
      .from('marketing_leads')
      .update({ internal_notes: active.internal_notes })
      .eq('id', active.id);
    setSavingNotes(false);
    if (error) return toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    setLeads((ls) => ls.map((l) => (l.id === active.id ? { ...l, internal_notes: active.internal_notes } : l)));
    toast({ title: 'Notes saved' });
  };

  const exportCsv = () => {
    const headers = ['Created', 'Source', 'Status', 'Name', 'Email', 'Phone', 'Company', 'Industry', 'Team Size', 'Preferred', 'Message'];
    const rows = filtered.map((l) => [
      l.created_at, l.source, l.status, l.full_name, l.email, l.phone || '', l.company || '',
      l.industry || '', l.team_size || '',
      l.preferred_date ? `${l.preferred_date} ${l.preferred_time || ''} ${l.timezone || ''}` : '',
      (l.message || '').replace(/\n/g, ' '),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Marketing Leads</h1>
          <p className="text-sm text-muted-foreground">Submissions from the public Contact and Book a Demo forms.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Demo Requests', value: stats.demo },
          { label: 'Contact Forms', value: stats.contact },
          { label: 'New / Untouched', value: stats.newCount },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search name, email, company, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={sourceFilter} onValueChange={(v: any) => setSourceFilter(v)}>
              <SelectTrigger className="w-full md:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && filtered.length === 0 ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No leads yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setActive(l)}>
                      <TableCell className="text-xs whitespace-nowrap">{format(new Date(l.created_at), 'MMM d, HH:mm')}</TableCell>
                      <TableCell><Badge variant={l.source === 'demo' ? 'default' : 'secondary'}>{l.source}</Badge></TableCell>
                      <TableCell className="font-medium">{l.full_name}</TableCell>
                      <TableCell className="text-xs">
                        <div>{l.email}</div>
                        {l.phone && <div className="text-muted-foreground">{l.phone}</div>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{l.company || '—'}</TableCell>
                      <TableCell><Badge className={STATUS_COLORS[l.status] || ''} variant="outline">{l.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {active.full_name}
                  <Badge variant={active.source === 'demo' ? 'default' : 'secondary'}>{active.source}</Badge>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button key={s} size="sm" variant={active.status === s ? 'default' : 'outline'}
                      onClick={() => updateStatus(active.id, s)}>{s}</Button>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><a className="text-primary hover:underline" href={`mailto:${active.email}`}>{active.email}</a></div>
                  {active.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><a className="text-primary hover:underline" href={`https://wa.me/${active.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">{active.phone}</a></div>}
                  {active.company && <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" />{active.company}</div>}
                  {active.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /><a className="text-primary hover:underline" href={active.website} target="_blank" rel="noreferrer">{active.website}</a></div>}
                  {active.industry && <div className="text-muted-foreground"><span className="font-medium text-foreground">Industry:</span> {active.industry}</div>}
                  {active.team_size && <div className="text-muted-foreground"><span className="font-medium text-foreground">Team size:</span> {active.team_size}</div>}
                  {active.use_case && <div className="text-muted-foreground"><span className="font-medium text-foreground">Use case:</span> {active.use_case}</div>}
                  {active.preferred_date && (
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{active.preferred_date} • {active.preferred_time} ({active.timezone})</div>
                  )}
                  <div className="text-xs text-muted-foreground pt-2">Submitted {format(new Date(active.created_at), 'PPpp')}</div>
                </div>

                {active.message && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Message</p>
                    <div className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">{active.message}</div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Internal notes</p>
                  <Textarea rows={4} value={active.internal_notes || ''} onChange={(e) => setActive({ ...active, internal_notes: e.target.value })} placeholder="Add private notes for the team…" />
                  <Button size="sm" className="mt-2" onClick={saveNotes} disabled={savingNotes}>
                    {savingNotes && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}Save notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
