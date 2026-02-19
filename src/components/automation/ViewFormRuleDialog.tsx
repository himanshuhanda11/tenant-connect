import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Zap,
  MessageSquare,
  Search,
  Facebook,
  QrCode,
  Globe,
  Tag,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Brain,
  Send,
  RefreshCcw,
  Edit,
  Ban,
  User,
} from 'lucide-react';
import { FORM_RULE_TRIGGER_OPTIONS, FORM_RULE_CONDITION_OPTIONS } from '@/types/formRule';
import type { FormRule } from '@/types/formRule';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

const triggerIconMap: Record<string, React.ElementType> = {
  first_message: MessageSquare,
  keyword: Search,
  ad_click: Facebook,
  qr_scan: QrCode,
  source: Globe,
  tag_added: Tag,
  scheduled: Clock,
  ai_intent: Brain,
};

interface ViewFormRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: FormRule | null;
  onEdit?: (rule: FormRule) => void;
}

export function ViewFormRuleDialog({ open, onOpenChange, rule, onEdit }: ViewFormRuleDialogProps) {
  if (!rule) return null;

  const triggerInfo = FORM_RULE_TRIGGER_OPTIONS.find(t => t.value === rule.trigger_type);
  const TriggerIcon = triggerIconMap[rule.trigger_type] || Zap;
  const formMode = (rule.form_variables as any)?.form_mode || 'template';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg truncate">{rule.name}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {rule.description || 'No description'}
              </DialogDescription>
            </div>
            <Badge variant={rule.is_active ? 'default' : 'secondary'} className="shrink-0">
              {rule.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Trigger */}
          <Section title="Trigger" icon={<Zap className="w-4 h-4" />}>
            <div className="flex items-center gap-2">
              <TriggerIcon className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{triggerInfo?.label || rule.trigger_type}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{triggerInfo?.description}</p>
            
            {/* Keyword details */}
            {rule.trigger_type === 'keyword' && rule.trigger_config?.keywords?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Keywords:</span>
                {rule.trigger_config.keywords.map((kw: string) => (
                  <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                ))}
                {rule.trigger_config.match_type && (
                  <Badge variant="secondary" className="text-xs">
                    Match: {rule.trigger_config.match_type}
                  </Badge>
                )}
              </div>
            )}

            {/* Delay */}
            {(rule.trigger_config as any)?.delay_seconds > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Delay: {(rule.trigger_config as any).delay_seconds}s
              </div>
            )}
          </Section>

          <Separator />

          {/* Conditions */}
          <Section title="Conditions" icon={<Search className="w-4 h-4" />}>
            {rule.conditions && rule.conditions.length > 0 ? (
              <div className="space-y-1.5">
                {rule.conditions.map((c, i) => {
                  const condInfo = FORM_RULE_CONDITION_OPTIONS.find(o => o.value === c.type);
                  return (
                    <div key={c.id || i} className="flex items-center gap-2 text-xs">
                      {i > 0 && (
                        <Badge variant="outline" className="text-[10px] uppercase">{c.operator || 'and'}</Badge>
                      )}
                      <span className="text-muted-foreground">{condInfo?.label || c.type}</span>
                      {c.config && Object.keys(c.config).length > 0 && (
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                          {JSON.stringify(c.config)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No conditions — applies to all contacts</p>
            )}
          </Section>

          <Separator />

          {/* Form */}
          <Section title="Form" icon={<FileText className="w-4 h-4" />}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">{formMode}</Badge>
                {formMode === 'template' && rule.form && (
                  <span className="text-sm font-medium">{rule.form.name}</span>
                )}
                {formMode === 'builder' && rule.form_template_name && (
                  <span className="text-sm font-medium">{rule.form_template_name}</span>
                )}
              </div>
              {(rule.form_variables as any)?.intro_message && (
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Intro message: </span>
                  <span className="italic">"{(rule.form_variables as any).intro_message}"</span>
                </div>
              )}
            </div>
          </Section>

          <Separator />

          {/* Safety / Guardrails */}
          <Section title="Guardrails" icon={<Shield className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              <GuardItem
                icon={<User className="w-3.5 h-3.5" />}
                label="Send once per user"
                active={rule.max_sends_per_contact_per_day === 1}
              />
              <GuardItem
                icon={<Send className="w-3.5 h-3.5" />}
                label="Stop on agent reply"
                active={(rule.trigger_config as any)?.stop_on_agent_reply ?? true}
              />
              <GuardItem
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                label="Opt-in required"
                active={rule.require_opt_in}
              />
              <GuardItem
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Business hours only"
                active={rule.business_hours_only}
              />
              <GuardItem
                icon={<RefreshCcw className="w-3.5 h-3.5" />}
                label={`Cooldown: ${rule.cooldown_minutes}m`}
                active={rule.cooldown_minutes > 0}
              />
              <GuardItem
                icon={<Ban className="w-3.5 h-3.5" />}
                label={`Max ${rule.max_sends_per_contact_per_day}/day`}
                active
              />
            </div>
          </Section>

          <Separator />

          {/* Stats */}
          <Section title="Statistics" icon={<Zap className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Total Executions</p>
                <p className="font-semibold">{rule.execution_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Last Executed</p>
                <p className="font-semibold text-xs">
                  {rule.last_executed_at
                    ? formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Created</p>
                <p className="font-semibold text-xs">
                  {format(new Date(rule.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Priority</p>
                <p className="font-semibold">{rule.priority}</p>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        {onEdit && (
          <div className="flex justify-end pt-2 border-t mt-4">
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(rule);
              }}
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Edit Rule
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function GuardItem({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs p-1.5 rounded-md",
      active ? "text-foreground" : "text-muted-foreground line-through opacity-50"
    )}>
      {active ? (
        <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
      ) : (
        <XCircle className="w-3 h-3 text-muted-foreground shrink-0" />
      )}
      <span>{label}</span>
    </div>
  );
}
