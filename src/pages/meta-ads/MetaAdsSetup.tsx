import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Megaphone,
  CheckCircle2,
  ArrowRight,
  Building2,
  FileText,
  Phone,
  Shield,
  Sparkles,
  Loader2,
  Info,
  Check,
  Facebook,
  Globe,
  Zap,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    FB: any;
  }
}

interface MetaAdAccount {
  id: string;
  name: string;
  status: number;
  currency: string;
  timezone: string;
}

interface MetaPage {
  id: string;
  name: string;
  category: string;
  accessToken: string;
}

export default function MetaAdsSetup() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFbLoading, setIsFbLoading] = useState(false);
  const [fbConnected, setFbConnected] = useState(false);
  const [longLivedToken, setLongLivedToken] = useState('');
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [adAccountsError, setAdAccountsError] = useState<string | null>(null);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [formData, setFormData] = useState({
    adAccountId: '',
    adAccountName: '',
    pageId: '',
    pageName: '',
    phoneNumberId: '',
    phoneDisplay: '',
  });

  // Fetch existing phone numbers
  const phoneNumbersQuery = useQuery({
    queryKey: ['phone-numbers', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('id, display_number, phone_number_id, quality_rating')
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  // Check if already connected
  const existingAccountQuery = useQuery({
    queryKey: ['meta-ad-accounts', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const phoneNumbers = phoneNumbersQuery.data || [];
  const existingAccounts = existingAccountQuery.data || [];
  const hasExistingConnection = existingAccounts.length > 0;

  // If already connected, show connected state on mount
  useEffect(() => {
    if (hasExistingConnection && !fbConnected) {
      const acc = existingAccounts[0];
      setFbConnected(true);
      setFormData(prev => ({
        ...prev,
        adAccountId: acc.meta_account_id || '',
        adAccountName: acc.meta_account_name || '',
        pageId: acc.facebook_page_id || '',
        pageName: acc.facebook_page_name || '',
        phoneNumberId: acc.whatsapp_phone_number_id || prev.phoneNumberId || '',
        phoneDisplay: acc.whatsapp_display_number || prev.phoneDisplay || '',
      }));
    }
  }, [hasExistingConnection, existingAccounts]);

  // Auto-select single phone number
  useEffect(() => {
    if (phoneNumbers.length === 1 && !formData.phoneNumberId) {
      setFormData(prev => ({
        ...prev,
        phoneNumberId: phoneNumbers[0].id,
        phoneDisplay: phoneNumbers[0].display_number || '',
      }));
    }
  }, [phoneNumbers, formData.phoneNumberId]);

  const handleDisconnect = async () => {
    if (!currentTenant?.id) return;
    setIsDisconnecting(true);
    try {
      // Deactivate all Meta ad accounts for this workspace
      const { error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .update({ is_active: false, status: 'disconnected' as const })
        .eq('workspace_id', currentTenant.id);
      if (error) throw error;

      // Reset local state
      setFbConnected(false);
      setAdAccounts([]);
      setPages([]);
      setPermissions([]);
      setLongLivedToken('');
      setAdAccountsError(null);
      setFormData({ adAccountId: '', adAccountName: '', pageId: '', pageName: '', phoneNumberId: '', phoneDisplay: '' });
      
      // Invalidate queries so the page reflects the disconnected state
      queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts'] });
      
      toast.success('Meta Ads disconnected. You can reconnect anytime.');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      toast.error(err.message || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const processMetaResponse = (data: any) => {
    setLongLivedToken(data.longLivedToken || '');
    setAdAccounts(data.adAccounts || []);
    setPages(data.pages || []);
    setPermissions(data.permissions || []);
    setAdAccountsError(data.adAccountsError || null);
    setFbConnected(true);

    // Auto-select if only one option
    if (data.adAccounts?.length === 1) {
      setFormData(prev => ({
        ...prev,
        adAccountId: data.adAccounts[0].id,
        adAccountName: data.adAccounts[0].name,
      }));
    }
    if (data.pages?.length === 1) {
      setFormData(prev => ({
        ...prev,
        pageId: data.pages[0].id,
        pageName: data.pages[0].name,
      }));
    }

    toast.success(`Connected! Found ${data.adAccounts?.length || 0} ad account(s) and ${data.pages?.length || 0} page(s).`);
  };

  const handleFbLogin = async () => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    if (!window.FB) {
      toast.error('Facebook SDK not loaded. Please refresh the page.');
      return;
    }
    setIsFbLoading(true);
    try {
      window.FB.login((response: any) => {
        if (response.status !== 'connected' || !response.authResponse?.accessToken) {
          toast.error('Facebook login was cancelled or failed');
          setIsFbLoading(false);
          return;
        }
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  accessToken: response.authResponse.accessToken,
                  tenantId: currentTenant.id,
                }),
              }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to process Facebook login');
            processMetaResponse(data);
          } catch (err: any) {
            console.error('Meta Ads FB login error:', err);
            toast.error(err.message || 'Failed to process Facebook login');
          } finally {
            setIsFbLoading(false);
          }
        })();
      }, { scope: 'ads_read,pages_show_list,business_management', auth_type: 'reauthorize' });
    } catch (err: any) {
      console.error('FB.login error:', err);
      toast.error(err.message || 'Failed to open Facebook login');
      setIsFbLoading(false);
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) {
      toast.error('Please enter an access token');
      return;
    }
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    setIsManualLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: manualToken.trim(),
            tenantId: currentTenant.id,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process token');
      processMetaResponse(data);
    } catch (err: any) {
      console.error('Manual token error:', err);
      toast.error(err.message || 'Failed to process token');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    if (!formData.adAccountId) {
      toast.error('Please select an Ad Account');
      return;
    }

    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .upsert({
          workspace_id: currentTenant.id,
          meta_account_id: formData.adAccountId,
          meta_account_name: formData.adAccountName || null,
          facebook_page_id: formData.pageId || null,
          facebook_page_name: formData.pageName || null,
          whatsapp_phone_number_id: formData.phoneNumberId || null,
          whatsapp_display_number: formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number || null,
          meta_access_token: longLivedToken || null,
          status: 'connected' as const,
          is_active: true,
          connected_by: user?.id || null,
        }, {
          onConflict: 'workspace_id,meta_account_id',
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['meta-ad-campaigns'] });

      toast.success('Meta Ads tracking enabled successfully!');
      navigate('/meta-ads');
    } catch (err: any) {
      console.error('Failed to save Meta Ads connection:', err);
      toast.error(err.message || 'Failed to save connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const canComplete = !!formData.adAccountId;

  const getAccountStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>;
      case 2: return <Badge className="bg-amber-100 text-amber-700 text-xs">Disabled</Badge>;
      case 3: return <Badge className="bg-red-100 text-red-700 text-xs">Unsettled</Badge>;
      default: return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary shadow-lg">
            <Megaphone className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Connect Meta Ads</h1>
            <p className="text-sm text-muted-foreground">
              Link your ad accounts, pages & WhatsApp for Click-to-WhatsApp tracking
            </p>
          </div>
        </div>

        {/* Already connected notice */}
        {hasExistingConnection && fbConnected && (
          <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>
                  <strong>Connected!</strong> Account: <strong>{existingAccounts[0]?.meta_account_name || existingAccounts[0]?.meta_account_id}</strong>
                  {existingAccounts[0]?.facebook_page_name && <> · Page: <strong>{existingAccounts[0].facebook_page_name}</strong></>}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1 text-xs h-7 w-fit"
                  disabled={isDisconnecting}
                  onClick={handleDisconnect}
                >
                  {isDisconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Disconnect
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Connect with Facebook */}
        {!fbConnected && (
          <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1877F2] text-white text-sm font-bold">1</div>
                Login with Facebook
              </CardTitle>
              <CardDescription>
                Connect your Facebook account to automatically fetch all your Ad Accounts, Pages, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white gap-2 h-12 px-6 text-base w-full sm:w-auto"
                  disabled={isFbLoading}
                  onClick={handleFbLogin}
                >
                  {isFbLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Facebook className="h-5 w-5" />
                  )}
                  {isFbLoading ? 'Connecting...' : 'Login with Facebook'}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Permissions requested: <strong>ads_read</strong>, <strong>pages_show_list</strong>, <strong>business_management</strong>
                </span>
              </div>

              <Separator />

              <div>
                <button
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                  onClick={() => setShowManualToken(!showManualToken)}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {showManualToken ? 'Hide manual token entry' : 'Or enter access token manually'}
                </button>
                {showManualToken && (
                  <div className="mt-3 space-y-3 p-4 rounded-lg bg-muted/50 border">
                    <Label className="text-sm">Long-Lived Access Token</Label>
                    <Input
                      placeholder="Paste your Meta access token here..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="h-10 font-mono text-xs"
                    />
                    <Button
                      onClick={handleManualTokenSubmit}
                      disabled={isManualLoading || !manualToken.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      {isManualLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Fetch Accounts
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Get a token from{' '}
                      <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Graph API Explorer
                      </a>{' '}
                      with ads_read and pages_show_list permissions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post-Login: All selections visible at once */}
        {fbConnected && (
          <>
            {/* Connection Status Bar - only show for fresh login (not existing) */}
            {!hasExistingConnection && (
            <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center gap-2">
                <span>
                  <strong>Connected to Facebook!</strong> Found <strong>{adAccounts.length}</strong> ad account(s) and <strong>{pages.length}</strong> page(s).
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs h-7 w-fit"
                    onClick={() => {
                      setFbConnected(false);
                      setAdAccounts([]);
                      setPages([]);
                      setLongLivedToken('');
                      setFormData(prev => ({ ...prev, adAccountId: '', adAccountName: '', pageId: '', pageName: '' }));
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Re-login
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            )}

            {/* Permissions Info */}
            {permissions.length > 0 && (
              <Card className="border-0 shadow-sm bg-muted/30">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Granted Permissions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {permissions.map((p: any, i: number) => (
                      <Badge
                        key={i}
                        variant={p.status === 'granted' ? 'default' : 'secondary'}
                        className={cn(
                          'text-xs',
                          p.status === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        )}
                      >
                        {p.status === 'granted' ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        {p.permission}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {adAccountsError && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                  <strong>Ad Accounts Warning:</strong> {adAccountsError}. You can still enter an Ad Account ID manually below.
                </AlertDescription>
              </Alert>
            )}

            {/* Step 2: Select Ad Account */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">1</div>
                  <Building2 className="h-4 w-4 text-primary" />
                  Select Ad Account
                  {formData.adAccountId && <Check className="h-4 w-4 text-emerald-600 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {adAccounts.length > 0 ? (
                  <div className="space-y-2">
                    {adAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50',
                          formData.adAccountId === acc.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted/40'
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, adAccountId: acc.id, adAccountName: acc.name }))}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-5 h-5 rounded-full border-2',
                          formData.adAccountId === acc.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                        )}>
                          {formData.adAccountId === acc.id && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{acc.name || acc.id}</p>
                          <p className="text-xs text-muted-foreground">{acc.id}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {acc.currency && <Badge variant="secondary" className="text-xs">{acc.currency}</Badge>}
                          {acc.timezone && <span className="text-xs text-muted-foreground hidden sm:inline">{acc.timezone}</span>}
                          {getAccountStatusBadge(acc.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">No ad accounts found via API. Enter your Ad Account ID manually:</p>
                    <Input
                      placeholder="act_123456789"
                      value={formData.adAccountId}
                      onChange={(e) => setFormData(prev => ({ ...prev, adAccountId: e.target.value.trim() }))}
                      className="h-10"
                    />
                    <Input
                      placeholder="Ad Account Name (optional)"
                      value={formData.adAccountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, adAccountName: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Select Facebook Page */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">2</div>
                  <FileText className="h-4 w-4 text-primary" />
                  Select Facebook Page
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  {formData.pageId && <Check className="h-4 w-4 text-emerald-600 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pages.length > 0 ? (
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50',
                          formData.pageId === page.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted/40'
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, pageId: page.id, pageName: page.name }))}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-5 h-5 rounded-full border-2',
                          formData.pageId === page.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                        )}>
                          {formData.pageId === page.id && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{page.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {page.id}</p>
                        </div>
                        {page.category && <Badge variant="secondary" className="text-xs flex-shrink-0">{page.category}</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">No pages found via API. Enter your Page ID manually:</p>
                    <Input
                      placeholder="123456789012345"
                      value={formData.pageId}
                      onChange={(e) => setFormData(prev => ({ ...prev, pageId: e.target.value.trim() }))}
                      className="h-10"
                    />
                    <Input
                      placeholder="Page Name (optional)"
                      value={formData.pageName}
                      onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 4: Link WhatsApp Number */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">3</div>
                  <Phone className="h-4 w-4 text-primary" />
                  Link WhatsApp Number
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  {formData.phoneNumberId && <Check className="h-4 w-4 text-emerald-600 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {phoneNumbers.length > 0 ? (
                  <div className="space-y-2">
                    {phoneNumbers.map((phone) => (
                      <div
                        key={phone.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50',
                          formData.phoneNumberId === phone.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted/40'
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, phoneNumberId: phone.id, phoneDisplay: phone.display_number || '' }))}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-5 h-5 rounded-full border-2',
                          formData.phoneNumberId === phone.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                        )}>
                          {formData.phoneNumberId === phone.id && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{phone.display_number || phone.phone_number_id}</p>
                        </div>
                        {phone.quality_rating === 'GREEN' && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      No WhatsApp numbers connected to this workspace yet.
                      Connect a WhatsApp number first from the WABA settings.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Summary & Complete */}
            <Card className="border-0 shadow-lg border-t-4 border-t-primary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Setup Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" /> Ad Account
                    </span>
                    <span className="font-medium">
                      {formData.adAccountName || formData.adAccountId || <span className="text-muted-foreground italic">Not selected</span>}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> Facebook Page
                    </span>
                    <span className="font-medium">
                      {formData.pageName || formData.pageId || <span className="text-muted-foreground italic">Not selected</span>}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> WhatsApp Number
                    </span>
                    <span className="font-medium">
                      {formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number || <span className="text-muted-foreground italic">Not selected</span>}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" /> Live Sync
                    </span>
                    <Badge variant={longLivedToken ? 'default' : 'secondary'}>
                      {longLivedToken ? 'Enabled' : 'Manual only'}
                    </Badge>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                    <strong>Privacy:</strong> AIREATRO only reads ad performance data and lead events. We never create, modify, or manage your ads.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleComplete}
                  disabled={!canComplete || isConnecting}
                  className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25"
                  size="lg"
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Enable Click-to-WhatsApp Tracking
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
