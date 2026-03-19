import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { signInWithManagedGoogle } from '@/lib/auth/googleOAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, MessageSquare, Shield, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';
import aireatroLogo from '@/assets/aireatro-logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Autofocus email field
  useEffect(() => {
    if (!authLoading && !isCheckingAuth && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [authLoading, isCheckingAuth]);

  // Check auth and redirect appropriately
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authLoading) return;
      
      if (user) {
        // User exists, check their status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_step')
          .eq('id', user.id)
          .maybeSingle();

        // Check onboarding status first
        if (profile?.onboarding_step !== 'completed') {
          if (profile?.onboarding_step === 'org_done') {
            navigate('/onboarding/password', { replace: true });
          } else {
            navigate('/onboarding/org', { replace: true });
          }
          return;
        }

        // Check if user is an agent — redirect directly to inbox
        const { data: memberships } = await supabase
          .from('tenant_members')
          .select('role')
          .eq('user_id', user.id);

        const isAgentOnly = memberships && memberships.length > 0 && memberships.every(m => m.role === 'agent');
        
        if (isAgentOnly) {
          navigate('/inbox', { replace: true });
        } else {
          // Onboarding complete - go to workspace selector
          navigate('/select-workspace', { replace: true });
        }
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [user, authLoading, navigate]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/select-workspace`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Generic error message for security
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in.');
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      // Success - auth state change will handle redirect
      if (data.user) {
        toast.success('Welcome back!');
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      toast.error('Network error. Please try again.');
      setError('Something went wrong. Please try again.');
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
      {/* Left Panel - Marketing Content */}
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
              Trusted by 2,500+ businesses worldwide
            </div>

            {/* Main headline */}
            <h2 className="text-4xl xl:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Turn every WhatsApp chat into a{' '}
              <span className="text-primary">
                business opportunity
              </span>
            </h2>
            
            <p className="text-lg xl:text-xl text-slate-600 mb-10 leading-relaxed">
              Automate responses, nurture leads, and close deals faster with AI-powered conversations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold text-primary mb-1">10M+</div>
                <div className="text-sm text-slate-500">Messages/month</div>
              </div>
              <div className="text-center border-x border-slate-200">
                <div className="text-3xl xl:text-4xl font-bold text-primary mb-1">98%</div>
                <div className="text-sm text-slate-500">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold text-primary mb-1">3x</div>
                <div className="text-sm text-slate-500">Faster response</div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>Unified inbox for all your WhatsApp conversations</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>No-code automation builder with AI assistance</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>Team collaboration with role-based permissions</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>Enterprise-grade security & Meta verified</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-600 italic mb-4">
                "AiReatro transformed how we handle customer inquiries. Our response time dropped from hours to minutes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                  RP
                </div>
                <div>
                  <div className="text-slate-900 font-medium">Rahul Patel</div>
                  <div className="text-slate-500 text-sm">CEO, TechServe Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <img src={aireatroLogo} alt="AiReatro" className="h-10 w-auto" />
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Sign In</span>
          </nav>

          {/* Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to manage your conversations, flows, and Meta Ads.
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
                onClick={handleGoogleLogin}
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
                    or
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    disabled={isLoading || isGoogleLoading}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      disabled={isLoading || isGoogleLoading}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm font-normal text-muted-foreground cursor-pointer"
                  >
                    Remember me for 30 days
                  </Label>
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
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-medium hover:underline">
                    Create account
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
    </div>
  );
}
