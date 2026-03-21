import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Activity,
  Zap,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Edit,
  Power,
  PowerOff,
  LayoutDashboard,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventDebugger } from '@/components/integrations/EventDebugger';
import { EventActionMappingModal, EventMapping } from '@/components/integrations/EventActionMappingModal';
import { IntegrationOverview } from '@/components/integrations/IntegrationOverview';
import { ProFeaturesPanel, ProConfig } from '@/components/integrations/ProFeaturesPanel';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useIntegrationAudit } from '@/hooks/useIntegrationAudit';
import { useIntegrationPermissions } from '@/hooks/useIntegrationPermissions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const MOCK_EVENTS: Array<{
  id: string;
  tenant_id: string;
  tenant_integration_id: string;
  event_type: string;
  event_id: string | null;
  payload: Record<string, unknown>;
  status: 'received' | 'processing' | 'processed' | 'failed';
  error_message: string | null;
  processing_started_at: string | null;
  processed_at: string | null;
  retry_count: number;
  next_retry_at: string | null;
  created_at: string;
}> = [
  {
    id: '1',
    tenant_id: '1',
    tenant_integration_id: '1',
    event_type: 'shopify.orders.create',
    event_id: 'ord_123456',
    payload: { id: 123456, customer: { phone: '+911234567890', first_name: 'John' }, total_price: '1500.00' },
    status: 'processed',
    error_message: null,
    processing_started_at: new Date(Date.now() - 2000).toISOString(),
    processed_at: new Date(Date.now() - 1000).toISOString(),
    retry_count: 0,
    next_retry_at: null,
    created_at: new Date(Date.now() - 5000).toISOString(),
  },
  {
    id: '2',
    tenant_id: '1',
    tenant_integration_id: '1',
    event_type: 'shopify.orders.paid',
    event_id: 'pay_789012',
    payload: { id: 789012, financial_status: 'paid', customer: { phone: '+911234567890' } },
    status: 'failed',
    error_message: 'Template not found: order_paid_notification',
    processing_started_at: new Date(Date.now() - 60000).toISOString(),
    processed_at: null,
    retry_count: 1,
    next_retry_at: new Date(Date.now() + 60000).toISOString(),
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: '3',
    tenant_id: '1',
    tenant_integration_id: '1',
    event_type: 'shopify.checkouts.update',
    event_id: 'chk_345678',
    payload: { id: 345678, abandoned_checkout_url: 'https://shop.example.com/checkout/345678' },
    status: 'received',
    error_message: null,
    processing_started_at: null,
    processed_at: null,
    retry_count: 0,
    next_retry_at: null,
    created_at: new Date(Date.now() - 10000).toISOString(),
  },
];

const MOCK_MAPPINGS: EventMapping[] = [
  {
    id: '1',
    event_type: 'shopify.orders.create',
    action_type: 'send_template',
    action_config: {
      template_id: 'tpl_order_confirmation',
      phone_field: 'customer.phone',
      variable_mappings: {
        first_name: 'customer.first_name',
        order_id: 'id',
        order_total: 'total_price',
      },
    },
    conditions: [],
    is_active: true,
    priority: 0,
  },
];

