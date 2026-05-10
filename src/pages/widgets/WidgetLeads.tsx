import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget } from '@/hooks/useWidgets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Inbox, Search, Phone, Mail, MessageSquare,
  ExternalLink, RefreshCw, Globe, Smartphone, Monitor,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  page_url: string | null;
  device: string | null;
  country: string | null;
  created_at: string;
  contact_id: string | null;
};

export default function WidgetLeads() {
  const { id } = useParams<{ id: string }>();
  const { widget } = useWidget(id);
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function load() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('widget_leads')
      .select('id,name,phone,email,message,page_url,device,country,created_at,contact_id')
      .eq('widget_id', id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error('Failed to load leads');
    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function openInInbox(lead: Lead) {
    if (!lead.phone || !widget?.tenant_id) {
      toast.error('No phone on this lead');
      return;
    }
    const wa_id = lead.phone.replace(/\D/g, '');
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('tenant_id', widget.tenant_id)
      .eq('wa_id', wa_id)
      .maybeSingle();
    if (!contact?.id) {
      navigate(`/inbox?source=website_widget`);
      return;
    }
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', widget.tenant_id)
      .eq('contact_id', contact.id)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (conv?.id) navigate(`/inbox?conversation=${conv.id}`);
    else navigate(`/inbox?source=website_widget`);
  }

  const filtered = leads.filter((l) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return [l.name, l.phone, l.email, l.message].some((v) => (v || '').toLowerCase().includes(s));
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${id}`)}>
            <ArrowLeft className="h-4 w-4" /> Back to builder
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              onClick={() => navigate('/inbox?source=website_widget')}>
              <Inbox className="h-4 w-4" /> Open Inbox
            </Button>
          </div>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                Widget leads — {widget?.name || 'Widget'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Every form submission is captured here and pushed into your WhatsApp Inbox as a conversation.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email…" className="pl-9 h-9" />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading leads…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No leads yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Once visitors submit your widget form, they'll appear here and in your Inbox.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((l) => (
                <div key={l.id}
                  className="group flex items-start gap-3 p-3 rounded-xl border bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5 transition">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {(l.name || l.phone || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{l.name || 'Anonymous visitor'}</span>
                      <Badge variant="secondary" className="text-[10px] h-5">Website widget</Badge>
                      {l.contact_id && (
                        <Badge className="text-[10px] h-5 bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          In Inbox
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                      {l.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</span>}
                      {l.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span>}
                      {l.device === 'mobile'
                        ? <span className="inline-flex items-center gap-1"><Smartphone className="h-3 w-3" />Mobile</span>
                        : l.device === 'desktop'
                        ? <span className="inline-flex items-center gap-1"><Monitor className="h-3 w-3" />Desktop</span>
                        : null}
                      {l.country && <span>{l.country}</span>}
                    </div>
                    {l.message && (
                      <p className="text-xs mt-2 bg-muted/50 rounded-md px-2.5 py-1.5 line-clamp-2">{l.message}</p>
                    )}
                    {l.page_url && (
                      <a href={l.page_url} target="_blank" rel="noopener" className="text-[11px] text-primary mt-1 inline-flex items-center gap-1 hover:underline">
                        <ExternalLink className="h-3 w-3" />{l.page_url}
                      </a>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => openInInbox(l)}>
                    <Inbox className="h-3.5 w-3.5" /> Open chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
