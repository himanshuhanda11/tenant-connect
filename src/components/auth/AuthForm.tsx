import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Loader2, Eye, EyeOff, CheckCircle2, Inbox, Megaphone, Bot, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Breadcrumb from '@/components/layout/Breadcrumb';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', fullName: '', confirmPassword: '' },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      // Clear any previous workspace selection to force workspace picker
      localStorage.removeItem('whatsapp-isv-current-tenant');
      
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success('Welcome back!');
      navigate('/select-workspace');
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      // Clear any previous workspace selection to force workspace picker
      localStorage.removeItem('whatsapp-isv-current-tenant');
      
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success('Account created successfully!');
      navigate('/select-workspace');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Inbox, text: 'Unified inbox for all conversations' },
    { icon: Megaphone, text: 'Broadcast campaigns to thousands' },
    { icon: Bot, text: 'Smart automation & chatbots' },
    { icon: Shield, text: 'Enterprise-grade security' },
    { icon: Users, text: 'Team collaboration tools' },
    { icon: Zap, text: '99.9% uptime guarantee' },
  ];

  const benefits = [
    'Free 14-day trial',
    'No credit card required',
    'Setup in 5 minutes',
    'Cancel anytime',
  ];

  if (mode === 'login') {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 flex flex-col bg-background">
          {/* Header */}
          <header className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-foreground">AiReatro</span>
              </Link>
            </div>
            <Breadcrumb className="mt-4" />
          </header>

          {/* Form */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-8">
            <div className="w-full max-w-md animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
                <p className="text-muted-foreground">Sign in to access your WhatsApp dashboard</p>
              </div>

              <Card className="shadow-xl border-border/50">
                <CardContent className="pt-6">
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="you@company.com" {...loginForm.register('email')} className="h-12" />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...loginForm.register('password')} className="h-12 pr-12" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg" disabled={loading}>
                      {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</> : 'Sign in'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-primary font-semibold hover:underline">Create free account</Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Marketing */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-6">
              Manage all your WhatsApp conversations in one place
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join 5,000+ businesses using AiReatro to connect with customers on WhatsApp at scale.
            </p>

            <div className="space-y-4">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-white/90 italic mb-4">
                "AiReatro transformed our customer support. We now handle 3x more conversations with the same team."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">SC</div>
                <div>
                  <div className="text-white font-medium">Sarah Chen</div>
                  <div className="text-white/60 text-sm">Head of Support, TechFlow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Marketing (no image) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start your WhatsApp Business journey today
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Everything you need to connect with customers, automate conversations, and grow your business.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-white/80" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <feature.icon className="w-5 h-5" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Header */}
        <header className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">AiReatro</span>
            </Link>
          </div>
          <Breadcrumb className="mt-4" />
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-8">
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground">Get started with your free 14-day trial</p>
            </div>

            <Card className="shadow-xl border-border/50">
              <CardContent className="pt-6">
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" {...signupForm.register('fullName')} className="h-12" />
                    {signupForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="you@company.com" {...signupForm.register('email')} className="h-12" />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" {...signupForm.register('password')} className="h-12 pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" {...signupForm.register('confirmPassword')} className="h-12" />
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg" disabled={loading}>
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating account...</> : 'Create free account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
