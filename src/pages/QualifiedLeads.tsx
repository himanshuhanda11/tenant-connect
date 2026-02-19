import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Target,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Loader2,
  Calendar,
  RefreshCw,
  MoreVertical,
  Ban,
  ThumbsDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const STAGE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  new: { label: 'New', icon: <HelpCircle className="h-3 w-3" />, color: 'bg-blue-100 text-blue-700' },
  qualifying: { label: 'Qualifying', icon: <Target className="h-3 w-3" />, color: 'bg-amber-100 text-amber-700' },
  qualified: { label: 'Qualified', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-100 text-green-700' },
  needs_agent: { label: 'Needs Agent', icon: <AlertCircle className="h-3 w-3" />, color: 'bg-red-100 text-red-700' },
  unqualified: { label: 'Unqualified', icon: <XCircle className="h-3 w-3" />, color: 'bg-gray-100 text-gray-600' },
  not_relevant: { label: 'Not Relevant', icon: <ThumbsDown className="h-3 w-3" />, color: 'bg-slate-100 text-slate-600' },
  abuse: { label: 'Abuse', icon: <Ban className="h-3 w-3" />, color: 'bg-red-200 text-red-800' },
};

export default function QualifiedLeads() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');

  const fetchLeads = async () => {
    if (!currentTenant?.id) return;
    setLoading(true);

    let query = supabase
      .from('qualified_leads')
      .select('*, contacts:contact_id(name, wa_id)')
      .eq('workspace_id', currentTenant.id)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (stageFilter !== 'all') {
      query = query.eq('lead_stage', stageFilter as any);
    }
    if (intentFilter !== 'all') {
      query = query.eq('intent', intentFilter);
    }

    const { data } = await query;
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [currentTenant?.id, stageFilter, intentFilter]);

  const markLead = async (leadId: string, stage: string) => {
    const { error } = await supabase.from('qualified_leads')
      .update({ lead_stage: stage as any })
      .eq('id', leadId);
    if (error) {
      toast.error('Failed to update lead');
    } else {
      toast.success(`Lead marked as ${STAGE_CONFIG[stage]?.label || stage}`);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, lead_stage: stage } : l));
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!search) return true;
    const s = search.toLowerCase();
    const contactName = (lead.contacts as any)?.name?.toLowerCase() || '';
    const contactWaId = (lead.contacts as any)?.wa_id?.toLowerCase() || '';
    const intent = lead.intent?.toLowerCase() || '';
    return contactName.includes(s) || contactWaId.includes(s) || intent.includes(s);
  });

  // Get unique intents for filter
  const uniqueIntents = [...new Set(leads.map(l => l.intent).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Qualified Leads
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-captured leads from conversations
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or intent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Lead Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.entries(STAGE_CONFIG).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={intentFilter} onValueChange={setIntentFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Intent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intents</SelectItem>
                  {uniqueIntents.map(intent => (
                    <SelectItem key={intent} value={intent}>{intent.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(STAGE_CONFIG).map(([key, conf]) => {
            const count = leads.filter(l => l.lead_stage === key).length;
            return (
              <Card
                key={key}
                className={cn("cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all", stageFilter === key && "ring-2 ring-primary")}
                onClick={() => setStageFilter(stageFilter === key ? 'all' : key)}
              >
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {conf.icon}
                    <span className="text-xs text-muted-foreground">{conf.label}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Leads List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No leads found</p>
                <p className="text-sm mt-1">AI will capture leads as conversations come in</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                <div className="divide-y">
                  {filteredLeads.map(lead => {
                    const contact = lead.contacts as any;
                    const stageConf = STAGE_CONFIG[lead.lead_stage] || STAGE_CONFIG.new;
                    const captured = (typeof lead.captured === 'object' && lead.captured) ? lead.captured as Record<string, any> : {};
                    const capturedCount = Object.keys(captured).filter(k => captured[k] != null && captured[k] !== '').length;

                    return (
                      <div
                        key={lead.id}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          // Navigate to conversation if we have one
                          // For now navigate to inbox — in real impl this would use conversation_id from lead
                          navigate('/inbox');
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {contact?.name || contact?.wa_id || 'Unknown'}
                            </span>
                            <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5", stageConf.color)}>
                              {stageConf.icon}
                              {stageConf.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {lead.intent && lead.intent !== 'unknown' && (
                              <span className="capitalize">{lead.intent.replace(/_/g, ' ')}</span>
                            )}
                            <span>{capturedCount} field{capturedCount !== 1 ? 's' : ''} captured</span>
                            <span>{formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lead.confidence != null && (
                            <Badge variant="secondary" className="text-[10px] h-5">
                              <Sparkles className="h-3 w-3 mr-0.5" />
                              {Math.round(lead.confidence * 100)}%
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                              {Object.entries(STAGE_CONFIG)
                                .filter(([key]) => key !== lead.lead_stage)
                                .map(([key, conf]) => (
                                  <DropdownMenuItem key={key} onClick={() => markLead(lead.id, key)}>
                                    <span className="mr-2">{conf.icon}</span>
                                    Mark as {conf.label}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); navigate('/inbox'); }}>
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
