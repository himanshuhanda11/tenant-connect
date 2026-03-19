import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { signInWithManagedGoogle } from '@/lib/auth/googleOAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, MessageSquare, Shield, Zap, Users, Eye, EyeOff } from 'lucide-react';
import aireatroLogo from '@/assets/aireatro-logo.png';

export default function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Email form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Single useEffect for auth check
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authLoading) return;
      
      if (user) {
        // User exists, check their onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_step')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.onboarding_step === 'completed') {
          navigate('/select-workspace', { replace: true });
        } else if (profile?.onboarding_step === 'org_done') {
          navigate('/onboarding/password', { replace: true });
        } else {
          // pending or google_done - go to org page
          navigate('/onboarding/org', { replace: true });
        }
      } else {
        // No user, show signup form
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [user, authLoading, navigate]);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await signInWithManagedGoogle({
        nextPath: '/select-workspace',
        extraParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding/org`,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please log in instead.');
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      // Wait a moment for the profile to be created by trigger
      if (data.user) {
        // The auth state change will trigger navigation
        // But we can also manually navigate after a short delay
        setTimeout(() => {
          navigate('/onboarding/org', { replace: true });
        }, 500);
      }
    } catch (err: any) {
      console.error('Email signup error:', err);
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <img src={aireatroLogo} alt="AiReatro" className="h-10 w-auto" />
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Sign Up</span>
          </nav>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step 1 of 3</span>
              <span>Account</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>

          {/* Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Create your AiReatro account
              </CardTitle>
              <CardDescription className="text-base">
                Get started with WhatsApp Business API in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Google Button */}
              <Button
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium"
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11"
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min. 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      disabled={isLoading || isGoogleLoading}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  size="lg"
                  className="w-full h-12 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - White background with colorful accents */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-white">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full">
          <div className="max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Join 2,500+ growing businesses
            </div>

            {/* Main headline */}
            <h2 className="text-4xl xl:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Scale your business with{' '}
              <span className="text-primary">
                WhatsApp
              </span>
            </h2>
            
            <p className="text-lg xl:text-xl text-slate-600 mb-10 leading-relaxed">
              Join thousands of businesses using AiReatro to automate customer conversations and grow faster.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>Official WhatsApp API with verified business messaging</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>AI-powered automation that responds 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>Team inbox for seamless collaboration</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>Enterprise-grade security & SOC 2 compliant</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10M+</div>
                <div className="text-xs text-slate-500">Messages/mo</div>
              </div>
              <div className="text-center border-x border-slate-200">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-xs text-slate-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-slate-500">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
