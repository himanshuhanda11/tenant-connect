import { useLeadForms } from '@/hooks/useLeadForms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Loader2, FileText, Zap, Webhook, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export function LeadFormsList() {
  const { forms, loading, syncForms, subscribeWebhook, testWebhook } = useLeadForms();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await syncForms();
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Connected Lead Forms</h3>
          <Badge variant="secondary">{forms.length}</Badge>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Sync Forms
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Lead Forms Found</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              Connect your Meta Business account and sync your Facebook/Instagram Lead Forms to start capturing leads automatically.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync from Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Webhook</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Last Lead</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.form_name || form.form_id}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{form.page_name || form.page_id}</TableCell>
                  <TableCell>
                    <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
                      {form.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {form.is_webhook_subscribed ? (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                        <Zap className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-600 text-xs"
                        onClick={() => subscribeWebhook(form.page_id)}
                      >
                        <Webhook className="h-3 w-3 mr-1" />
                        Subscribe
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{form.lead_count}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {form.last_lead_at 
                      ? formatDistanceToNow(new Date(form.last_lead_at), { addSuffix: true })
                      : '—'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => testWebhook(form.page_id)}>
                        Test
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