export default function IntegrationDetail() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { integrationsWithStatus, disconnect, isDisconnecting } = useIntegrations();
  const { log: auditLog } = useIntegrationAudit();
  const { canDisconnect, canEditSettings } = useIntegrationPermissions();

  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<EventMapping | undefined>();
  const [mappings, setMappings] = useState<EventMapping[]>(MOCK_MAPPINGS);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [proConfig, setProConfig] = useState<ProConfig | undefined>();

  // Calculate event stats
  const eventStats = useMemo(() => {
    return {
      total: events.length,
      processed: events.filter(e => e.status === 'processed').length,
      failed: events.filter(e => e.status === 'failed').length,
      pending: events.filter(e => e.status === 'received' || e.status === 'processing').length,
    };
  }, [events]);

  const integration = integrationsWithStatus.find(i => i.key === key);

  if (!integration) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Integration Not Found</h1>
          <Button onClick={() => navigate('/app/integrations')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Integrations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const tenantIntegration = integration.tenantIntegration;
  const webhookUrl = tenantIntegration?.webhook_url || `https://your-domain.com/api/webhooks/${key}/{your-tenant-id}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
  };

  const handleSaveMapping = (mapping: EventMapping) => {
    if (editingMapping) {
      setMappings(mappings.map(m => m.id === editingMapping.id ? { ...mapping, id: editingMapping.id } : m));
    } else {
      setMappings([...mappings, { ...mapping, id: crypto.randomUUID() }]);
    }
    setEditingMapping(undefined);
    toast({ title: 'Mapping Saved', description: 'Event mapping has been saved successfully.' });
  };

  const handleDeleteMapping = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id));
    toast({ title: 'Mapping Deleted', description: 'Event mapping has been removed.' });
  };

  const handleRetryEvent = (eventId: string) => {
    toast({ title: 'Retrying Event', description: 'The event is being reprocessed...' });
    // In real implementation, call API
  };

  const handleDisconnect = () => {
    if (!canDisconnect) {
      toast({ title: 'Permission Denied', description: 'Only owners and admins can disconnect integrations.', variant: 'destructive' });
      return;
    }
    disconnect(key);
    auditLog('integration.disconnected', 'integration', key, { integration_name: integration.name });
    toast({ title: 'Disconnected', description: `${integration.name} has been disconnected.` });
    navigate('/app/integrations');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingConnection(false);
    toast({ 
      title: 'Connection Healthy', 
      description: 'Webhook endpoint is responding correctly.' 
    });
  };

  const handleCopyWebhook = () => {
    const url = tenantIntegration?.webhook_url || '';
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Webhook URL copied to clipboard' });
  };

  const handleSaveProConfig = (config: ProConfig) => {
    setProConfig(config);
    toast({ title: 'Settings Saved', description: 'Pro settings have been updated.' });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/integrations')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold">
                {integration.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{integration.name}</h1>
                <p className="text-muted-foreground">{integration.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {integration.isConnected ? (
              <>
                <Badge className="bg-green-500/10 text-green-600 border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PowerOff className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect {integration.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will stop receiving webhooks and disable all event mappings. You can reconnect anytime.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700">
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button onClick={() => navigate('/app/integrations')}>
                <Power className="w-4 h-4 mr-1" />
                Connect
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mappings" className="gap-2">
              <Zap className="w-4 h-4" />
              Mappings
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Activity className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="pro" className="gap-2">
              <Crown className="w-4 h-4" />
              Pro
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <IntegrationOverview
              integration={integration}
              eventStats={eventStats}
              mappingsCount={mappings.filter(m => m.is_active).length}
              onTestConnection={handleTestConnection}
              onCopyWebhook={handleCopyWebhook}
              isTestingConnection={isTestingConnection}
            />
          </TabsContent>

          {/* Event Mappings Tab */}
          <TabsContent value="mappings" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Event → Action Mappings</CardTitle>
                  <CardDescription>
                    Configure what happens when {integration.name} sends events
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingMapping(undefined);
                  setIsMappingModalOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Mapping
                </Button>
              </CardHeader>
              <CardContent>
                {mappings.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No mappings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first event mapping to automate WhatsApp responses
                    </p>
                    <Button onClick={() => setIsMappingModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Create Mapping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mappings.map(mapping => (
                      <div
                        key={mapping.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border",
                          mapping.is_active ? "bg-background" : "bg-muted/50 opacity-60"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          mapping.is_active ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Zap className={cn(
                            "w-5 h-5",
                            mapping.is_active ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-medium">{mapping.event_type}</code>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="secondary" className="capitalize">
                              {mapping.action_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Object.keys(mapping.action_config.variable_mappings || {}).length} variables mapped
                            {mapping.conditions && mapping.conditions.length > 0 && (
                              <span> • {mapping.conditions.length} conditions</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={mapping.is_active}
                            onCheckedChange={(checked) => {
                              setMappings(mappings.map(m => 
                                m.id === mapping.id ? { ...m, is_active: checked } : m
                              ));
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingMapping(mapping);
                              setIsMappingModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMapping(mapping.id!)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Debugger Tab */}
          <TabsContent value="events">
            <EventDebugger
              events={events}
              isLoading={false}
              onRetry={handleRetryEvent}
              onRefresh={() => {
                toast({ title: 'Refreshed', description: 'Events list has been updated.' });
              }}
            />
          </TabsContent>

          {/* Pro Features Tab */}
          <TabsContent value="pro">
            <ProFeaturesPanel
              integrationKey={integration.key}
              isPro={false} // Would come from subscription check
              config={proConfig}
              onSave={handleSaveProConfig}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Webhook Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Use this URL in your {integration.name} settings to receive events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(webhookUrl, 'Webhook URL')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {tenantIntegration?.webhook_secret && (
                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tenantIntegration.webhook_secret}
                        readOnly
                        type="password"
                        className="font-mono text-sm bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(tenantIntegration.webhook_secret!, 'Webhook Secret')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use this to verify webhook signatures
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Events */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Events</CardTitle>
                <CardDescription>
                  Events that {integration.name} can send to your webhook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {integration.supported_events.map(event => (
                    <Badge key={event} variant="outline" className="font-mono text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Learn how to set up and use this integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={integration.documentation_url || '#'} target="_blank" rel="noopener">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {integration.name} Setup Guide
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/docs/integrations/webhooks" target="_blank" rel="noopener">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Webhook Reference
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Mapping Modal */}
        <EventActionMappingModal
          isOpen={isMappingModalOpen}
          onClose={() => {
            setIsMappingModalOpen(false);
            setEditingMapping(undefined);
          }}
          integrationName={integration.name}
          integrationKey={integration.key}
          supportedEvents={integration.supported_events.map(e => `${integration.key}.${e}`)}
          onSave={handleSaveMapping}
          existingMapping={editingMapping}
        />
      </div>
    </DashboardLayout>
  );
}
