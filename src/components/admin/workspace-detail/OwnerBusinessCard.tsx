import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User, Building2, Globe, Mail, Phone, MapPin, Briefcase, Users as UsersIcon,
  Clock, Calendar, MessageSquare, Wifi, WifiOff, Hash, ExternalLink,
} from 'lucide-react';

interface OwnerSnapshotProps {
  workspace: any;
  owner: any;
  waba: any;
  workspacePhone: any;
  phones: any[];
}

function Field({ icon: Icon, label, value, href }: { icon: any; label: string; value?: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 break-all">
            {value || '—'}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm font-medium break-all">{value || <span className="text-muted-foreground font-normal">—</span>}</p>
        )}
      </div>
    </div>
  );
}

export function OwnerBusinessCard({ workspace, owner, waba, workspacePhone, phones }: OwnerSnapshotProps) {
  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const primaryPhone = phones?.[0];
  const websiteHref = owner?.website_url
    ? (owner.website_url.startsWith('http') ? owner.website_url : `https://${owner.website_url}`)
    : undefined;

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          Owner & Business Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          <Field icon={User} label="Full name" value={owner?.full_name} />
          <Field icon={Mail} label="Email" value={owner?.email} />
          <Field icon={Phone} label="Personal phone" value={owner?.phone_number} />
          <Field icon={Building2} label="Company" value={owner?.company_name} />
          <Field icon={Globe} label="Website" value={owner?.website_url} href={websiteHref} />
          <Field icon={MapPin} label="Country" value={owner?.country} />
          <Field icon={Briefcase} label="Industry" value={owner?.industry} />
          <Field icon={UsersIcon} label="Team size" value={owner?.team_size} />
          <Field icon={Clock} label="Time zone" value={owner?.timezone || workspace?.timezone} />
          <Field icon={Calendar} label="Account signed up" value={fmtDate(owner?.created_at)} />
          <Field icon={Hash} label="Workspace created" value={fmtDate(workspace?.created_at)} />
          <Field icon={MessageSquare} label="Primary goal" value={owner?.primary_goal} />
        </div>

        {/* WhatsApp connection block */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp Connection</h4>
            {waba?.status === 'active' ? (
              <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                <Wifi className="h-3 w-3" /> Active
              </Badge>
            ) : waba ? (
              <Badge variant="secondary" className="capitalize gap-1">
                <WifiOff className="h-3 w-3" /> {waba.status}
              </Badge>
            ) : (
              <Badge variant="outline">Not connected</Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
            <Field icon={Phone} label="WhatsApp number" value={primaryPhone?.display_number || workspacePhone?.phone_e164} />
            <Field icon={User} label="Display name" value={primaryPhone?.verified_name || workspacePhone?.display_name} />
            <Field icon={Hash} label="Phone Number ID" value={primaryPhone?.phone_number_id} />
            <Field icon={Hash} label="WABA ID" value={waba?.waba_id} />
            <Field icon={Hash} label="Business ID" value={waba?.business_id} />
            <Field icon={Calendar} label="WABA connected on" value={fmtDate(waba?.created_at)} />
            <Field icon={Calendar} label="Number connected on" value={fmtDate(primaryPhone?.created_at || workspacePhone?.created_at)} />
            <Field icon={Wifi} label="Quality rating" value={primaryPhone?.quality_rating} />
            <Field icon={MessageSquare} label="Messaging limit" value={primaryPhone?.messaging_limit} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
