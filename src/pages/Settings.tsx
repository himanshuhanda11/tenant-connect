import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell, 
  Shield,
  Loader2,
  Save
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

export default function Settings() {
  const { currentTenant, currentRole, refreshTenants } = useTenant();
  const { profile, user } = useAuth();
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const canEditWorkspace = currentRole === 'owner' || currentRole === 'admin';

  const workspaceForm = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: currentTenant?.name || '' },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name || '' },
  });

  React.useEffect(() => {
    if (currentTenant) {
      workspaceForm.reset({ name: currentTenant.name });
    }
  }, [currentTenant]);

  React.useEffect(() => {
    if (profile) {
      profileForm.reset({ full_name: profile.full_name || '' });
    }
  }, [profile]);

  const onSaveWorkspace = async (data: WorkspaceFormData) => {
    if (!currentTenant) return;
    
    setSavingWorkspace(true);
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
      setSavingWorkspace(false);
    }
  };

  const onSaveProfile = async (data: ProfileFormData) => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workspace and account settings
          </p>
        </div>

        <Tabs defaultValue="workspace" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workspace" className="gap-2">
              <Building2 className="w-4 h-4" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Workspace Settings */}
          <TabsContent value="workspace" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Workspace Settings
                </CardTitle>
                <CardDescription>
                  Configure your workspace name and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={workspaceForm.handleSubmit(onSaveWorkspace)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      {...workspaceForm.register('name')}
                      disabled={!canEditWorkspace}
                    />
                    {workspaceForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {workspaceForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Workspace ID</Label>
                    <Input value={currentTenant?.slug || ''} disabled className="font-mono" />
                    <p className="text-xs text-muted-foreground">
                      This ID cannot be changed
                    </p>
                  </div>

                  {canEditWorkspace && (
                    <Button type="submit" disabled={savingWorkspace}>
                      {savingWorkspace ? (
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
                  )}
                </form>
              </CardContent>
            </Card>

            {currentRole === 'owner' && (
              <Card className="shadow-card border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Shield className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div>
                      <h4 className="font-medium text-foreground">Delete Workspace</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this workspace and all its data
                      </p>
                    </div>
                    <Button variant="destructive" disabled>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      {...profileForm.register('full_name')}
                    />
                    {profileForm.formState.errors.full_name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? (
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
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your conversations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Message Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new messages
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Team Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about team member changes
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
