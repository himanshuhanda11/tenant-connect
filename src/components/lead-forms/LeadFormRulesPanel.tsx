import { useState } from 'react';
import { useLeadFormRules, LeadFormRule } from '@/hooks/useLeadForms';
import { useLeadForms } from '@/hooks/useLeadForms';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, Zap, Trash2, AlertTriangle, MoreHorizontal, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LeadFormRulesPanel() {
  const { rules, loading, createRule, updateRule, deleteRule, toggleRule } = useLeadFormRules();
  const { forms } = useLeadForms();
  const { phoneNumbers } = usePhoneNumbers();
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<Partial<LeadFormRule>>({
    name: '',
    trigger_type: 'meta_leadgen',
    page_id: '',
    form_id: '',
    reply_mode: 'template',
    assignment_mode: 'round_robin',
    junk_filter_enabled: true,
    enabled: true,
    field_mapping: {},
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.form_id || !formData.page_id) return;
    await createRule(formData);
    setShowCreate(false);
    setFormData({ name: '', trigger_type: 'meta_leadgen', page_id: '', form_id: '', reply_mode: 'template', assignment_mode: 'round_robin', junk_filter_enabled: true, enabled: true, field_mapping: {} });
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rules.length} rule{rules.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">No Automation Rules</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Create rules to automatically send WhatsApp messages when leads submit your Meta Lead Forms.
            </p>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const matchedForm = forms.find(f => f.form_id === rule.form_id);
            return (
              <Card key={rule.id} className="overflow-hidden border-border/60 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Toggle */}
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      className="shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm text-foreground truncate">{rule.name}</h4>
                        <Badge variant={rule.reply_mode === 'template' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">
                          {rule.reply_mode}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {rule.assignment_mode.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span>{matchedForm?.form_name || rule.form_id.slice(0, 12)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Play className="h-2.5 w-2.5" />
                          {rule.execution_count} runs
                        </span>
                        {rule.last_executed_at && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">
                              Last: {formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Create Automation Rule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Study Abroad Lead Auto-Reply"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Select Lead Form</Label>
              <Select value={formData.form_id} onValueChange={(v) => {
                const form = forms.find(f => f.form_id === v);
                setFormData(prev => ({ ...prev, form_id: v, page_id: form?.page_id || '' }));
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a form" /></SelectTrigger>
                <SelectContent>
                  {forms.map((f) => (
                    <SelectItem key={f.form_id} value={f.form_id}>
                      {f.form_name || f.form_id} ({f.page_name || f.page_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">WhatsApp Phone Number</Label>
              <Select value={formData.phone_number_id || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, phone_number_id: v || null }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose phone number" /></SelectTrigger>
                <SelectContent>
                  {phoneNumbers.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.display_phone_number || p.phone_number} — {p.verified_name || 'Unverified'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">Auto-Reply Mode</Label>
              <Select value={formData.reply_mode} onValueChange={(v) => setFormData(prev => ({ ...prev, reply_mode: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template Message (Recommended)</SelectItem>
                  <SelectItem value="session">Session Message</SelectItem>
                </SelectContent>
              </Select>
              {formData.reply_mode === 'session' && (
                <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 flex gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Session messages only work if the user has messaged you in the last 24 hours.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium">Assignment Mode</Label>
              <Select value={formData.assignment_mode} onValueChange={(v) => setFormData(prev => ({ ...prev, assignment_mode: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="by_country">By Country</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="specific_agent">Specific Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label className="text-xs font-medium">Junk Filter</Label>
                <p className="text-[11px] text-muted-foreground">Auto-mark leads with missing phone as Junk</p>
              </div>
              <Switch
                checked={formData.junk_filter_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, junk_filter_enabled: checked }))}
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Field Mapping (JSON)</Label>
              <Textarea
                value={JSON.stringify(formData.field_mapping, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData(prev => ({ ...prev, field_mapping: parsed }));
                  } catch {}
                }}
                placeholder='{"body_1": "name", "body_2": "phone"}'
                className="font-mono text-xs mt-1.5"
                rows={3}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Map template variables to lead fields: name, phone, email, etc.</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!formData.name || !formData.form_id}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
