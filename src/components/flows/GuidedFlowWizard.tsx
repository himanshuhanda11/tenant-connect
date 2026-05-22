import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plane, GraduationCap, Headphones, CalendarCheck2, Building2, Megaphone, MessageSquare,
  ChevronRight, ChevronLeft, Sparkles, Check, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface GuidedFlowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GOALS = [
  { id: 'visa', name: 'Visa Automation', icon: Plane, color: 'from-blue-500 to-cyan-500', desc: 'Visa enquiries → documents → consultant' },
  { id: 'study', name: 'Study Abroad', icon: GraduationCap, color: 'from-indigo-500 to-purple-500', desc: 'Lead capture → counsellor handoff' },
  { id: 'travel', name: 'Travel Enquiry', icon: Plane, color: 'from-emerald-500 to-teal-500', desc: 'Destination → dates → quote' },
  { id: 'lead', name: 'Lead Qualification', icon: Sparkles, color: 'from-amber-500 to-orange-500', desc: 'Qualify hot vs cold leads' },
  { id: 'support', name: 'WhatsApp Support', icon: Headphones, color: 'from-rose-500 to-pink-500', desc: 'FAQ → ticket → human' },
  { id: 'booking', name: 'Appointment Booking', icon: CalendarCheck2, color: 'from-violet-500 to-fuchsia-500', desc: 'Service → slot → confirmation' },
  { id: 'realestate', name: 'Real Estate', icon: Building2, color: 'from-slate-500 to-gray-700', desc: 'Property enquiry → site visit' },
  { id: 'campaign', name: 'Bulk Campaign', icon: Megaphone, color: 'from-red-500 to-orange-500', desc: 'Broadcast → reply → route' },
];

const TRIGGERS = [
  { id: 'keyword', name: 'Keyword in message', desc: 'When user sends "hi", "start", etc.' },
  { id: 'qr', name: 'QR code scan', desc: 'When user scans a campaign QR' },
  { id: 'meta_ad', name: 'Click-to-WhatsApp ad', desc: 'When user taps a Meta ad' },
  { id: 'api', name: 'API / Webhook', desc: 'Trigger from external system' },
  { id: 'manual', name: 'Manual (agent)', desc: 'Agent starts from inbox' },
];

const STEPS = ['Goal', 'Trigger', 'Welcome', 'Question', 'Condition', 'Assignment', 'Publish'];

