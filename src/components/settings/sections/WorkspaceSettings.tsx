import React, { useState, useEffect } from 'react';
import { Building2, Upload, Loader2, Save, Globe, MapPin, User, Archive, RefreshCw, Layers } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  industry: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  address: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

const industries = ['E-commerce', 'Healthcare', 'Education', 'Real Estate', 'Finance', 'Travel', 'Food & Beverage', 'Retail', 'Technology', 'Automotive', 'Hospitality', 'Other'];
const timezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'];
const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Hindi', 'Chinese', 'Japanese', 'Korean'];

export function WorkspaceSettings() {
  const { currentTenant, currentRole, refreshTenants } = useTenant();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const canEdit = currentRole === 'owner' || currentRole === 'admin';
  const isOwner = currentRole === 'owner';

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: currentTenant?.name || '',
      industry: '',
      timezone: 'UTC',
      language: 'English',
      address: '',
      description: '',
    },
  });

  useEffect(() => {
    if (currentTenant) {
      form.reset({
        name: currentTenant.name,
        industry: '',
        timezone: 'UTC',
        language: 'English',
        address: '',
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
        .update({ name: data.name })
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Workspace Profile
              </CardTitle>
              <CardDescription>Configure your workspace identity and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
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
                    <p className="text-xs text-muted-foreground">256x256px, PNG or JPG</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workspace Name *</Label>
                    <Input id="name" {...form.register('name')} disabled={!canEdit} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Workspace ID</Label>
                    <Input value={currentTenant?.slug || ''} disabled className="font-mono bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={form.watch('industry')} onValueChange={(v) => form.setValue('industry', v)} disabled={!canEdit}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Timezone</Label>
                    <Select value={form.watch('timezone')} onValueChange={(v) => form.setValue('timezone', v)} disabled={!canEdit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select value={form.watch('language')} onValueChange={(v) => form.setValue('language', v)} disabled={!canEdit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Workspace Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/10 text-green-600 border-0">Active</Badge>
                      <span className="text-sm text-muted-foreground">Created {currentTenant?.created_at ? new Date(currentTenant.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Textarea {...form.register('address')} disabled={!canEdit} placeholder="Street, City, Country" rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...form.register('description')} disabled={!canEdit} placeholder="Brief description..." rows={3} />
                </div>

                {canEdit && (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input placeholder="Workspace owner" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Owner Email</Label>
                  <Input placeholder="owner@company.com" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Transfer Ownership
                </CardTitle>
                <CardDescription>Transfer this workspace to another team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                  <div>
                    <h4 className="font-medium">Transfer to Another Owner</h4>
                    <p className="text-sm text-muted-foreground">The new owner will have full control of this workspace</p>
                  </div>
                  <Button variant="outline">Transfer Ownership</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Multi-Brand Configuration
              </CardTitle>
              <CardDescription>Configure multiple sender profiles for this workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Multi-Brand Mode</Label>
                  <p className="text-sm text-muted-foreground">Use multiple sender identities within this workspace</p>
                </div>
                <Switch disabled={!canEdit} />
              </div>
              <Separator />
              <div className="p-4 rounded-lg border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No additional brands configured</p>
                <Button variant="outline" size="sm" className="mt-2" disabled={!canEdit}>Add Brand</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Workspace Switch History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { workspace: currentTenant?.name || 'Current', time: 'Just now' },
                  { workspace: 'Previous Workspace', time: '2 hours ago' },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{entry.workspace}</span>
                    <span className="text-sm text-muted-foreground">{entry.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Archive className="w-5 h-5" />
                  Archive Workspace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div>
                    <h4 className="font-medium">Archive this Workspace</h4>
                    <p className="text-sm text-muted-foreground">Disable access but retain data for future restoration</p>
                  </div>
                  <Button variant="destructive">Archive</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
