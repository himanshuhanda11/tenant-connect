import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function CreateWorkspace() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createTenant, tenants } = useTenant();
  const [loading, setLoading] = useState(false);

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === generateSlug(form.getValues('name').slice(0, -1) || '')) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    setLoading(true);
    try {
      const { error } = await createTenant(data.name, data.slug);
      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          toast.error('A workspace with this slug already exists. Please choose a different one.');
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success('Workspace created successfully!');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary mb-3 sm:mb-4">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create Your Workspace</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Set up a workspace for your team
          </p>
        </div>

        <Card className="shadow-soft border-border/50">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              New Workspace
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              A workspace is where your team collaborates. You'll be the owner.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Inc"
                  {...form.register('name')}
                  onChange={handleNameChange}
                  className="h-11 sm:h-12"
                />
                {form.formState.errors.name && (
                  <p className="text-xs sm:text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm">Workspace URL</Label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 sm:px-3 h-11 sm:h-12 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs sm:text-sm">
                    app/
                  </span>
                  <Input
                    id="slug"
                    placeholder="acme-inc"
                    {...form.register('slug')}
                    className="h-11 sm:h-12 rounded-l-none"
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-xs sm:text-sm text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 font-medium text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {tenants.length > 0 && (
              <div className="mt-4 sm:mt-6 text-center">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-sm">
                  Back to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
