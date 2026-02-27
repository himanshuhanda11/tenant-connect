import { useState } from 'react';
import { useLeadFormRules, LeadFormRule } from '@/hooks/useLeadForms';
import { useLeadForms } from '@/hooks/useLeadForms';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, Zap, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

  const selectedForm = forms.find(f => f.form_id === formData.form_id);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Automation Rules</h3>
          <Badge variant="secondary">{rules.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Automation Rules</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              Create rules to automatically send WhatsApp messages when leads submit your Meta Lead Forms.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Reply Mode</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rule.form_id}</TableCell>
                  <TableCell>
                    <Badge variant={rule.reply_mode === 'template' ? 'default' : 'secondary'}>
                      {rule.reply_mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{rule.assignment_mode.replace('_', ' ')}</TableCell>
                  <TableCell className="font-mono text-sm">{rule.execution_count}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.last_executed_at
                      ? formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true })
                      : '—'
                    }
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Study Abroad Lead Auto-Reply"
              />
            </div>

            <div>
              <Label>Select Lead Form</Label>
              <Select value={formData.form_id} onValueChange={(v) => {
                const form = forms.find(f => f.form_id === v);
                setFormData(prev => ({ ...prev, form_id: v, page_id: form?.page_id || '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Choose a form" /></SelectTrigger>
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
              <Label>WhatsApp Phone Number</Label>
              <Select value={formData.phone_number_id || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, phone_number_id: v || null }))}>
                <SelectTrigger><SelectValue placeholder="Choose phone number" /></SelectTrigger>
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
              <Label>Auto-Reply Mode</Label>
              <Select value={formData.reply_mode} onValueChange={(v) => setFormData(prev => ({ ...prev, reply_mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template Message (Recommended)</SelectItem>
                  <SelectItem value="session">Session Message</SelectItem>
                </SelectContent>
              </Select>
              {formData.reply_mode === 'session' && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Session messages only work if the user has messaged you on WhatsApp in the last 24 hours. Use template messages for first contact.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label>Assignment Mode</Label>
              <Select value={formData.assignment_mode} onValueChange={(v) => setFormData(prev => ({ ...prev, assignment_mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="by_country">By Country</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="specific_agent">Specific Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Junk Filter</Label>
                <p className="text-xs text-muted-foreground">Auto-mark leads with missing/invalid phone as Junk</p>
              </div>
              <Switch
                checked={formData.junk_filter_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, junk_filter_enabled: checked }))}
              />
            </div>

            <div>
              <Label>Field Mapping (JSON)</Label>
              <Textarea
                value={JSON.stringify(formData.field_mapping, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData(prev => ({ ...prev, field_mapping: parsed }));
                  } catch {}
                }}
                placeholder='{"body_1": "name", "body_2": "phone"}'
                className="font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">Map template variables to lead fields: name, phone, email, country_interest, etc.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.form_id}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
