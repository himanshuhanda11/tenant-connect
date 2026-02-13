import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Facebook, 
  Phone, 
  Shield, 
  Webhook,
  Building2,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { usePhoneNumbers, useWABAs } from '@/hooks/usePhoneNumbers';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type Step = 'method' | 'connect' | 'select' | 'verify' | 'webhook' | 'complete';

// For embedded signup, only show method → connect → complete (3 steps)
const EMBEDDED_STEPS: { id: Step; title: string; description: string }[] = [
  { id: 'method', title: 'Connection Method', description: 'Choose how to connect' },
  { id: 'connect', title: 'Connect Meta', description: 'Authenticate with Meta' },
  { id: 'complete', title: 'Complete', description: 'Setup complete' },
];

const MANUAL_STEPS: { id: Step; title: string; description: string }[] = [
  { id: 'method', title: 'Connection Method', description: 'Choose how to connect' },
  { id: 'connect', title: 'Connect Meta', description: 'Enter details' },
  { id: 'select', title: 'Select Number', description: 'Choose WABA & number' },
  { id: 'webhook', title: 'Webhooks', description: 'Configure webhooks' },
  { id: 'complete', title: 'Complete', description: 'Setup complete' },
];

interface WizardState {
  method: 'embedded' | 'manual' | null;
  wabaId: string;
  wabaName: string;
  phoneNumberId: string;
  phoneE164: string;
  displayName: string;
  verificationCode: string;
  webhookUrl: string;
}

