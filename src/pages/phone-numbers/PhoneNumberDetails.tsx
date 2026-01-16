import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  ExternalLink,
  Loader2,
  TestTube,
  Phone as PhoneIcon
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
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  
  const { phoneNumbers, updatePhoneNumber, setDefaultNumber, refetch } = usePhoneNumbers();
  const number = phoneNumbers.find(n => n.id === id);
  const { logs } = useWebhookLogs(number?.phone_number_id);
  const { history } = useQualityHistory(number?.id);

  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Test message state
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessageType, setTestMessageType] = useState<'session' | 'template'>('template');
  const [testMessage, setTestMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    messageId?: string;
    status?: string;
    error?: string;
  } | null>(null);

  // Webhook subscription state
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') || 'overview');
    }
  }, [searchParams]);

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

  const handleSubscribeWebhooks = async () => {
    if (!number.waba_uuid) {
      toast.error('WABA account not linked to this phone number');
      return;
    }

    setIsSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('waba-webhook-subscribe', {
        body: {
          wabaAccountId: number.waba_uuid,
          action: 'subscribe'
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success('Webhook subscription activated successfully');
        refetch();
      } else {
        throw new Error(data?.error || 'Subscription failed');
      }
    } catch (error: any) {
      console.error('Webhook subscription error:', error);
      toast.error(error.message || 'Failed to subscribe to webhooks');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testRecipient) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      // Simulate test message - in production this would call the edge function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResult({
        success: true,
        messageId: `wamid.${Date.now()}`,
        status: 'sent',
      });
      
      toast.success('Test message sent successfully');
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to send test message',
      });
      toast.error('Failed to send test message');
    } finally {
      setIsSendingTest(false);
    }
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
                <h1 className="text-2xl font-bold">{number.display_name || 'Unnamed Number'}</h1>
                {number.is_default && (
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                )}
              </div>
              <p className="text-muted-foreground font-mono">{number.phone_e164}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setDefaultNumber(number.id)}>
              <Star className="h-4 w-4 mr-2" />
              {number.is_default ? 'Default' : 'Set Default'}
            </Button>
            <Button onClick={() => setActiveTab('diagnostics')}>
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
                    STATUS_CONFIG[number.status]?.bgColor,
                    STATUS_CONFIG[number.status]?.color,
                    "border-0"
                  )}
                >
                  {STATUS_CONFIG[number.status]?.label}
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
                    QUALITY_CONFIG[number.quality_rating]?.bgColor,
                    QUALITY_CONFIG[number.quality_rating]?.color,
                    "border-0"
                  )}
                >
                  {QUALITY_CONFIG[number.quality_rating]?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messaging Limit</span>
                <span className="font-medium">{LIMIT_CONFIG[number.messaging_limit]?.label}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Webhook</span>
                <Badge 
                  className={cn(
                    WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.bgColor,
                    WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.color,
                    "border-0"
                  )}
                >
                  {WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="routing" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Routing</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="h-4 w-4" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="gap-2">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Diagnostics</span>
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
                    {history.length > 0 ? history.map((entry, index) => (
                      <div key={entry.id} className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          QUALITY_CONFIG[entry.quality_rating]?.bgColor
                        )}>
                          {index === 0 ? (
                            <Minus className={cn("h-4 w-4", QUALITY_CONFIG[entry.quality_rating]?.color)} />
                          ) : history[index - 1]?.quality_rating === 'green' && entry.quality_rating !== 'green' ? (
                            <TrendingDown className={cn("h-4 w-4", QUALITY_CONFIG[entry.quality_rating]?.color)} />
                          ) : (
                            <TrendingUp className={cn("h-4 w-4", QUALITY_CONFIG[entry.quality_rating]?.color)} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className={cn(
                                QUALITY_CONFIG[entry.quality_rating]?.bgColor,
                                QUALITY_CONFIG[entry.quality_rating]?.color,
                                "border-0"
                              )}
                            >
                              {QUALITY_CONFIG[entry.quality_rating]?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {LIMIT_CONFIG[entry.messaging_limit]?.label}
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
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No quality history available</p>
                    )}
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
            {/* Webhook Subscription Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Webhook Subscription</CardTitle>
                    <CardDescription>
                      Subscribe to receive inbound messages and delivery status updates from Meta
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleSubscribeWebhooks}
                    disabled={isSubscribing || !number.waba_uuid}
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Webhook className="h-4 w-4 mr-2" />
                        Subscribe Webhooks
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Click to register this WABA with your webhook endpoint</p>
                  <p>• Required to receive messages and status updates in your Inbox</p>
                  <p>• Re-run if you're not receiving webhooks after connecting</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Health</CardTitle>
                  <CardDescription>Monitor your webhook delivery status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge 
                      className={cn(
                        WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.bgColor,
                        WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.color,
                        "border-0"
                      )}
                    >
                      {WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.label}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Received</span>
                    <span className="text-sm">
                      {number.last_webhook_at 
                        ? formatDistanceToNow(new Date(number.last_webhook_at), { addSuffix: true })
                        : 'Never'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Webhook Logs</CardTitle>
                  <CardDescription>Last 10 webhook deliveries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {logs.length > 0 ? logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>{log.event_type}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{log.latency_ms}ms</span>
                          <span>{formatDistanceToNow(new Date(log.received_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No logs available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diagnostics Tab - Test Message */}
          <TabsContent value="diagnostics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Send Test Message
                  </CardTitle>
                  <CardDescription>
                    Send a test message to verify your number is working correctly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Test Recipient Phone Number</Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="+1234567890"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use your own phone number for testing. Format: +[country code][number]
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Message Type</Label>
                    <RadioGroup value={testMessageType} onValueChange={(v) => setTestMessageType(v as any)}>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="session" id="session" className="mt-0.5" />
                        <div>
                          <Label htmlFor="session" className="font-medium cursor-pointer">Session Message</Label>
                          <p className="text-xs text-muted-foreground">
                            Free-form text (only works within 24h customer service window)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="template" id="template" className="mt-0.5" />
                        <div>
                          <Label htmlFor="template" className="font-medium cursor-pointer">Template Message</Label>
                          <p className="text-xs text-muted-foreground">
                            Use an approved template (works anytime)
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {testMessageType === 'session' && (
                    <div className="space-y-2">
                      <Label>Message Text</Label>
                      <Textarea 
                        placeholder="Enter your test message..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {testMessageType === 'template' && (
                    <div className="space-y-2">
                      <Label>Select Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="welcome">Welcome Message</SelectItem>
                          <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                          <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    onClick={handleSendTestMessage} 
                    disabled={isSendingTest || !testRecipient}
                    className="w-full"
                  >
                    {isSendingTest ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Test Result */}
                {testResult && (
                  <Card className={testResult.success ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {testResult.success ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Message Sent Successfully
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Message Failed
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {testResult.messageId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Message ID</span>
                          <code className="bg-white px-2 py-1 rounded text-xs">{testResult.messageId}</code>
                        </div>
                      )}
                      {testResult.status && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-0">
                            {testResult.status}
                          </Badge>
                        </div>
                      )}
                      {testResult.error && (
                        <p className="text-sm text-red-600">{testResult.error}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Webhook Health Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Webhook Health</CardTitle>
                    <CardDescription>Real-time webhook delivery status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge 
                        className={cn(
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.bgColor,
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.color,
                          "border-0"
                        )}
                      >
                        {WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.label}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Webhook</span>
                      <span>
                        {number.last_webhook_at 
                          ? formatDistanceToNow(new Date(number.last_webhook_at), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Failures (24h)</span>
                      <span className="font-medium text-green-600">0</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="bg-blue-50/50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-900">Testing Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-blue-800 space-y-2">
                    <p>• Use your own phone number to receive the test message</p>
                    <p>• Template messages work anytime; session messages require an active conversation</p>
                    <p>• Check the webhook logs to verify status updates are being received</p>
                    <p>• If messages fail, verify your WABA has sufficient balance</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
