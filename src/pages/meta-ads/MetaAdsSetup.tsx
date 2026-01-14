import { useState } from 'react';
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
import {
  Megaphone,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Facebook,
  Building2,
  FileText,
  Phone,
  Shield,
  Sparkles,
  Loader2,
  ExternalLink,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

// Mock data
const MOCK_AD_ACCOUNTS = [
  { id: 'act_123456789', name: 'AIREATRO Business', currency: 'USD' },
  { id: 'act_987654321', name: 'Marketing Team', currency: 'AED' },
];

const MOCK_PAGES = [
  { id: 'page_001', name: 'AIREATRO Official', followers: 12500 },
  { id: 'page_002', name: 'AIREATRO Support', followers: 3200 },
];

const MOCK_PHONE_NUMBERS = [
  { id: 'pn_001', display: '+971 50 123 4567', verified: true },
  { id: 'pn_002', display: '+971 55 987 6543', verified: true },
];

export default function MetaAdsSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    facebookConnected: false,
    adAccountId: '',
    pageId: '',
    phoneNumberId: '',
  });

  const progress = (currentStep / SETUP_STEPS.length) * 100;

  const handleFacebookConnect = async () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFormData(prev => ({ ...prev, facebookConnected: true }));
    setIsConnecting(false);
    toast.success('Facebook account connected successfully!');
    setCurrentStep(2);
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
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    toast.success('Meta Ads tracking enabled successfully!');
    navigate('/meta-ads');
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
                    AIREATRO will request the following permissions:
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Read Ad Accounts (to view campaign data)</li>
                      <li>Read Pages (to link your business page)</li>
                      <li>Read WhatsApp Ad Events (to track leads)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {formData.facebookConnected ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook Connected</p>
                      <p className="text-sm text-muted-foreground">Signed in as AIREATRO Business</p>
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
                    Continue with Facebook
                  </Button>
                )}
              </div>
            )}

            {/* Step 2: Choose Ad Account */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Label>Select Ad Account</Label>
                <Select
                  value={formData.adAccountId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, adAccountId: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose an ad account" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_AD_ACCOUNTS.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{account.name}</span>
                          <Badge variant="outline" className="text-xs">{account.currency}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                <Label>Select Facebook Page</Label>
                <Select
                  value={formData.pageId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pageId: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a Facebook page" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PAGES.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{page.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {page.followers.toLocaleString()} followers
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 4: Link WhatsApp Number */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Label>Select WhatsApp Business Number</Label>
                <Select
                  value={formData.phoneNumberId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, phoneNumberId: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a WhatsApp number" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PHONE_NUMBERS.map((phone) => (
                      <SelectItem key={phone.id} value={phone.id}>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{phone.display}</span>
                          {phone.verified && (
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
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
                      <span className="font-medium">AIREATRO Business</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ad Account</span>
                      <span className="font-medium">
                        {MOCK_AD_ACCOUNTS.find(a => a.id === formData.adAccountId)?.name}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Facebook Page</span>
                      <span className="font-medium">
                        {MOCK_PAGES.find(p => p.id === formData.pageId)?.name}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">WhatsApp Number</span>
                      <span className="font-medium">
                        {MOCK_PHONE_NUMBERS.find(p => p.id === formData.phoneNumberId)?.display}
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