export const GuidedFlowWizard: React.FC<GuidedFlowWizardProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [goal, setGoal] = useState<string>('');
  const [trigger, setTrigger] = useState<string>('keyword');
  const [keyword, setKeyword] = useState('hi');
  const [welcome, setWelcome] = useState('Hi 👋 Thanks for reaching out! How can we help you today?');
  const [question, setQuestion] = useState('What are you looking for?');
  const [hotKeyword, setHotKeyword] = useState('buy');
  const [assignTeam, setAssignTeam] = useState(true);
  const [flowName, setFlowName] = useState('');

  React.useEffect(() => {
    if (goal && !flowName) {
      const g = GOALS.find(x => x.id === goal);
      if (g) setFlowName(g.name);
    }
  }, [goal, flowName]);

  const handleCreate = async () => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    setCreating(true);
    try {
      // 1. Create flow
      const { data: flow, error: flowErr } = await supabase
        .from('flows')
        .insert({
          tenant_id: currentTenant.id,
          name: flowName || 'Untitled Flow',
          status: 'draft',
          emoji: '🚀',
        } as any)
        .select()
        .single();
      if (flowErr) throw flowErr;

      // 2. Create start node + welcome + question + condition + assignment
      const baseY = 80;
      const dy = 160;
      const nodesPayload = [
        { flow_id: flow.id, node_key: 'start', node_type: 'start', label: 'Start', position_x: 200, position_y: baseY, config: {} },
        { flow_id: flow.id, node_key: 'welcome', node_type: 'text-buttons', label: 'Welcome', position_x: 200, position_y: baseY + dy, config: { message: welcome } },
        { flow_id: flow.id, node_key: 'ask', node_type: 'text-buttons', label: 'Ask', position_x: 200, position_y: baseY + dy * 2, config: { message: question } },
        { flow_id: flow.id, node_key: 'check', node_type: 'condition', label: 'Hot lead?', position_x: 200, position_y: baseY + dy * 3, config: { keyword: hotKeyword } },
        { flow_id: flow.id, node_key: 'assign', node_type: 'assign-agent', label: assignTeam ? 'Assign team' : 'Notify team', position_x: 200, position_y: baseY + dy * 4, config: { strategy: 'round_robin' } },
      ];
      const { error: nodesErr } = await supabase.from('flow_nodes').insert(nodesPayload as any);
      if (nodesErr) throw nodesErr;

      const edgesPayload = [
        { flow_id: flow.id, edge_key: 'e1', source_node_key: 'start', target_node_key: 'welcome' },
        { flow_id: flow.id, edge_key: 'e2', source_node_key: 'welcome', target_node_key: 'ask' },
        { flow_id: flow.id, edge_key: 'e3', source_node_key: 'ask', target_node_key: 'check' },
        { flow_id: flow.id, edge_key: 'e4', source_node_key: 'check', target_node_key: 'assign' },
      ];
      await supabase.from('flow_edges').insert(edgesPayload as any);

      // 3. Add trigger
      await supabase.from('flow_triggers').insert({
        flow_id: flow.id,
        trigger_type: trigger,
        config: trigger === 'keyword' ? { keyword } : {},
        is_enabled: true,
      } as any);

      toast.success('Flow created! Opening builder…');
      onOpenChange(false);
      navigate(`/flows/${flow.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to create flow');
    } finally {
      setCreating(false);
    }
  };

  const canNext = (() => {
    if (step === 0) return !!goal;
    if (step === 1) return !!trigger && (trigger !== 'keyword' || keyword.trim().length > 0);
    if (step === 2) return welcome.trim().length > 0;
    if (step === 3) return question.trim().length > 0;
    if (step === 4) return true;
    if (step === 5) return true;
    if (step === 6) return flowName.trim().length > 0;
    return false;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Guided Flow Builder
          </DialogTitle>
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] shrink-0',
                  i < step && 'bg-primary/10 text-primary',
                  i === step && 'bg-primary text-primary-foreground',
                  i > step && 'bg-muted text-muted-foreground',
                )}>
                  {i < step ? <Check className="w-3 h-3" /> : <span className="w-4 text-center">{i + 1}</span>}
                  {label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 min-h-[340px]">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    'text-left p-3 rounded-xl border-2 transition-all hover:shadow-md',
                    goal === g.id ? 'border-primary bg-primary/5' : 'border-border',
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-2', g.color)}>
                    <g.icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-sm">{g.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {TRIGGERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTrigger(t.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border-2 transition-all',
                    trigger === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                  )}
                >
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </button>
              ))}
              {trigger === 'keyword' && (
                <div className="space-y-1 pt-2">
                  <Label className="text-xs">Keyword(s) — comma separated</Label>
                  <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="hi, hello, start" />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-xs">Welcome message</Label>
              <Textarea rows={5} value={welcome} onChange={e => setWelcome(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Sent immediately when the flow starts.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label className="text-xs">Qualifying question</Label>
              <Textarea rows={4} value={question} onChange={e => setQuestion(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Ask one question to qualify the lead.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label className="text-xs">Mark as HOT lead when reply contains</Label>
              <Input value={hotKeyword} onChange={e => setHotKeyword(e.target.value)} placeholder="buy, urgent, today" />
              <p className="text-[11px] text-muted-foreground">Hot leads will be routed first.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <Card className={cn('p-4 cursor-pointer border-2', assignTeam ? 'border-primary' : 'border-border')} onClick={() => setAssignTeam(true)}>
                <p className="font-medium text-sm">Round-robin to team</p>
                <p className="text-[11px] text-muted-foreground">Distribute equally across all online agents.</p>
              </Card>
              <Card className={cn('p-4 cursor-pointer border-2', !assignTeam ? 'border-primary' : 'border-border')} onClick={() => setAssignTeam(false)}>
                <p className="font-medium text-sm">Notify team (no assignment)</p>
                <p className="text-[11px] text-muted-foreground">Send internal alert; agents can claim.</p>
              </Card>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Flow name</Label>
                <Input value={flowName} onChange={e => setFlowName(e.target.value)} placeholder="My new flow" />
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5 text-xs">
                <p><Badge variant="outline" className="mr-2">Goal</Badge>{GOALS.find(g => g.id === goal)?.name}</p>
                <p><Badge variant="outline" className="mr-2">Trigger</Badge>{TRIGGERS.find(t => t.id === trigger)?.name}{trigger === 'keyword' && ` — "${keyword}"`}</p>
                <p><Badge variant="outline" className="mr-2">Welcome</Badge><span className="text-muted-foreground line-clamp-1">{welcome}</span></p>
                <p><Badge variant="outline" className="mr-2">Question</Badge><span className="text-muted-foreground line-clamp-1">{question}</span></p>
                <p><Badge variant="outline" className="mr-2">Hot keyword</Badge>{hotKeyword}</p>
                <p><Badge variant="outline" className="mr-2">Routing</Badge>{assignTeam ? 'Round-robin' : 'Notify only'}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Saved as draft — you can edit anything before publishing.</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-3 flex items-center justify-between bg-muted/30">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || creating}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</div>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!canNext || creating}>
              {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Create flow
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
