import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShopifyPageShell } from '@/components/shopify/ShopifyPageShell';
import { useShopifyStores } from '@/hooks/useShopifyStores';
import { useToast } from '@/hooks/use-toast';

const REQUIRED_SCOPES = [
  { scope: 'read_products', label: 'Products', description: 'Read product catalog and variants' },
  { scope: 'read_customers', label: 'Customers', description: 'Read customer data' },
  { scope: 'read_orders', label: 'Orders', description: 'Read order history' },
  { scope: 'read_checkouts', label: 'Checkouts', description: 'Read abandoned checkouts' },
  { scope: 'read_inventory', label: 'Inventory', description: 'Read stock levels' },
  { scope: 'read_fulfillments', label: 'Fulfillments', description: 'Read shipping status' },
  { scope: 'read_content', label: 'Content', description: 'Read pages and blog posts' },
];

export default function ShopifyConnect() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { initiateConnect } = useShopifyStores();
  const [storeDomain, setStoreDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!storeDomain.trim()) {
      setError('Please enter your Shopify store domain');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const { authUrl } = await initiateConnect(storeDomain.trim());
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate connection');
      toast({ title: 'Connection Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ShopifyPageShell
      title="Connect Shopify Store"
      subtitle="Enter your store domain to begin the OAuth connection process"
      icon={Store}
      backTo="/app/integrations/shopify"
      backLabel="Back to Shopify"
      maxWidth="sm"
    >
      {/* Connection Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Store Domain</CardTitle>
          <CardDescription>Enter your Shopify store URL (e.g., mystore.myshopify.com)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="yourstore.myshopify.com"
              value={storeDomain}
              onChange={(e) => { setStoreDomain(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              disabled={isConnecting}
              className="flex-1"
            />
            <Button onClick={handleConnect} disabled={isConnecting || !storeDomain.trim()} className="shrink-0">
              {isConnecting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</> : 'Connect'}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Scopes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Required Permissions
          </CardTitle>
          <CardDescription>Aireatro will request read-only access to these resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {REQUIRED_SCOPES.map(({ scope, label, description }) => (
              <div key={scope} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Store not found?</p>
              <p className="text-muted-foreground">Make sure you're using your .myshopify.com domain, not a custom domain.</p>
            </div>
            <div>
              <p className="font-medium">Permission denied?</p>
              <p className="text-muted-foreground">You need store owner or staff access with app installation permissions.</p>
            </div>
            <div>
              <p className="font-medium">Already installed?</p>
              <p className="text-muted-foreground">Go to Shopify Admin → Apps and remove it first, then reinstall.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ShopifyPageShell>
  );
}
