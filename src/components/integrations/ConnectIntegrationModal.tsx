import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Copy, 
  Key, 
  Link2, 
  Loader2,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { IntegrationCatalog } from '@/types/integration';

interface ConnectIntegrationModalProps {
  integration: IntegrationCatalog | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials?: Record<string, unknown>) => void;
  isConnecting: boolean;
}

type Step = 'authenticate' | 'verify' | 'success';

export function ConnectIntegrationModal({
  integration,
  isOpen,
  onClose,
  onConnect,
  isConnecting,
}: ConnectIntegrationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('authenticate');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  if (!integration) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationError(null);

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For API type, generate keys
    if (integration.auth_type === 'api_key' && integration.key === 'api') {
      setGeneratedApiKey(`ak_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`);
      setGeneratedSecret(`sk_${crypto.randomUUID().replace(/-/g, '')}`);
    }

    setIsVerifying(false);
    setStep('verify');
  };

  const handleConnect = () => {
    onConnect(credentials);
    setStep('success');
  };

  const handleClose = () => {
    setStep('authenticate');
    setCredentials({});
    setVerificationError(null);
    setGeneratedApiKey(null);
    setGeneratedSecret(null);
    onClose();
  };

  const renderAuthContent = () => {
    switch (integration.auth_type) {
      case 'api_key':
        if (integration.key === 'api') {
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate API credentials to integrate with your systems. Your API key and secret will be displayed once - make sure to save them securely.
              </p>
              <Button 
                onClick={handleVerify} 
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Credentials...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate API Credentials
                  </>
                )}
              </Button>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder={`Enter your ${integration.name} API key`}
                value={credentials.api_key || ''}
                onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
              />
            </div>
            {integration.key === 'woocommerce' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    placeholder="Enter your WooCommerce consumer secret"
                    value={credentials.consumer_secret || ''}
                    onChange={(e) => setCredentials({ ...credentials, consumer_secret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_url">Store URL</Label>
                  <Input
                    id="store_url"
                    placeholder="https://your-store.com"
                    value={credentials.store_url || ''}
                    onChange={(e) => setCredentials({ ...credentials, store_url: e.target.value })}
                  />
                </div>
              </>
            )}
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying || !credentials.api_key}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Connection'
              )}
            </Button>
          </div>
        );

      case 'oauth':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click below to authorize AiReatro to connect with your {integration.name} account.
            </p>
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect with {integration.name}
                </>
              )}
            </Button>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy this webhook URL and paste it in your {integration.name} settings.
            </p>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`https://api.aireatro.com/webhooks/${integration.key}/YOUR_TENANT_ID`}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopy(
                    `https://api.aireatro.com/webhooks/${integration.key}/YOUR_TENANT_ID`,
                    'Webhook URL'
                  )}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Waiting for webhook...
                </>
              ) : (
                'I\'ve Added the Webhook'
              )}
            </Button>
          </div>
        );
    }
  };

  const renderVerifyContent = () => {
    if (integration.key === 'api' && generatedApiKey) {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Credentials Generated!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Save these credentials securely. The secret will not be shown again.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedApiKey}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopy(generatedApiKey, 'API Key')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedSecret || ''}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopy(generatedSecret || '', 'API Secret')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Example cURL Request</Label>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto">
{`curl -X POST https://api.aireatro.com/v1/messages \\
  -H "Authorization: Bearer ${generatedApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1234567890",
    "template": "order_confirmation",
    "variables": {"name": "John"}
  }'`}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7"
                onClick={() => handleCopy(`curl -X POST...`, 'cURL example')}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          <Button onClick={handleConnect} className="w-full" disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Connection Verified!</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Your {integration.name} connection has been verified. Click below to complete the setup.
        </p>

        <Button onClick={handleConnect} className="w-full" disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Complete Connection'
          )}
        </Button>
      </div>
    );
  };

  const renderSuccessContent = () => (
    <div className="space-y-4 text-center py-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Successfully Connected!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {integration.name} is now connected to your workspace.
        </p>
      </div>
      <div className="pt-4">
        <Button onClick={handleClose} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {integration.auth_type === 'api_key' ? (
                <Key className="w-5 h-5 text-primary" />
              ) : integration.auth_type === 'oauth' ? (
                <ExternalLink className="w-5 h-5 text-primary" />
              ) : (
                <Link2 className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>Connect {integration.name}</DialogTitle>
              <DialogDescription>
                {integration.auth_type === 'api_key' && 'Enter your API credentials'}
                {integration.auth_type === 'oauth' && 'Authorize with OAuth'}
                {integration.auth_type === 'webhook' && 'Configure webhook'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 py-4">
            {(['authenticate', 'verify'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s ? "bg-primary text-primary-foreground" :
                  (['verify', 'success'].includes(step) && s === 'authenticate') 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {(['verify', 'success'].includes(step) && s === 'authenticate') ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 1 && (
                  <div className={cn(
                    "w-12 h-0.5 rounded",
                    step === 'verify' ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="py-2">
          {step === 'authenticate' && renderAuthContent()}
          {step === 'verify' && renderVerifyContent()}
          {step === 'success' && renderSuccessContent()}
        </div>

        {verificationError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-600">Verification Failed</p>
              <p className="text-xs text-red-500">{verificationError}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
