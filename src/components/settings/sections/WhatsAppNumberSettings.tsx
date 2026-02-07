import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import {
  Phone, CheckCircle2, Clock, AlertTriangle, RefreshCw, Loader2, Unplug, Wifi
} from 'lucide-react';

interface WorkspacePhone {
  id: string;
  workspace_id: string;
  phone_e164: string;
  display_name: string | null;
  provider: string;
  status: string;
  quality_rating: string | null;
  messaging_limit: number | null;
  waba_id: string | null;
  phone_number_id: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

const QUALITY_CONFIG: Record<string, { color: string; label: string }> = {
  GREEN: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Healthy' },
  YELLOW: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Warning' },
  RED: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Low Quality' },
};

export function WhatsAppNumberSettings() {
  const { currentTenant } = useTenant();
  const [phone, setPhone] = useState<WorkspacePhone | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPhone = async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('workspace_phone_numbers')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .maybeSingle();

      if (error) throw error;
      setPhone(data);
    } catch (e: any) {
      console.error('Failed to load phone:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhone(); }, [currentTenant?.id]);

  const handleRefreshStatus = async () => {
    if (!currentTenant?.id || !phone) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-connect-complete', {
        body: { workspaceId: currentTenant.id },
      });
      if (error) throw error;
      if (data?.phone) setPhone(data.phone);
      toast({ title: 'Status refreshed' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // No phone connected
  if (!phone) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <Phone className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No WhatsApp Number Connected</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Connect your WhatsApp Business number to start sending messages. 
              Go to the Integrations page to begin the setup process.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/phone-numbers'}>
            <Wifi className="h-4 w-4 mr-2" />
            Connect Number
          </Button>
        </CardContent>
      </Card>
    );
  }

  const quality = phone.quality_rating ? QUALITY_CONFIG[phone.quality_rating] : null;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            WhatsApp Number
          </CardTitle>
          <CardDescription>
            Your connected WhatsApp Business phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number + status */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="font-mono text-lg font-semibold">{phone.phone_e164}</div>
              {phone.display_name && (
                <div className="text-sm text-muted-foreground">{phone.display_name}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {phone.status === 'active' ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : phone.status === 'suspended' ? (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Suspended
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Provider</div>
              <div className="text-sm font-medium capitalize">{phone.provider}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Quality Rating</div>
              {quality ? (
                <Badge variant="outline" className={`text-xs ${quality.color}`}>
                  {phone.quality_rating} — {quality.label}
                </Badge>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Messaging Limit</div>
              <div className="text-sm font-medium">
                {phone.messaging_limit ? `${phone.messaging_limit.toLocaleString()} / day` : '—'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Connected</div>
              <div className="text-sm font-medium">
                {new Date(phone.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* WABA details (if exists) */}
          {(phone.waba_id || phone.phone_number_id) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {phone.waba_id && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">WABA ID</div>
                    <div className="text-xs font-mono bg-muted px-2 py-1 rounded">{phone.waba_id}</div>
                  </div>
                )}
                {phone.phone_number_id && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Phone Number ID</div>
                    <div className="text-xs font-mono bg-muted px-2 py-1 rounded">{phone.phone_number_id}</div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleRefreshStatus}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          {/* Quality warning */}
          {phone.quality_rating === 'RED' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-700">Low Quality Rating</div>
                <div className="text-xs text-red-600 mt-0.5">
                  Your messaging limit may be reduced. Review your templates and sending patterns to improve quality.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
