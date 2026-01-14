import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Copy, 
  Key, 
  Loader2,
  AlertCircle,
  Zap,
  Settings,
  ExternalLink,
  Clock,
  ArrowRight,
  RefreshCw,
  Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface RazorpayConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SetupMode = 'one-click' | 'manual';
type Step = 'setup' | 'verifying' | 'success' | 'error';

interface WebhookCredentials {
  webhookUrl: string;
  webhookSecret: string;
}

export function RazorpayConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: RazorpayConnectModalProps) {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  
  const [mode, setMode] = useState<SetupMode>('one-click');
  const [step, setStep] = useState<Step>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // One-click credentials
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  
  // Generated webhook info
  const [webhookCredentials, setWebhookCredentials] = useState<WebhookCredentials | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('setup');
      setError(null);
      setKeyId('');
      setKeySecret('');
      
      // Generate webhook credentials for manual mode
      generateWebhookCredentials();
    }
  }, [isOpen]);

  const generateWebhookCredentials = () => {
    if (!currentTenant?.id) return;
    
    const webhookSecret = crypto.randomUUID().replace(/-/g, '');
    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-webhook/${currentTenant.id}/razorpay`;
    
    setWebhookCredentials({
      webhookUrl,
      webhookSecret,
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const handleOneClickConnect = async () => {
    if (!currentTenant?.id) {
      setError('No workspace selected');
      return;
    }

    if (!keyId.trim() || !keySecret.trim()) {
      setError('Please enter both Key ID and Key Secret');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('verifying');

    try {
      // Call edge function to validate credentials and auto-create webhook
      const { data, error: fnError } = await supabase.functions.invoke('razorpay-connect', {
        body: {
          tenantId: currentTenant.id,
          keyId: keyId.trim(),
          keySecret: keySecret.trim(),
          autoCreateWebhook: true,
        },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update webhook credentials with the generated ones
      if (data?.webhookUrl && data?.webhookSecret) {
        setWebhookCredentials({
          webhookUrl: data.webhookUrl,
          webhookSecret: data.webhookSecret,
        });
      }

      setStep('success');
      toast({
        title: 'Razorpay Connected!',
        description: 'Webhooks have been configured automatically.',
      });
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect Razorpay. Please try Manual Setup.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!currentTenant?.id || !webhookCredentials) {
      setError('No workspace selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save integration with webhook credentials
      const { error: upsertError } = await supabase
        .from('tenant_integrations')
        .upsert({
          tenant_id: currentTenant.id,
          integration_key: 'razorpay',
          status: 'pending',
          credentials: {},
          config: { setupMode: 'manual' },
          webhook_url: webhookCredentials.webhookUrl,
          webhook_secret: webhookCredentials.webhookSecret,
          health_status: 'unknown',
        } as any, {
          onConflict: 'tenant_id,integration_key',
        });

      if (upsertError) throw upsertError;

      setStep('success');
      toast({
        title: 'Webhook Details Saved',
        description: 'Add the webhook to your Razorpay dashboard to complete setup.',
      });
    } catch (err: any) {
      console.error('Manual setup error:', err);
      setError(err.message || 'Failed to save webhook configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    onClose();
  };

  const handleTestConnection = async () => {
    if (!webhookCredentials) return;

    toast({
      title: 'Test Instructions',
      description: 'Create a test payment in Razorpay to trigger a webhook event.',
    });
  };

  const renderSetupContent = () => (
    <Tabs value={mode} onValueChange={(v) => setMode(v as SetupMode)}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="one-click" className="gap-2">
          <Zap className="w-4 h-4" />
          One-Click Connect
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-2">
          <Settings className="w-4 h-4" />
          Manual Setup
        </TabsTrigger>
      </TabsList>

      <TabsContent value="one-click" className="space-y-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Recommended</p>
                <p className="text-xs text-muted-foreground">
                  Enter your Razorpay credentials and we'll configure webhooks automatically.
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">~2 min</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyId" className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              Razorpay Key ID
            </Label>
            <Input
              id="keyId"
              placeholder="rzp_live_xxxxxxxxxx"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Find this in Razorpay Dashboard → Settings → API Keys
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keySecret" className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              Razorpay Key Secret
            </Label>
            <Input
              id="keySecret"
              type="password"
              placeholder="••••••••••••••••••••"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              className="font-mono"
            />
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">We'll automatically:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                Create webhook endpoint in Razorpay
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                Subscribe to payment events (payment.captured, payment.failed, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                Configure secure signature verification
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleOneClickConnect}
            disabled={isLoading || !keyId || !keySecret}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect & Auto-Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="manual" className="space-y-4">
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Webhook className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Manual Configuration</p>
                <p className="text-xs text-muted-foreground">
                  Copy the webhook URL below and add it to your Razorpay dashboard.
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">~5 min</Badge>
            </div>
          </CardContent>
        </Card>

        {webhookCredentials && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookCredentials.webhookUrl}
                  readOnly
                  className="font-mono text-xs bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopy(webhookCredentials.webhookUrl, 'Webhook URL')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookCredentials.webhookSecret}
                  readOnly
                  className="font-mono text-xs bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopy(webhookCredentials.webhookSecret, 'Webhook Secret')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Setup Steps:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">1</span>
                  <span>Login to your <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Razorpay Dashboard <ExternalLink className="w-3 h-3" /></a></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">2</span>
                  <span>Go to Settings → Webhooks → Add New Webhook</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">3</span>
                  <span>Paste the Webhook URL from above</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">4</span>
                  <span>Set the Secret as the Webhook Secret above</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">5</span>
                  <span>Select events: payment.captured, payment.failed, payment_link.paid, invoice.paid</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">6</span>
                  <span>Save the webhook configuration</span>
                </li>
              </ol>
            </div>

            <Button 
              onClick={handleManualConnect}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "I've Added the Webhook"
              )}
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );

  const renderVerifyingContent = () => (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Connecting to Razorpay...</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Validating credentials and configuring webhooks
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        This may take a few seconds
      </div>
    </div>
  );

  const renderSuccessContent = () => (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Razorpay Connected!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === 'one-click' 
            ? 'Webhooks have been configured automatically.'
            : 'Add the webhook to your Razorpay dashboard to start receiving events.'
          }
        </p>
      </div>

      {webhookCredentials && mode === 'manual' && (
        <Card className="text-left bg-muted/50">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Webhook URL</p>
            <div className="flex gap-2">
              <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                {webhookCredentials.webhookUrl}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleCopy(webhookCredentials.webhookUrl, 'Webhook URL')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 pt-4">
        <Button onClick={handleClose}>
          Go to Integration Settings
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline" onClick={handleTestConnection}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Test Connection
        </Button>
      </div>
    </div>
  );

  const renderErrorContent = () => (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Connection Failed</h3>
        <p className="text-sm text-destructive mt-1">{error}</p>
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <Button onClick={() => { setStep('setup'); setError(null); }}>
          Try Again
        </Button>
        <Button 
          variant="outline" 
          onClick={() => { setMode('manual'); setStep('setup'); setError(null); }}
        >
          Switch to Manual Setup
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <div>
              <DialogTitle>Connect Razorpay</DialogTitle>
              <DialogDescription>
                {step === 'setup' && 'Choose your preferred setup method'}
                {step === 'verifying' && 'Setting up connection...'}
                {step === 'success' && 'Connection established'}
                {step === 'error' && 'Setup failed'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          {step === 'setup' && renderSetupContent()}
          {step === 'verifying' && renderVerifyingContent()}
          {step === 'success' && renderSuccessContent()}
          {step === 'error' && renderErrorContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
