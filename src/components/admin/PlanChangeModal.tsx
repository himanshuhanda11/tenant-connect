import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { toast } from '@/hooks/use-toast';

interface Props { workspaceId: string | null; workspaceName?: string; onClose: () => void; onSaved?: () => void; }

export function PlanChangeModal({ workspaceId, workspaceName, onClose, onSaved }: Props) {
  const { get, post } = useAdminApi();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [ent, setEnt] = useState<any>({});
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([get('plans'), get(`workspaces/${workspaceId}/entitlements`)])
      .then(([pl, en]) => { setPlans(pl.plans || []); setEnt(en.entitlement || { plan: 'free', billing_cycle: 'monthly', status: 'active' }); })
      .catch((e) => toast({ title: 'Load failed', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const set = (k: string, v: any) => setEnt((e: any) => ({ ...e, [k]: v }));
  const currentPlan = plans.find((p) => p.id === ent.plan);
  const targetPlan = plans.find((p) => p.id === ent.plan);
  const isDowngrade = currentPlan && targetPlan &&
    plans.findIndex((p) => p.id === targetPlan.id) < plans.findIndex((p) => p.id === currentPlan?.id);

  const save = async () => {
    if (!reason || reason.length < 4) { toast({ title: 'Reason required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await post(`workspaces/${workspaceId}/entitlements`, { ...ent, reason });
      toast({ title: 'Plan updated', description: `${workspaceName || 'Workspace'} now on ${ent.plan}` });
      onSaved?.(); onClose();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={!!workspaceId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Change plan · {workspaceName}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {/* Plan + cycle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plan</Label>
                <Select value={ent.plan} onValueChange={(v) => set('plan', v)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.price_monthly > 0 && `· ₹${p.price_monthly}/mo`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Billing cycle</Label>
                <Select value={ent.billing_cycle || 'monthly'} onValueChange={(v) => set('billing_cycle', v)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['monthly','quarterly','yearly','lifetime','trial'].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={ent.status || 'active'} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['active','suspended','closed'].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiry date</Label>
                <Input type="datetime-local" className="rounded-lg"
                  value={ent.expires_at ? new Date(ent.expires_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => set('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </div>
              <div>
                <Label>Trial ends at</Label>
                <Input type="datetime-local" className="rounded-lg"
                  value={ent.trial_ends_at ? new Date(ent.trial_ends_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => set('trial_ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </div>
            </div>

            {/* Limits */}
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold pt-2">Limits (-1 = unlimited)</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ['monthly_conversation_limit', 'Messages'],
                ['monthly_broadcast_limit', 'Broadcasts'],
                ['monthly_template_limit', 'Templates'],
                ['monthly_flow_limit', 'Flows'],
                ['team_member_limit', 'Team members'],
                ['campaign_limit', 'Campaigns'],
                ['ai_usage_limit', 'AI usage'],
              ].map(([k, label]) => (
                <div key={k}>
                  <Label className="text-[11px]">{label}</Label>
                  <Input type="number" className="rounded-lg h-8 text-sm"
                    value={ent[k] ?? ''} onChange={(e) => set(k, e.target.value === '' ? null : parseInt(e.target.value))} />
                </div>
              ))}
            </div>

            {/* Feature flags */}
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold pt-2">Features</div>
            <div className="grid grid-cols-2 gap-2">
              {[['enable_ai','AI'],['enable_ads','Ads'],['enable_integrations','Integrations'],['enable_autoforms','Auto-forms']].map(([k, label]) => (
                <div key={k} className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="text-sm">{label}</span>
                  <Switch checked={!!ent[k]} onCheckedChange={(v) => set(k, v)} />
                </div>
              ))}
            </div>

            {/* Reason + note */}
            <div>
              <Label>Reason for change <span className="text-red-600">*</span></Label>
              <Input className="rounded-lg" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Customer requested upgrade after sales call" />
            </div>
            <div>
              <Label>Internal admin note (optional)</Label>
              <Textarea className="rounded-lg min-h-[60px]" value={ent.internal_admin_note || ''}
                onChange={(e) => set('internal_admin_note', e.target.value)} />
            </div>

            {isDowngrade && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>This is a <b>downgrade</b>. Existing usage above new limits will not be deleted, but new actions will be blocked.</span>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || loading || !reason}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
            Apply changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
