import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Facebook, Loader2, ShieldCheck, ShieldX, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MetaPermissionRow {
  permission: string;
  state: 'granted' | 'declined' | 'not_approved_by_meta' | 'not_granted';
  appApproved: boolean | null;
}

export interface MetaDiagnosis {
  code: string;
  severity: 'ok' | 'warning' | 'error';
  whoFixes: 'customer' | 'aireatro' | 'none';
  title: string;
  message: string;
  steps: string[];
  permissions: MetaPermissionRow[];
  missingPermissions: string[];
  adAccountCount: number;
  pagesCount: number;
}

const PERMISSION_LABELS: Record<string, string> = {
  ads_read: 'Read ads',
  ads_management: 'Manage ads',
  leads_retrieval: 'Lead forms',
  pages_manage_ads: 'Page ads',
  pages_show_list: 'List Pages',
  pages_read_engagement: 'Read Page',
  pages_manage_metadata: 'Lead webhooks',
  business_management: 'Business',
};

const STATE_UI: Record<MetaPermissionRow['state'], { label: string; className: string; Icon: any }> = {
  granted: { label: 'Allowed', className: 'border-primary/30 bg-primary/10 text-primary', Icon: ShieldCheck },
  declined: { label: 'Turned off', className: 'border-destructive/30 bg-destructive/10 text-destructive', Icon: ShieldX },
  not_approved_by_meta: { label: 'Awaiting Meta approval', className: 'border-accent bg-accent text-accent-foreground', Icon: Clock },
  not_granted: { label: 'Not allowed', className: 'border-destructive/30 bg-destructive/10 text-destructive', Icon: XCircle },
};

export function MetaConnectionDiagnosis({
  diagnosis,
  onReconnect,
  reconnecting,
  compact,
}: {
  diagnosis: MetaDiagnosis;
  onReconnect?: () => void;
  reconnecting?: boolean;
  compact?: boolean;
}) {
  const Icon = diagnosis.severity === 'ok' ? CheckCircle2 : diagnosis.severity === 'warning' ? AlertTriangle : AlertCircle;
  const tone =
    diagnosis.severity === 'ok'
      ? 'border-primary/30 bg-primary/5'
      : diagnosis.severity === 'warning'
        ? 'border-accent bg-accent/40'
        : 'border-destructive/30 bg-destructive/5';

  return (
    <div className={cn('rounded-xl border p-4 space-y-3 text-left', tone)} role="status" aria-label="Facebook connection check">
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', diagnosis.severity === 'error' ? 'text-destructive' : 'text-primary')} />
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold">{diagnosis.title}</p>
          <p className="text-xs text-muted-foreground">{diagnosis.message}</p>
          <p className="text-[11px] text-muted-foreground">
            {diagnosis.adAccountCount} ad account(s) · {diagnosis.pagesCount} page(s) found
          </p>
        </div>
      </div>

      {diagnosis.steps.length > 0 && (
        <ol className="list-decimal pl-9 space-y-1 text-xs text-foreground/80">
          {diagnosis.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
      )}

      {!compact && diagnosis.permissions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-8">
          {diagnosis.permissions.map((p) => {
            const ui = STATE_UI[p.state];
            return (
              <Badge key={p.permission} variant="outline" className={cn('text-[10px] gap-1 font-normal', ui.className)} title={p.permission}>
                <ui.Icon className="h-3 w-3" />
                {PERMISSION_LABELS[p.permission] || p.permission}: {ui.label}
              </Badge>
            );
          })}
        </div>
      )}

      {onReconnect && diagnosis.whoFixes === 'customer' && (
        <div className="pl-8">
          <Button type="button" size="sm" onClick={onReconnect} disabled={reconnecting} className="gap-1.5 h-8 text-xs">
            {reconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Facebook className="h-3.5 w-3.5" />}
            Reconnect Facebook
          </Button>
        </div>
      )}
    </div>
  );
}
