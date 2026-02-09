import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Megaphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Facebook,
  Building2,
  FileText,
  Phone,
  Shield,
  Sparkles,
  Loader2,
  Info,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// No longer need AdAccount/FacebookPage interfaces - using manual entry

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETUP_STEPS: SetupStep[] = [
  { id: 1, title: 'Connect Facebook', description: 'Sign in with your Facebook account', icon: Facebook },
  { id: 2, title: 'Ad Account', description: 'Select your Meta Ad Account', icon: Building2 },
  { id: 3, title: 'Facebook Page', description: 'Choose your business page', icon: FileText },
  { id: 4, title: 'WhatsApp Number', description: 'Link your WhatsApp Business number', icon: Phone },
  { id: 5, title: 'Finalize', description: 'Review and enable tracking', icon: CheckCircle2 },
];

export default function MetaAdsSetup() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    facebookConnected: false,
    fbUserName: '',
    adAccountId: '',
    adAccountName: '',
    pageId: '',
    pageName: '',
    phoneNumberId: '',
    phoneDisplay: '',
  });

  // Handle OAuth callback redirect
  useEffect(() => {
    const session = searchParams.get('session');
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (error) {
      toast.error(error);
      // Clear URL params
      navigate('/meta-ads/setup', { replace: true });
      return;
    }

    if (connected === '1' && session) {
      setSessionId(session);
      // Fetch the pending setup data
      fetchSetupData(session);
    }
  }, [searchParams]);

  const fetchSetupData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .select('setup_data, meta_user_name')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Failed to load connection data');
        return;
      }

      setFormData(prev => ({
        ...prev,
        facebookConnected: true,
        fbUserName: data.meta_user_name || 'Facebook User',
      }));
      setCurrentStep(2);
      toast.success('Facebook account connected!');

      // Clean URL
      navigate('/meta-ads/setup', { replace: true });
    } catch (err) {
      console.error('Error fetching setup data:', err);
    }
  };

  // Fetch existing phone numbers
  const phoneNumbersQuery = useQuery({
    queryKey: ['phone-numbers', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('id, display_number, phone_number_id, quality_rating')
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  // Check if already connected
  const existingAccountQuery = useQuery({
    queryKey: ['meta-ad-accounts', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const phoneNumbers = phoneNumbersQuery.data || [];
  const progress = (currentStep / SETUP_STEPS.length) * 100;

  const handleFacebookConnect = async () => {
    if (!currentTenant) {
      toast.error('No workspace selected');
      return;
    }

    setIsConnecting(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/meta-ads-connect-start?tenantId=${currentTenant.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start connection');
      }

      if (result.url) {
        // Redirect to Meta OAuth
        window.location.href = result.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (err: any) {
      console.error('Error starting Meta Ads connect:', err);
      toast.error(err.message || 'Failed to start connection');
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }

    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (sessionId) {
        // Update the pending row with selected values
        const { error } = await supabase
          .from('smeksh_meta_ad_accounts')
          .update({
            meta_account_id: formData.adAccountId,
            meta_account_name: formData.adAccountName,
            facebook_page_id: formData.pageId,
            facebook_page_name: formData.pageName,
            whatsapp_phone_number_id: formData.phoneNumberId,
            whatsapp_display_number: formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number || null,
            status: 'connected',
            is_active: true,
            setup_data: null, // Clear temporary data
          })
          .eq('id', sessionId);

        if (error) throw error;
      } else {
        // Fallback: create new row (shouldn't normally happen)
        const { error } = await supabase
          .from('smeksh_meta_ad_accounts')
          .upsert({
            workspace_id: currentTenant.id,
            meta_account_id: formData.adAccountId,
            meta_account_name: formData.adAccountName,
            meta_user_name: formData.fbUserName,
            facebook_page_id: formData.pageId,
            facebook_page_name: formData.pageName,
            whatsapp_phone_number_id: formData.phoneNumberId,
            whatsapp_display_number: formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number || null,
            status: 'connected' as const,
            is_active: true,
            connected_by: user?.id || null,
          }, {
            onConflict: 'workspace_id,meta_account_id',
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['meta-ad-campaigns'] });

      toast.success('Meta Ads tracking enabled successfully!');
      navigate('/meta-ads');
    } catch (err: any) {
      console.error('Failed to save Meta Ads connection:', err);
      toast.error(err.message || 'Failed to save connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.facebookConnected;
      case 2: return !!formData.adAccountId;
      case 3: return !!formData.pageId;
      case 4: return !!formData.phoneNumberId;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <Megaphone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Connect Meta Ads</h1>
            <p className="text-muted-foreground">
              Set up Click-to-WhatsApp ad tracking in a few simple steps
            </p>
          </div>
        </div>

        {/* Already connected notice */}
        {(existingAccountQuery.data?.length || 0) > 0 && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
              You already have {existingAccountQuery.data?.length} connected Meta Ad account(s). 
              You can add another one below.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {SETUP_STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-8">
          {SETUP_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted && "bg-primary border-primary",
                    isCurrent && "border-primary bg-primary/10",
                    !isCompleted && !isCurrent && "border-muted-foreground/30"
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <StepIcon className={cn(
                        "h-5 w-5",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 text-center max-w-[80px]",
                    isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {idx < SETUP_STEPS.length - 1 && (
                  <div className={cn(
                    "w-full h-0.5 mx-2 mt-[-20px]",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} style={{ minWidth: '40px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const CurrentIcon = SETUP_STEPS[currentStep - 1].icon;
                return <CurrentIcon className="h-5 w-5 text-primary" />;
              })()}
              {SETUP_STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{SETUP_STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Connect Facebook */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Sign in with Facebook to verify your identity. You'll then enter your 
                    Ad Account ID and Page ID manually in the next steps.
                  </AlertDescription>
                </Alert>

                {formData.facebookConnected ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook Connected</p>
                      <p className="text-sm text-muted-foreground">Signed in as {formData.fbUserName}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700">
                      Connected
                    </Badge>
                  </div>
                ) : (
                  <Button
                    onClick={handleFacebookConnect}
                    disabled={isConnecting}
                    className="w-full h-14 bg-[#1877F2] hover:bg-[#166FE5] text-white gap-3 text-lg"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Facebook className="h-5 w-5" />
                    )}
                    {isConnecting ? 'Redirecting to Facebook...' : 'Continue with Facebook'}
                  </Button>
                )}
              </div>
            )}

            {/* Step 2: Choose Ad Account */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Label>Meta Ad Account ID</Label>
                <Input
                  placeholder="act_123456789"
                  value={formData.adAccountId}
                  onChange={(e) => setFormData(prev => ({ ...prev, adAccountId: e.target.value.trim() }))}
                  className="h-12"
                />
                <Label>Ad Account Name (optional)</Label>
                <Input
                  placeholder="My Business Ad Account"
                  value={formData.adAccountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adAccountName: e.target.value }))}
                  className="h-12"
                />

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Find your Ad Account ID in <strong>Meta Business Suite → Settings → Ad Accounts</strong>. 
                    It starts with <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">act_</code>.
                  </AlertDescription>
                </Alert>

                {formData.adAccountId && (
                  <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                      Ad account selected. AIREATRO will only read campaign performance data.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 3: Choose Page */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Label>Facebook Page ID</Label>
                <Input
                  placeholder="123456789012345"
                  value={formData.pageId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageId: e.target.value.trim() }))}
                  className="h-12"
                />
                <Label>Page Name (optional)</Label>
                <Input
                  placeholder="My Business Page"
                  value={formData.pageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                  className="h-12"
                />

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Find your Page ID in <strong>Facebook Page → About → Page ID</strong>, or 
                    in <strong>Meta Business Suite → Settings → Pages</strong>.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Link WhatsApp Number */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Label>Select WhatsApp Business Number</Label>
                <Select
                  value={formData.phoneNumberId}
                  onValueChange={(value) => {
                    const phone = phoneNumbers.find(p => p.id === value);
                    setFormData(prev => ({ ...prev, phoneNumberId: value, phoneDisplay: phone?.display_number || '' }));
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a WhatsApp number" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneNumbers.length > 0 ? phoneNumbers.map((phone) => (
                      <SelectItem key={phone.id} value={phone.id}>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{phone.display_number || phone.phone_number_id}</span>
                          {phone.quality_rating === 'GREEN' && (
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                              Active
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )) : (
                      <SelectItem value="__none__" disabled>
                        No WhatsApp numbers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This number must be connected to AIREATRO and linked to your Meta Business account.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 5: Finalize */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Setup Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Facebook Account</span>
                      <span className="font-medium">{formData.fbUserName}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ad Account</span>
                      <span className="font-medium">{formData.adAccountName}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Facebook Page</span>
                      <span className="font-medium">{formData.pageName}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">WhatsApp Number</span>
                      <span className="font-medium">
                        {formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                    <strong>Privacy Notice:</strong> AIREATRO will only read ad performance data and lead events. 
                    We do not create, modify, or manage your ads. All advertising remains in Meta Ads Manager.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === SETUP_STEPS.length ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || isConnecting}
              className="gap-2 shadow-lg shadow-primary/25"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Enable Click-to-WhatsApp Tracking
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