export default function ConnectNumber() {
  const navigate = useNavigate();
  const { addPhoneNumber } = usePhoneNumbers();
  const { addWaba } = useWABAs();
  const { currentTenant, refreshTenants, setCurrentTenant, tenants } = useTenant();

  const [currentStep, setCurrentStep] = useState<Step>('method');
  const [isConnecting, setIsConnecting] = useState(false);
  const [state, setState] = useState<WizardState>({
    method: null,
    wabaId: '',
    wabaName: '',
    phoneNumberId: '',
    phoneE164: '',
    displayName: '',
    verificationCode: '',
    webhookUrl: '',
  });

  const steps = state.method === 'manual' ? MANUAL_STEPS 
    : state.method === 'embedded' ? EMBEDDED_STEPS 
    : EMBEDDED_STEPS; // default before selection

  const stepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleBack = () => {
    const prevStep = steps[stepIndex - 1];
    if (prevStep) {
      // Skip verify step when going back in manual setup
      if (prevStep.id === 'verify' && state.method === 'manual') {
        const selectStep = steps.find(s => s.id === 'select');
        if (selectStep) { setCurrentStep(selectStep.id); return; }
      }
      setCurrentStep(prevStep.id);
    }
  };

  const handleNext = () => {
    const nextStep = steps[stepIndex + 1];
    if (nextStep) {
      // Skip verify step for manual setup - number is already verified on Meta's side
      if (nextStep.id === 'verify' && state.method === 'manual') {
        const webhookStep = steps.find(s => s.id === 'webhook');
        if (webhookStep) { setCurrentStep(webhookStep.id); return; }
      }
      setCurrentStep(nextStep.id);
    }
  };

  const handleComplete = async () => {
    setIsConnecting(true);
    try {
      // Add WABA first and get back the database UUID
      let wabaUuid = '';
      if (state.wabaId) {
        const wabaResult = await addWaba({
          waba_id: state.wabaId,
          name: state.wabaName || 'My Business',
        });
        // Use the returned database UUID (not the Meta WABA ID)
        wabaUuid = wabaResult?.id || '';
      }

      // Add phone number using the WABA's database UUID as the foreign key
      const result = await addPhoneNumber({
        phone_number_id: state.phoneNumberId,
        phone_e164: state.phoneE164,
        display_name: state.displayName,
        waba_id: wabaUuid,
        status: 'connected',
      });

      // For manual setup, update webhook_health to indicate user needs to configure webhooks
      // For embedded signup, webhooks are auto-configured
      if (result?.id) {
        const webhookStatus = state.method === 'embedded' ? 'healthy' : 'unknown';
        await supabase
          .from('phone_numbers')
          .update({ webhook_health: webhookStatus })
          .eq('id', result.id);
      }

      // Refresh tenants to ensure workspace metadata is current
      await refreshTenants();

      setCurrentStep('complete');
    } catch (error) {
      console.error('Manual setup error:', error);
      toast.error('Failed to connect number');
    } finally {
      setIsConnecting(false);
    }
  };

  // MetaEmbeddedSignup component handles the real OAuth flow

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/phone-numbers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Connect Phone Number</h1>
            <p className="text-muted-foreground">Add a new WhatsApp Business number</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{steps[stepIndex].title}</span>
            <span className="text-muted-foreground">Step {stepIndex + 1} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        {currentStep === 'method' && (
          <div className="space-y-4">
            <Card 
              className={cn(
                "cursor-pointer hover:border-primary transition-colors",
                state.method === 'embedded' && "border-primary bg-primary/5"
              )}
              onClick={() => setState(prev => ({ ...prev, method: 'embedded' }))}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Facebook className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Embedded Signup</CardTitle>
                      <CardDescription>
                        Recommended for new users. Connect directly through Meta.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Create or select existing WABA
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Add new phone number with OTP verification
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Automatic webhook configuration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer hover:border-primary transition-colors",
                state.method === 'manual' && "border-primary bg-primary/5"
              )}
              onClick={() => setState(prev => ({ ...prev, method: 'manual' }))}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Manual Setup</CardTitle>
                    <CardDescription>
                      Connect an existing WABA and phone number manually.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Use existing WABA from Meta Business Suite
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Enter phone number ID and WABA ID manually
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Full control over configuration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!state.method}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'connect' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                Connect with Meta
              </CardTitle>
              <CardDescription>
                {state.method === 'embedded' 
                  ? 'Click below to connect your Meta Business account and set up WhatsApp.'
                  : 'Authorize AIREATRO to access your WhatsApp Business Account.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.method === 'embedded' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Sign in to your Meta Business account</li>
                      <li>Create or select a WhatsApp Business Account</li>
                      <li>Add and verify your phone number</li>
                      <li>Grant AIREATRO permission to send messages</li>
                    </ol>
                  </div>

                  <MetaEmbeddedSignup 
                    onSuccess={async (data) => {
                      setState(prev => ({
                        ...prev,
                        wabaId: data.wabaId,
                        phoneNumberId: data.phoneNumberId,
                      }));
                      // Refresh tenants to ensure workspace metadata is up-to-date
                      await refreshTenants();
                      // Backend already saved WABA + phone number + webhooks
                      // Skip directly to complete
                      setCurrentStep('complete');
                    }}
                    onError={(error) => {
                      toast.error(error.message || 'Failed to connect');
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>WABA ID</Label>
                    <Input 
                      placeholder="Enter your WABA ID"
                      value={state.wabaId}
                      onChange={(e) => setState(prev => ({ ...prev, wabaId: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in Meta Business Suite → WhatsApp Manager
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number ID</Label>
                    <Input 
                      placeholder="Enter your Phone Number ID"
                      value={state.phoneNumberId}
                      onChange={(e) => setState(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number (E.164 format)</Label>
                    <Input 
                      placeholder="+971501234567"
                      value={state.phoneE164}
                      onChange={(e) => setState(prev => ({ ...prev, phoneE164: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input 
                      placeholder="My Business Support"
                      value={state.displayName}
                      onChange={(e) => setState(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {state.method === 'manual' && (
                  <Button 
                    onClick={handleNext}
                    disabled={!state.wabaId || !state.phoneNumberId || !state.phoneE164}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Confirm Selection
              </CardTitle>
              <CardDescription>
                Review the WABA and phone number to be connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">WABA ID</span>
                    <span className="font-mono">{state.wabaId}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Number ID</span>
                    <span className="font-mono">{state.phoneNumberId}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Number</span>
                    <span className="font-mono">{state.phoneE164}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    placeholder="My Business Support"
                    value={state.displayName}
                    onChange={(e) => setState(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'verify' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify Phone Number
              </CardTitle>
              <CardDescription>
                {state.method === 'embedded' 
                  ? 'Your phone number has been verified through Meta.'
                  : 'Enter the verification code sent to your phone.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.method === 'embedded' ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Verification Complete</p>
                    <p className="text-sm text-green-700">Your phone number has been verified.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input 
                      placeholder="Enter 6-digit code"
                      value={state.verificationCode}
                      onChange={(e) => setState(prev => ({ ...prev, verificationCode: e.target.value }))}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      A verification code was sent to {state.phoneE164}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'webhook' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                {state.method === 'manual' 
                  ? 'Configure webhooks in your Meta App Dashboard to receive messages.'
                  : 'Webhooks are configured automatically.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.method === 'manual' ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Action Required
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      You need to configure the webhook URL in your Meta App Dashboard for messages to work.
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                      <li>Go to <strong>Meta App Dashboard → WhatsApp → Configuration</strong></li>
                      <li>Set the <strong>Callback URL</strong> to the URL below</li>
                      <li>Set the <strong>Verify Token</strong> to: <code className="bg-amber-100 px-1 rounded">smeksh_verify</code></li>
                      <li>Subscribe to <strong>messages</strong> and <strong>message_template_status_update</strong> fields</li>
                      <li>Click <strong>Verify and Save</strong></li>
                    </ol>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Callback URL</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1.5 rounded flex-1 break-all">
                          {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0 h-8 w-8"
                          onClick={() => {
                            navigator.clipboard.writeText(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`);
                            toast.success('Copied to clipboard');
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Subscribed Events</span>
                      <span className="text-sm">messages, statuses</span>
                    </div>
                  </div>

                  <a 
                    href="https://developers.facebook.com/apps/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Open Meta App Dashboard
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Webhooks Configured</p>
                    <p className="text-sm text-green-700">AIREATRO will receive all WhatsApp events automatically.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={isConnecting}>
                  {isConnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Complete Setup
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Number Connected!</h2>
                <p className="text-muted-foreground">
                  Your WhatsApp Business number is ready to use.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 inline-block">
                <p className="font-mono text-lg">{state.phoneE164}</p>
                <p className="text-sm text-muted-foreground">{state.displayName || 'Unnamed'}</p>
              </div>

              {state.method === 'manual' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Make sure you've configured the webhook URL in your Meta App Dashboard. 
                    Messages won't work until webhooks are properly set up.
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/phone-numbers')}>
                  View All Numbers
                </Button>
                <Button onClick={() => {
                  // Ensure currentTenant is set (it should be since we connected on this workspace)
                  if (currentTenant) {
                    setCurrentTenant(currentTenant);
                  }
                  navigate('/inbox');
                }}>
                  Go to Inbox
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
