import React, { useEffect, useState } from 'react';
import { Phone, Plus, Signal, SignalHigh, SignalLow, SignalMedium, RefreshCw, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import type { PhoneNumber, WabaAccount, PhoneStatus, QualityRating } from '@/types/whatsapp';

export default function PhoneNumbers() {
  const { currentTenant, currentRole } = useTenant();
  const [phoneNumbers, setPhoneNumbers] = useState<(PhoneNumber & { waba_account: WabaAccount })[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [embeddedSignupOpen, setEmbeddedSignupOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessId: '',
    wabaId: '',
    phoneNumberId: '',
    displayNumber: '',
    accessToken: '',
  });

  const canManagePhones = currentRole === 'owner' || currentRole === 'admin';

  useEffect(() => {
    if (currentTenant) {
      fetchPhoneNumbers();
    }
  }, [currentTenant]);

  const fetchPhoneNumbers = async () => {
    if (!currentTenant) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select(`
          *,
          waba_account:waba_accounts(*)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers((data || []) as any);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to fetch phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!currentTenant) return;
    
    setConnectLoading(true);
    try {
      // First, create or get WABA account
      const { data: existingWaba } = await supabase
        .from('waba_accounts')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('waba_id', formData.wabaId)
        .maybeSingle();

      let wabaAccountId: string;

      if (existingWaba) {
        wabaAccountId = existingWaba.id;
        // Update access token
        await supabase
          .from('waba_accounts')
          .update({ encrypted_access_token: formData.accessToken, status: 'active' })
          .eq('id', wabaAccountId);
      } else {
        const { data: newWaba, error: wabaError } = await supabase
          .from('waba_accounts')
          .insert({
            tenant_id: currentTenant.id,
            business_id: formData.businessId,
            waba_id: formData.wabaId,
            encrypted_access_token: formData.accessToken,
            status: 'active',
          })
          .select()
          .single();

        if (wabaError) throw wabaError;
        wabaAccountId = newWaba.id;
      }

      // Create phone number
      const { error: phoneError } = await supabase
        .from('phone_numbers')
        .insert({
          tenant_id: currentTenant.id,
          waba_account_id: wabaAccountId,
          phone_number_id: formData.phoneNumberId,
          display_number: formData.displayNumber,
          status: 'connected',
        });

      if (phoneError) {
        if (phoneError.message.includes('duplicate')) {
          toast.error('This phone number is already connected');
        } else {
          throw phoneError;
        }
        return;
      }

      toast.success('Phone number connected successfully!');
      setConnectDialogOpen(false);
      setFormData({ businessId: '', wabaId: '', phoneNumberId: '', displayNumber: '', accessToken: '' });
      fetchPhoneNumbers();
    } catch (error: any) {
      console.error('Error connecting phone number:', error);
      toast.error(error.message || 'Failed to connect phone number');
    } finally {
      setConnectLoading(false);
    }
  };

  const getStatusBadge = (status: PhoneStatus) => {
    const variants: Record<PhoneStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      connected: { variant: 'default', label: 'Connected' },
      pending: { variant: 'secondary', label: 'Pending' },
      disconnected: { variant: 'outline', label: 'Disconnected' },
      banned: { variant: 'destructive', label: 'Banned' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getQualityIcon = (rating: QualityRating) => {
    switch (rating) {
      case 'GREEN':
        return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'YELLOW':
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      case 'RED':
        return <SignalLow className="w-4 h-4 text-red-500" />;
      default:
        return <Signal className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Phone Numbers</h1>
            <p className="text-muted-foreground">Manage your WhatsApp Business phone numbers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchPhoneNumbers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            {canManagePhones && (
              <>
                {/* 1-Click Meta Embedded Signup */}
                <Dialog open={embeddedSignupOpen} onOpenChange={setEmbeddedSignupOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Zap className="w-4 h-4 mr-2" />
                      1-Click Connect
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Connect WhatsApp Business</DialogTitle>
                      <DialogDescription>
                        Use Meta's secure signup flow to connect your WhatsApp Business Account in one click.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <MetaEmbeddedSignup
                        onSuccess={(data) => {
                          setEmbeddedSignupOpen(false);
                          fetchPhoneNumbers();
                        }}
                        onError={(error) => {
                          console.error('Embedded signup error:', error);
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Manual Connect */}
                <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Setup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Manual Connection</DialogTitle>
                      <DialogDescription>
                        Enter your WhatsApp Business API credentials manually.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessId">Business ID</Label>
                        <Input
                          id="businessId"
                          placeholder="123456789"
                          value={formData.businessId}
                          onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wabaId">WABA ID</Label>
                        <Input
                          id="wabaId"
                          placeholder="123456789"
                          value={formData.wabaId}
                          onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                        <Input
                          id="phoneNumberId"
                          placeholder="123456789"
                          value={formData.phoneNumberId}
                          onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayNumber">Display Number</Label>
                        <Input
                          id="displayNumber"
                          placeholder="+1 555 123 4567"
                          value={formData.displayNumber}
                          onChange={(e) => setFormData({ ...formData, displayNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accessToken">Access Token</Label>
                        <Input
                          id="accessToken"
                          type="password"
                          placeholder="Your WhatsApp API access token"
                          value={formData.accessToken}
                          onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleConnect} disabled={connectLoading || !formData.businessId || !formData.wabaId || !formData.phoneNumberId || !formData.displayNumber || !formData.accessToken}>
                        {connectLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Connected Numbers
            </CardTitle>
            <CardDescription>
              Your WhatsApp Business phone numbers and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : phoneNumbers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No phone numbers connected yet</p>
                <p className="text-sm">Click "Connect Number" to add your first WhatsApp number</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>WABA ID</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phoneNumbers.map((phone) => (
                    <TableRow key={phone.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{phone.display_number}</div>
                          {phone.verified_name && (
                            <div className="text-xs text-muted-foreground">{phone.verified_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{phone.waba_account?.waba_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getQualityIcon(phone.quality_rating)}
                          <span className="text-sm">{phone.quality_rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(phone.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(phone.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
