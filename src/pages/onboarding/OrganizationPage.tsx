import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
import aireatroLogo from '@/assets/aireatro-logo.png';

const countries = [
  { code: 'US', name: 'United States', timezone: 'America/New_York' },
  { code: 'IN', name: 'India', timezone: 'Asia/Kolkata' },
  { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London' },
  { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai' },
  { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore' },
  { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney' },
  { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France', timezone: 'Europe/Paris' },
  { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo' },
  { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City' },
  { code: 'CA', name: 'Canada', timezone: 'America/Toronto' },
  { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo' },
  { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul' },
  { code: 'SA', name: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg' },
  { code: 'NG', name: 'Nigeria', timezone: 'Africa/Lagos' },
  { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta' },
  { code: 'PH', name: 'Philippines', timezone: 'Asia/Manila' },
  { code: 'MY', name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok' },
];

const industries = [
  'E-commerce & Retail',
  'Healthcare & Medical',
  'Real Estate',
  'Education & EdTech',
  'Financial Services',
  'Travel & Hospitality',
  'Food & Restaurant',
  'Automotive',
  'Technology & SaaS',
  'Other',
];

const teamSizes = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2–5 people' },
  { value: '6-20', label: '6–20 people' },
  { value: '21+', label: '21+ people' },
];

const goals = [
  { value: 'sales', label: 'Sales & Lead Generation' },
  { value: 'support', label: 'Customer Support' },
  { value: 'marketing', label: 'Marketing & Campaigns' },
];

export default function OrganizationPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createTenant, refreshTenants } = useTenant();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [orgName, setOrgName] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signup');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Check if user already completed this step
    const checkStep = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_step')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.onboarding_step === 'completed') {
        navigate('/select-workspace');
      } else if (profile?.onboarding_step === 'org_done') {
        navigate('/onboarding/password');
      }
    };
    
    if (user) checkStep();
  }, [user, navigate]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgName.trim() || !country) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedCountry = countries.find(c => c.code === country);
      const slug = generateSlug(orgName);

      // Create the workspace/tenant
      const { error: tenantError, tenant } = await createTenant(orgName, slug);
      
      if (tenantError) throw tenantError;

      // Update profile with org details and step
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          country: country,
          industry: industry || null,
          team_size: teamSize || null,
          primary_goal: goal || null,
          onboarding_step: 'org_done',
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Refresh tenants to get the new one
      await refreshTenants();

      // Navigate to password step
      navigate('/onboarding/password');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={aireatroLogo} alt="AiReatro" className="h-8 w-auto" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/signup">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step 2 of 3</span>
              <span>Organization</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Set up your organization
              </CardTitle>
              <CardDescription className="text-base">
                Tell us about your business to personalize your experience
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Organization Name - Required */}
                <div className="space-y-2">
                  <Label htmlFor="orgName">
                    Organization name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="orgName"
                    placeholder="Enter your company name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                {/* Country - Required */}
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger id="country" className="h-11">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry" className="h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team size</Label>
                    <Select value={teamSize} onValueChange={setTeamSize}>
                      <SelectTrigger id="teamSize" className="h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamSizes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Primary Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal">Primary use case</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger id="goal" className="h-11">
                      <SelectValue placeholder="What will you use WhatsApp for?" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !orgName.trim() || !country}
                  size="lg"
                  className="w-full h-12 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating workspace...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
