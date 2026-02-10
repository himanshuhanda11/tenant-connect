import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Upload, Loader2, Save, Globe, MapPin, User, Archive, RefreshCw, Layers, Phone, Mail, Link2, AlignLeft } from 'lucide-react';
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
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
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

const verticals = [
  'UNDEFINED', 'OTHER', 'AUTO', 'BEAUTY', 'APPAREL', 'EDU', 'ENTERTAIN',
  'EVENT_PLAN', 'FINANCE', 'GROCERY', 'GOVT', 'HOTEL', 'HEALTH',
  'NONPROFIT', 'PROF_SERVICES', 'RETAIL', 'TRAVEL', 'RESTAURANT', 'NOT_A_BIZ'
];

export function WorkspaceSettings() {
  const { currentTenant, currentRole, refreshTenants } = useTenant();
  const { phoneNumbers } = usePhoneNumbers();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [waProfile, setWaProfile] = useState<any>(null);
  const [waProfileLoading, setWaProfileLoading] = useState(false);
  const [waProfileSaving, setWaProfileSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  // WhatsApp profile form state
  const [waAbout, setWaAbout] = useState('');
  const [waDescription, setWaDescription] = useState('');
  const [waAddress, setWaAddress] = useState('');
  const [waEmail, setWaEmail] = useState('');
  const [waWebsite1, setWaWebsite1] = useState('');
  const [waWebsite2, setWaWebsite2] = useState('');
  const [waVertical, setWaVertical] = useState('UNDEFINED');

  const canEdit = currentRole === 'owner' || currentRole === 'admin';
  const isOwner = currentRole === 'owner';

  const primaryPhone = phoneNumbers.length > 0 ? phoneNumbers[0] : null;

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

  // Fetch WhatsApp profile when primary phone is available
  const fetchWaProfile = useCallback(async () => {
    if (!primaryPhone?.phone_number_id || !primaryPhone?.waba_uuid) return;
    setWaProfileLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-profile', {
        body: {
          action: 'get',
          phone_number_id: primaryPhone.phone_number_id,
          waba_account_id: primaryPhone.waba_uuid,
        }
      });
      if (error) throw error;
      if (data?.profile) {
        setWaProfile(data.profile);
        setWaAbout(data.profile.about || '');
        setWaDescription(data.profile.description || '');
        setWaAddress(data.profile.address || '');
        setWaEmail(data.profile.email || '');
        setWaVertical(data.profile.vertical || 'UNDEFINED');
        const websites = data.profile.websites || [];
        setWaWebsite1(websites[0] || '');
        setWaWebsite2(websites[1] || '');
        if (data.profile.profile_picture_url) {
          setLogoUrl(data.profile.profile_picture_url);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch WA profile:', err);
    } finally {
      setWaProfileLoading(false);
    }
  }, [primaryPhone?.phone_number_id, primaryPhone?.waba_uuid]);

  useEffect(() => {
    fetchWaProfile();
  }, [fetchWaProfile]);

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

  const saveWaProfile = async () => {
    if (!primaryPhone?.phone_number_id || !primaryPhone?.waba_uuid) {
      toast.error('No WhatsApp number connected');
      return;
    }
    setWaProfileSaving(true);
    try {
      const websites = [waWebsite1, waWebsite2].filter(w => w.trim());
      const { data, error } = await supabase.functions.invoke('whatsapp-profile', {
        body: {
          action: 'update',
          phone_number_id: primaryPhone.phone_number_id,
          waba_account_id: primaryPhone.waba_uuid,
          profile_data: {
            about: waAbout || undefined,
            description: waDescription || undefined,
            address: waAddress || undefined,
            email: waEmail || undefined,
            websites: websites.length > 0 ? websites : undefined,
            vertical: waVertical !== 'UNDEFINED' ? waVertical : undefined,
          }
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('WhatsApp profile updated');
      fetchWaProfile();
    } catch (err: any) {
      console.error('Failed to update WA profile:', err);
      toast.error(err.message || 'Failed to update WhatsApp profile');
    } finally {
      setWaProfileSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }
    setLogoUploading(true);
    try {
      const filePath = `${currentTenant.id}/logo-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('wa-media')
        .upload(filePath, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from('wa-media')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);
      if (urlData?.signedUrl) {
        setLogoUrl(urlData.signedUrl);
        toast.success('Logo uploaded');
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Profile</TabsTrigger>
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
                    <AvatarImage src={logoUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {currentTenant?.name?.charAt(0) || 'W'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label>Workspace Logo</Label>
                    <div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={!canEdit || logoUploading}
                      />
                      <Button type="button" variant="outline" size="sm" disabled={!canEdit || logoUploading} asChild>
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          {logoUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          {logoUploading ? 'Uploading...' : 'Upload Logo'}
                        </label>
                      </Button>
                    </div>
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

        {/* WhatsApp Profile Tab */}
        <TabsContent value="whatsapp" className="space-y-6 mt-6">
          {!primaryPhone ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No WhatsApp Number Connected</h3>
                <p className="text-muted-foreground mb-4">Connect a WhatsApp number to manage your business profile.</p>
                <Button variant="outline" onClick={() => window.location.href = '/phone-numbers/connect'}>
                  Connect Number
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        WhatsApp Business Profile
                      </CardTitle>
                      <CardDescription>
                        Manage the profile shown to customers on WhatsApp for <span className="font-mono font-medium">{primaryPhone.phone_e164}</span>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchWaProfile} disabled={waProfileLoading}>
                      <RefreshCw className={`w-4 h-4 mr-1 ${waProfileLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {waProfileLoading && !waProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading WhatsApp profile...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-start gap-6">
                        <Avatar className="w-20 h-20 border-2 border-border">
                          <AvatarImage src={waProfile?.profile_picture_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {primaryPhone.phone_e164?.slice(-2) || 'WA'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{primaryPhone.verified_name || primaryPhone.phone_e164}</p>
                          <p className="text-sm text-muted-foreground font-mono">{primaryPhone.phone_e164}</p>
                          {waProfile?.profile_picture_url && (
                            <Badge variant="outline" className="text-xs">Profile photo set</Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* About */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-muted-foreground" />
                          About
                        </Label>
                        <Input
                          value={waAbout}
                          onChange={(e) => setWaAbout(e.target.value)}
                          placeholder="Short about text (max 139 chars)"
                          maxLength={139}
                          disabled={!canEdit}
                        />
                        <p className="text-xs text-muted-foreground">{waAbout.length}/139 characters</p>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          Description
                        </Label>
                        <Textarea
                          value={waDescription}
                          onChange={(e) => setWaDescription(e.target.value)}
                          placeholder="Describe your business..."
                          rows={3}
                          maxLength={512}
                          disabled={!canEdit}
                        />
                        <p className="text-xs text-muted-foreground">{waDescription.length}/512 characters</p>
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          Business Address
                        </Label>
                        <Textarea
                          value={waAddress}
                          onChange={(e) => setWaAddress(e.target.value)}
                          placeholder="Full business address"
                          rows={2}
                          maxLength={256}
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Email */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Business Email
                          </Label>
                          <Input
                            type="email"
                            value={waEmail}
                            onChange={(e) => setWaEmail(e.target.value)}
                            placeholder="contact@business.com"
                            disabled={!canEdit}
                          />
                        </div>

                        {/* Vertical / Industry */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-muted-foreground" />
                            Industry Category
                          </Label>
                          <Select value={waVertical} onValueChange={setWaVertical} disabled={!canEdit}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {verticals.map(v => (
                                <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Websites */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                          Websites (max 2)
                        </Label>
                        <Input
                          value={waWebsite1}
                          onChange={(e) => setWaWebsite1(e.target.value)}
                          placeholder="https://www.yourbusiness.com"
                          disabled={!canEdit}
                        />
                        <Input
                          value={waWebsite2}
                          onChange={(e) => setWaWebsite2(e.target.value)}
                          placeholder="https://shop.yourbusiness.com (optional)"
                          disabled={!canEdit}
                        />
                      </div>

                      {canEdit && (
                        <>
                          <Separator />
                          <div className="flex justify-end">
                            <Button onClick={saveWaProfile} disabled={waProfileSaving}>
                              {waProfileSaving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                              ) : (
                                <><Save className="w-4 h-4 mr-2" />Save WhatsApp Profile</>
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
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
