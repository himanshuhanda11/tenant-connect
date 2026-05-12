import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, RefreshCw, Mail, Phone, Send, MessageCircle, Paperclip, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface ContactRequest {
  id: string;
  ticket_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  country: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string | null;
  message: string;
  status: 'new' | 'open' | 'in_progress' | 'replied' | 'closed' | 'cancelled';
  source_page: string | null;
  attachment_url: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface Reply {
  id: string;
  request_id: string;
  body: string;
  is_internal: boolean;
  created_at: string;
  author_id: string | null;
}

const STATUSES: ContactRequest['status'][] = ['new','open','in_progress','replied','closed','cancelled'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 border-blue-200',
  open: 'bg-amber-500/10 text-amber-700 border-amber-200',
  in_progress: 'bg-purple-500/10 text-purple-700 border-purple-200',
  replied: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-500/10 text-slate-700 border-slate-200',
  cancelled: 'bg-red-500/10 text-red-700 border-red-200',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  high: 'bg-orange-500/10 text-orange-700 border-orange-200',
  urgent: 'bg-red-500/10 text-red-700 border-red-200',
};
const CATEGORIES = [
  ['live_chat','Live Chat'], ['demo','Book Demo'], ['technical','Technical Support'],
  ['billing','Billing'], ['whatsapp_api','WhatsApp API Setup'], ['meta_charges','Meta Charges'],
  ['payment_plans','Payment Plans'], ['account','Account / Workspace'], ['feature_request','Feature Request'], ['other','Other'],
];
const catLabel = (k: string) => CATEGORIES.find(c => c[0] === k)?.[1] || k;

export default function AdminContactRequests() {
  const [rows, setRows] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [active, setActive] = useState<ContactRequest | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('contact_requests').select('*').order('created_at', { ascending: false }).limit(500);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter as any);
    if (categoryFilter !== 'all') q = q.eq('category', categoryFilter as any);
    if (priorityFilter !== 'all') q = q.eq('priority', priorityFilter as any);
    const { data, error } = await q;
    if (error) toast({ title: 'Failed to load requests', description: error.message, variant: 'destructive' });
    else setRows((data as any) || []);
    setLoading(false);
  }, [statusFilter, categoryFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter(r =>
      r.full_name?.toLowerCase().includes(s) ||
      r.email?.toLowerCase().includes(s) ||
      r.phone?.toLowerCase().includes(s) ||
      r.ticket_id?.toLowerCase().includes(s) ||
      r.business_name?.toLowerCase().includes(s)
    );
  }, [rows, search]);

  const openDrawer = async (r: ContactRequest) => {
    setActive(r);
    setReplyBody(''); setInternalNote('');
    const { data } = await supabase.from('contact_request_replies')
      .select('*').eq('request_id', r.id).order('created_at', { ascending: true });
    setReplies((data as any) || []);
  };

  const updateRequest = async (patch: Partial<ContactRequest>) => {
    if (!active) return;
    const { error } = await supabase.from('contact_requests').update(patch).eq('id', active.id);
    if (error) return toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    setActive((a) => a ? { ...a, ...patch } as ContactRequest : a);
    setRows((rs) => rs.map(r => r.id === active.id ? { ...r, ...patch } as ContactRequest : r));
    toast({ title: 'Updated' });
  };

  const sendReply = async () => {
    if (!active || !replyBody.trim()) return;
    setSending(true);
    try {
      const { data: ins, error } = await supabase.from('contact_request_replies').insert({
        request_id: active.id, body: replyBody.trim(), is_internal: false,
      }).select('*').single();
      if (error) throw error;

      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'contact-request-reply',
          recipientEmail: active.email,
          idempotencyKey: `contact-reply-${ins.id}`,
          templateData: {
            recipientName: active.full_name.split(' ')[0],
            ticketId: active.ticket_id,
            categoryLabel: catLabel(active.category),
            replyBody: replyBody.trim(),
            originalSubject: active.subject || catLabel(active.category),
          },
        },
      });

      await supabase.from('contact_requests').update({ status: 'replied' }).eq('id', active.id);
      toast({ title: 'Reply sent' });
      setReplyBody('');
      setReplies((rs) => [...rs, ins as any]);
      setActive((a) => a ? { ...a, status: 'replied' } : a);
      setRows((rs) => rs.map(r => r.id === active.id ? { ...r, status: 'replied' } : r));
    } catch (e: any) {
      toast({ title: 'Reply failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const addInternalNote = async () => {
    if (!active || !internalNote.trim()) return;
    const { data: ins, error } = await supabase.from('contact_request_replies').insert({
      request_id: active.id, body: internalNote.trim(), is_internal: true,
    }).select('*').single();
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    setInternalNote('');
    setReplies((rs) => [...rs, ins as any]);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Requests</h1>
        <p className="text-sm text-muted-foreground">All enquiries submitted from /contact across the website.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search ticket, email, phone, name…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map(([k,l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {['low','medium','high','urgent'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => openDrawer(r)}>
                    <TableCell className="font-mono text-xs font-bold text-emerald-700">{r.ticket_id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{catLabel(r.category)}</TableCell>
                    <TableCell><Badge variant="outline" className={PRIORITY_COLORS[r.priority]}>{r.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_COLORS[r.status]}>{r.status.replace('_',' ')}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'dd MMM, HH:mm')}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No requests yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-sm font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded">{active.ticket_id}</code>
                  <Badge variant="outline" className={PRIORITY_COLORS[active.priority]}>{active.priority}</Badge>
                  <Badge variant="outline" className={STATUS_COLORS[active.status]}>{active.status.replace('_',' ')}</Badge>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="Name" value={active.full_name} />
                  <Info label="Category" value={catLabel(active.category)} />
                  <Info label="Email" value={<a href={`mailto:${active.email}`} className="text-primary"><Mail className="w-3 h-3 inline mr-1" />{active.email}</a>} />
                  <Info label="Phone" value={active.phone ? <a href={`tel:${active.phone}`} className="text-primary"><Phone className="w-3 h-3 inline mr-1" />{active.phone}</a> : '—'} />
                  <Info label="Business" value={active.business_name || '—'} />
                  <Info label="Country" value={active.country || '—'} />
                  <Info label="Submitted" value={format(new Date(active.created_at), 'PPP HH:mm')} />
                  <Info label="Source" value={active.source_page || '—'} />
                </div>

                {active.subject && <Info label="Subject" value={active.subject} />}

                <div>
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide mb-1">Message</div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{active.message}</div>
                </div>

                {active.metadata && Object.keys(active.metadata).length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide mb-1">Additional details</div>
                    <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
                      {Object.entries(active.metadata).filter(([_,v]) => v).map(([k,v]) => (
                        <div key={k}><span className="text-muted-foreground">{k.replace(/_/g,' ')}:</span> <span className="font-medium">{String(v)}</span></div>
                      ))}
                    </div>
                  </div>
                )}

                {active.attachment_url && (
                  <a href={active.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Paperclip className="w-4 h-4" /> View attachment
                  </a>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={active.status} onValueChange={(v) => updateRequest({ status: v as any, closed_at: v === 'closed' ? new Date().toISOString() : null })}>
                    <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={active.priority} onValueChange={(v) => updateRequest({ priority: v as any })}>
                    <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{['low','medium','high','urgent'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  {active.phone && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5 ml-auto">
                      <a href={`https://wa.me/${active.phone.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </Button>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide">Conversation</div>
                  {replies.length === 0 && <p className="text-xs text-muted-foreground">No replies yet.</p>}
                  {replies.map(rep => (
                    <div key={rep.id} className={`rounded-lg p-3 text-sm border ${rep.is_internal ? 'bg-amber-500/5 border-amber-500/30' : 'bg-emerald-500/5 border-emerald-500/30'}`}>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide mb-1 flex items-center gap-1">
                        {rep.is_internal && <Lock className="w-3 h-3" />}
                        {rep.is_internal ? 'Internal note' : 'Reply to customer'} · {format(new Date(rep.created_at), 'dd MMM HH:mm')}
                      </div>
                      <div className="whitespace-pre-wrap">{rep.body}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="text-xs font-semibold">Reply to customer (sends email)</div>
                  <Textarea rows={4} value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder="Type a reply…" />
                  <Button size="sm" onClick={sendReply} disabled={sending || !replyBody.trim()} className="gap-1.5">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send reply
                  </Button>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="text-xs font-semibold flex items-center gap-1.5"><Lock className="w-3 h-3" /> Internal note (admin-only)</div>
                  <Textarea rows={2} value={internalNote} onChange={e => setInternalNote(e.target.value)} placeholder="Add a private note…" />
                  <Button size="sm" variant="outline" onClick={addInternalNote} disabled={!internalNote.trim()}>Save note</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
