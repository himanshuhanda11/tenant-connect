import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  Settings, 
  Activity, 
  Shield, 
  Webhook, 
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Send,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { usePhoneNumbers, useWebhookLogs, useQualityHistory } from '@/hooks/usePhoneNumbers';
import { 
  STATUS_CONFIG, 
  QUALITY_CONFIG, 
  LIMIT_CONFIG, 
  WEBHOOK_HEALTH_CONFIG 
} from '@/types/phoneNumber';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PhoneNumberDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { phoneNumbers, updatePhoneNumber, setDefaultNumber } = usePhoneNumbers();
  const number = phoneNumbers.find(n => n.id === id);
  const { logs } = useWebhookLogs(number?.phone_number_id);
  const { history } = useQualityHistory(number?.id);

  const [activeTab, setActiveTab] = useState('overview');

  if (!number) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Number not found</h2>
            <Button variant="outline" onClick={() => navigate('/phone-numbers')}>
              Back to Phone Numbers
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/phone-numbers')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{number.display_name || 'Unnamed'}</h1>
                {number.is_default && (
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                )}
              </div>
              <p className="text-muted-foreground font-mono">{number.phone_e164}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setDefaultNumber(number.id)}>
              <Star className="h-4 w-4 mr-2" />
              {number.is_default ? 'Default' : 'Set Default'}
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  className={cn(
                    STATUS_CONFIG[number.status].bgColor,
                    STATUS_CONFIG[number.status].color,
                    "border-0"
                  )}
                >
                  {STATUS_CONFIG[number.status].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quality</span>
                <Badge 
                  className={cn(
                    QUALITY_CONFIG[number.quality_rating].bgColor,
                    QUALITY_CONFIG[number.quality_rating].color,
                    "border-0"
                  )}
                >
                  {QUALITY_CONFIG[number.quality_rating].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messaging Limit</span>
                <span className="font-medium">{LIMIT_CONFIG[number.messaging_limit].label}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Webhook</span>
                <Badge 
                  className={cn(
                    WEBHOOK_HEALTH_CONFIG[number.webhook_health].bgColor,
                    WEBHOOK_HEALTH_CONFIG[number.webhook_health].color,
                    "border-0"
                  )}
                >
                  {WEBHOOK_HEALTH_CONFIG[number.webhook_health].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="routing" className="gap-2">
              <Users className="h-4 w-4" />
              Routing
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Number Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Number ID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{number.phone_number_id}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleCopy(number.phone_number_id, 'Phone Number ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">WABA ID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{number.waba_id || '-'}</code>
                      {number.waba_id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleCopy(number.waba_id!, 'WABA ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verified Name</span>
                    <span>{number.verified_name || '-'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span>{format(new Date(number.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Message</span>
                    <span>
                      {number.last_message_at 
                        ? formatDistanceToNow(new Date(number.last_message_at), { addSuffix: true })
                        : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quality History */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Rating History</CardTitle>
                  <CardDescription>Track your messaging quality over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.map((entry, index) => (
                      <div key={entry.id} className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          QUALITY_CONFIG[entry.quality_rating].bgColor
                        )}>
                          {index === 0 ? (
                            <Minus className={cn("h-4 w-4", QUALITY_CONFIG[entry.quality_rating].color)} />
                          ) : history[index - 1]?.quality_rating === 'green' && entry.quality_rating !== 'green' ? (
                            <TrendingDown className={cn("h-4 w-4", QUALITY_CONFIG[entry.quality_rating].color)} />
                          ) : (
                            <TrendingUp className={cn("h-4 w-4", QUALITY_CONFIG[entry.quality_rating].color)} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className={cn(
                                QUALITY_CONFIG[entry.quality_rating].bgColor,
                                QUALITY_CONFIG[entry.quality_rating].color,
                                "border-0"
                              )}
                            >
                              {QUALITY_CONFIG[entry.quality_rating].label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {LIMIT_CONFIG[entry.messaging_limit].label}
                            </span>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1">{entry.reason}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.recorded_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Routing Tab */}
          <TabsContent value="routing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Routing</CardTitle>
                <CardDescription>Configure how conversations are assigned for this number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Team</Label>
                    <Select 
                      value={number.default_team_id || 'none'}
                      onValueChange={(value) => updatePhoneNumber(number.id, { 
                        default_team_id: value === 'none' ? undefined : value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No default team</SelectItem>
                        <SelectItem value="t1">Support Team</SelectItem>
                        <SelectItem value="t2">Sales Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assignment Strategy</Label>
                    <Select 
                      value={number.default_assignment_strategy}
                      onValueChange={(value) => updatePhoneNumber(number.id, { 
                        default_assignment_strategy: value as any 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">Round Robin</SelectItem>
                        <SelectItem value="least_busy">Least Busy</SelectItem>
                        <SelectItem value="manual">Manual Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Only Assign to Online Agents</Label>
                    <p className="text-sm text-muted-foreground">
                      Skip agents who are offline during assignment
                    </p>
                  </div>
                  <Switch 
                    checked={number.only_online}
                    onCheckedChange={(checked) => updatePhoneNumber(number.id, { only_online: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Open Conversations per Agent</Label>
                  <Input 
                    type="number"
                    placeholder="No limit"
                    value={number.max_open_conversations_per_agent || ''}
                    onChange={(e) => updatePhoneNumber(number.id, { 
                      max_open_conversations_per_agent: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opt-in & Compliance Settings</CardTitle>
                <CardDescription>Control messaging compliance for this number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enforce Opt-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Require contacts to opt-in before sending messages
                    </p>
                  </div>
                  <Switch 
                    checked={number.enforce_opt_in}
                    onCheckedChange={(checked) => updatePhoneNumber(number.id, { enforce_opt_in: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Block Marketing Without Opt-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent marketing templates for non-opted-in contacts
                    </p>
                  </div>
                  <Switch 
                    checked={number.block_marketing_without_optin}
                    onCheckedChange={(checked) => updatePhoneNumber(number.id, { block_marketing_without_optin: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Health</CardTitle>
                    <CardDescription>Monitor webhook delivery status</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={cn(
                        WEBHOOK_HEALTH_CONFIG[number.webhook_health].bgColor,
                        WEBHOOK_HEALTH_CONFIG[number.webhook_health].color,
                        "border-0"
                      )}
                    >
                      {WEBHOOK_HEALTH_CONFIG[number.webhook_health].label}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Webhook
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{logs.filter(l => l.success).length}</p>
                      <p className="text-sm text-muted-foreground">Successful</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{logs.filter(l => !l.success).length}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">
                        {logs.length > 0 ? Math.round(logs.reduce((a, l) => a + (l.latency_ms || 0), 0) / logs.length) : 0}ms
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Latency</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Recent Deliveries</h4>
                    <div className="space-y-2">
                      {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{log.event_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(log.received_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{log.status_code}</p>
                            <p className="text-xs text-muted-foreground">{log.latency_ms}ms</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    value={number.display_name || ''}
                    onChange={(e) => updatePhoneNumber(number.id, { display_name: e.target.value })}
                    placeholder="Enter display name"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">
                  Disconnect Number
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
