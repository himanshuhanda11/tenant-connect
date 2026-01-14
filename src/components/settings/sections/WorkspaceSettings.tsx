import React, { useState, useEffect } from 'react';
import { Building2, Upload, Loader2, Save, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  industry: z.string().optional(),
  timezone: z.string().optional(),
  description: z.string().max(500).optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

const industries = [
  'E-commerce',
  'Healthcare',
  'Education',
  'Real Estate',
  'Finance',
  'Travel',
  'Food & Beverage',
  'Retail',
  'Technology',
  'Other',
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export function WorkspaceSettings() {
  const { currentTenant, currentRole, refreshTenants } = useTenant();
  const [saving, setSaving] = useState(false);
  const canEdit = currentRole === 'owner' || currentRole === 'admin';

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: currentTenant?.name || '',
      industry: '',
      timezone: 'UTC',
      description: '',
    },
  });

  useEffect(() => {
    if (currentTenant) {
      form.reset({
        name: currentTenant.name,
        industry: '',
        timezone: 'UTC',
        description: '',
      });
    }
  }, [currentTenant]);

  const onSave = async (data: WorkspaceFormData) => {
    if (!currentTenant) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ 
          name: data.name,
          industry: data.industry || null,
        })
        .eq('id', currentTenant.id);

      if (error) throw error;
      toast.success('Workspace updated successfully');
      refreshTenants();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Workspace Profile
          </CardTitle>
          <CardDescription>
            Configure your workspace identity and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            {/* Logo Upload */}
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {currentTenant?.name?.charAt(0) || 'W'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label>Workspace Logo</Label>
                <Button type="button" variant="outline" size="sm" disabled={!canEdit}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended: 256x256px, PNG or JPG
                </p>
              </div>
            </div>

            <Separator />

            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  disabled={!canEdit}
                  placeholder="My Workspace"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Workspace ID</Label>
                <Input 
                  value={currentTenant?.slug || ''} 
                  disabled 
                  className="font-mono bg-muted" 
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs and API calls
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={form.watch('industry')}
                  onValueChange={(value) => form.setValue('industry', value)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={form.watch('timezone')}
                  onValueChange={(value) => form.setValue('timezone', value)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                disabled={!canEdit}
                placeholder="Brief description of your workspace..."
                rows={3}
              />
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {currentRole === 'owner' && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <h4 className="font-medium text-foreground">Delete Workspace</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all its data
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
