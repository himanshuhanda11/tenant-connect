import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Building2,
  FileText,
  Phone,
  Shield,
  Sparkles,
  Loader2,
  Info,
  Check,
  Facebook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    FB: any;
  }
}

interface MetaAdAccount {
  id: string;
  name: string;
  status: number;
  currency: string;
  timezone: string;
}

interface MetaPage {
  id: string;
  name: string;
  category: string;
  accessToken: string;
}

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETUP_STEPS: SetupStep[] = [
  { id: 1, title: 'Ad Account', description: 'Select or enter your Meta Ad Account', icon: Building2 },
  { id: 2, title: 'Facebook Page', description: 'Select or enter your Facebook Page', icon: FileText },
  { id: 3, title: 'WhatsApp Number', description: 'Link your WhatsApp Business number', icon: Phone },
  { id: 4, title: 'Finalize', description: 'Review and enable tracking', icon: CheckCircle2 },
];

export default function MetaAdsSetup() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFbLoading, setIsFbLoading] = useState(false);
  const [fbConnected, setFbConnected] = useState(false);
  const [longLivedToken, setLongLivedToken] = useState('');
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [formData, setFormData] = useState({
    adAccountId: '',
    adAccountName: '',
    pageId: '',
    pageName: '',
    phoneNumberId: '',
    phoneDisplay: '',
  });

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

  // Callback for the <fb:login-button> onlogin event
  const checkLoginState = () => {
    if (!window.FB) {
      toast.error('Facebook SDK not loaded. Please refresh the page.');
      return;
    }

    setIsFbLoading(true);

    window.FB.getLoginStatus((response: any) => {
      if (response.status === 'connected' && response.authResponse) {
        const { accessToken } = response.authResponse;
        fetchMetaData(accessToken);
      } else {
        setIsFbLoading(false);
        toast.error('Facebook login was cancelled or failed.');
      }
    });
  };

  // Expose checkLoginState globally so the fb:login-button onlogin can call it
  (window as any).checkLoginState = checkLoginState;

  // Re-parse FB XFBML when component mounts or fbConnected changes
  useEffect(() => {
    if (window.FB && !fbConnected) {
      window.FB.XFBML.parse();
    }
    return () => {
      delete (window as any).checkLoginState;
    };
  }, [fbConnected]);

  const fetchMetaData = async (shortLivedToken: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in');
        setIsFbLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            accessToken: shortLivedToken,
            tenantId: currentTenant?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Meta data');
      }

      setLongLivedToken(data.longLivedToken);
      setAdAccounts(data.adAccounts || []);
      setPages(data.pages || []);
      setFbConnected(true);

      // Auto-select if only one option
      if (data.adAccounts?.length === 1) {
        setFormData(prev => ({
          ...prev,
          adAccountId: data.adAccounts[0].id,
          adAccountName: data.adAccounts[0].name,
        }));
      }
      if (data.pages?.length === 1) {
        setFormData(prev => ({
          ...prev,
          pageId: data.pages[0].id,
          pageName: data.pages[0].name,
        }));
      }

      toast.success(`Found ${data.adAccounts?.length || 0} ad account(s) and ${data.pages?.length || 0} page(s)`);
    } catch (err: any) {
      console.error('Failed to fetch Meta data:', err);
      toast.error(err.message || 'Failed to fetch Meta data');
    } finally {
      setIsFbLoading(false);
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) {
      toast.error('Please enter an access token');
      return;
    }
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }

    setIsManualLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: manualToken.trim(),
            tenantId: currentTenant.id,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process token');

      setLongLivedToken(data.longLivedToken);
      setAdAccounts(data.adAccounts || []);
      setPages(data.pages || []);
      setFbConnected(true);

      if (data.adAccounts?.length === 1) {
        setFormData(prev => ({
          ...prev,
          adAccountId: data.adAccounts[0].id,
          adAccountName: data.adAccounts[0].name,
        }));
      }
      if (data.pages?.length === 1) {
        setFormData(prev => ({
          ...prev,
          pageId: data.pages[0].id,
          pageName: data.pages[0].name,
        }));
      }

      toast.success(`Connected! Found ${data.adAccounts?.length || 0} ad account(s) and ${data.pages?.length || 0} page(s).`);
    } catch (err: any) {
      console.error('Manual token error:', err);
      toast.error(err.message || 'Failed to process token');
    } finally {
      setIsManualLoading(false);
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

      const { error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .upsert({
          workspace_id: currentTenant.id,
          meta_account_id: formData.adAccountId,
          meta_account_name: formData.adAccountName || null,
          facebook_page_id: formData.pageId,
          facebook_page_name: formData.pageName || null,
          whatsapp_phone_number_id: formData.phoneNumberId,
          whatsapp_display_number: formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number || null,
          meta_access_token: longLivedToken || null,
          status: 'connected' as const,
          is_active: true,
          connected_by: user?.id || null,
        }, {
          onConflict: 'workspace_id,meta_account_id',
        });

      if (error) throw error;

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
      case 1: return !!formData.adAccountId;
      case 2: return !!formData.pageId;
      case 3: return !!formData.phoneNumberId;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg">
            <Megaphone className="h-7 w-7 text-primary-foreground" />
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

        {/* Meta Ads Connect Card */}
        {!fbConnected && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1877F2]">
                  <Facebook className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connect Meta Ads</h3>
                  <p className="text-sm text-muted-foreground">
                    Login to automatically fetch your Ad Accounts & Pages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isFbLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </div>
                )}
                <Button
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white gap-2 h-10 px-5"
                  disabled={isFbLoading}
                  onClick={async () => {
                    if (!currentTenant?.id) {
                      toast.error('No workspace selected');
                      return;
                    }
                    if (!window.FB) {
                      toast.error('Facebook SDK not loaded. Please refresh the page.');
                      return;
                    }
                    setIsFbLoading(true);
                    try {
                      window.FB.login((response: any) => {
                        if (response.status !== 'connected' || !response.authResponse?.accessToken) {
                          toast.error('Facebook login was cancelled or failed');
                          setIsFbLoading(false);
                          return;
                        }
                        (async () => {
                          try {
                            const { data: { session } } = await supabase.auth.getSession();
                            if (!session) throw new Error('Not authenticated');
                            const res = await fetch(
                              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`,
                              {
                                method: 'POST',
                                headers: {
                                  Authorization: `Bearer ${session.access_token}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  accessToken: response.authResponse.accessToken,
                                  tenantId: currentTenant.id,
                                }),
                              }
                            );
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Failed to process Facebook login');
                            setLongLivedToken(data.longLivedToken || '');
                            setAdAccounts(data.adAccounts || []);
                            setPages(data.pages || []);
                            setFbConnected(true);
                            if (data.adAccounts?.length === 1) {
                              setFormData(prev => ({ ...prev, adAccountId: data.adAccounts[0].id, adAccountName: data.adAccounts[0].name }));
                            }
                            if (data.pages?.length === 1) {
                              setFormData(prev => ({ ...prev, pageId: data.pages[0].id, pageName: data.pages[0].name }));
                            }
                            toast.success(`Connected! Found ${data.adAccounts?.length || 0} ad account(s) and ${data.pages?.length || 0} page(s).`);
                          } catch (err: any) {
                            console.error('Meta Ads FB login error:', err);
                            toast.error(err.message || 'Failed to process Facebook login');
                          } finally {
                            setIsFbLoading(false);
                          }
                        })();
                      }, { scope: 'ads_read,pages_show_list,business_management', auth_type: 'reauthorize' });
                    } catch (err: any) {
                      console.error('FB.login error:', err);
                      toast.error(err.message || 'Failed to open Facebook login');
                      setIsFbLoading(false);
                    }
                  }}
                >
                  <Facebook className="h-4 w-4" />
                  Login with Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {fbConnected && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <strong>Connected to Facebook!</strong> Found {adAccounts.length} ad account(s) and {pages.length} page(s). 
              Select your preferences below.
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
            {/* Step 1: Ad Account */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {adAccounts.length > 0 ? (
                  <>
                    <Label>Select Ad Account</Label>
                    <Select
                      value={formData.adAccountId}
                      onValueChange={(value) => {
                        const acc = adAccounts.find(a => a.id === value);
                        setFormData(prev => ({
                          ...prev,
                          adAccountId: value,
                          adAccountName: acc?.name || '',
                        }));
                      }}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose an ad account" />
                      </SelectTrigger>
                      <SelectContent>
                        {adAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{acc.name || acc.id}</span>
                              {acc.currency && (
                                <Badge variant="secondary" className="text-xs">
                                  {acc.currency}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
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
                        Or use <strong>Login with Facebook</strong> above to auto-detect.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {formData.adAccountId && (
                  <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                      Ad account selected: <strong>{formData.adAccountName || formData.adAccountId}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 2: Facebook Page */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {pages.length > 0 ? (
                  <>
                    <Label>Select Facebook Page</Label>
                    <Select
                      value={formData.pageId}
                      onValueChange={(value) => {
                        const page = pages.find(p => p.id === value);
                        setFormData(prev => ({
                          ...prev,
                          pageId: value,
                          pageName: page?.name || '',
                        }));
                      }}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a Facebook page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{page.name}</span>
                              {page.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {page.category}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
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
                        Find your Page ID in <strong>Facebook Page → About → Page ID</strong>.
                        Or use <strong>Login with Facebook</strong> above to auto-detect.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Link WhatsApp Number */}
            {currentStep === 3 && (
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

            {/* Step 4: Finalize */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Setup Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ad Account</span>
                      <span className="font-medium">{formData.adAccountName || formData.adAccountId}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Facebook Page</span>
                      <span className="font-medium">{formData.pageName || formData.pageId}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">WhatsApp Number</span>
                      <span className="font-medium">
                        {formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Live Sync</span>
                      <Badge variant={longLivedToken ? 'default' : 'secondary'}>
                        {longLivedToken ? 'Enabled (via Facebook Login)' : 'Manual entry only'}
                      </Badge>
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
