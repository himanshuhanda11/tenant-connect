import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Plus,
  RefreshCw,
  Activity,
  ShoppingBag,
  Users,
  ShoppingCart,
  Webhook,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useShopifyStores } from '@/hooks/useShopifyStores';
import type { ConnectedStore } from '@/types/shopify';
import { formatDistanceToNow } from 'date-fns';

const STATUS_BADGE: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  connected: { variant: 'default', label: 'Connected' },
  pending: { variant: 'secondary', label: 'Pending' },
  disconnected: { variant: 'outline', label: 'Disconnected' },
  error: { variant: 'destructive', label: 'Error' },
  uninstalled: { variant: 'destructive', label: 'Uninstalled' },
};

function StoreCard({ store, onClick }: { store: ConnectedStore; onClick: () => void }) {
  const badge = STATUS_BADGE[store.status] || STATUS_BADGE.pending;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{store.store_name || store.store_domain}</CardTitle>
              <CardDescription className="text-xs">{store.store_domain}</CardDescription>
            </div>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          {store.store_plan && (
            <div className="flex justify-between">
              <span>Plan</span>
              <span className="font-medium text-foreground capitalize">{store.store_plan}</span>
            </div>
          )}
          {store.store_currency && (
            <div className="flex justify-between">
              <span>Currency</span>
              <span className="font-medium text-foreground">{store.store_currency}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Webhooks</span>
            <span className="flex items-center gap-1">
              {store.webhooks_registered ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Active</>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Not set</>
              )}
            </span>
          </div>
          {store.last_synced_at && (
            <div className="flex justify-between">
              <span>Last sync</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(store.last_synced_at), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShopifyOverview() {
  const navigate = useNavigate();
  const { stores, isLoading, refetch } = useShopifyStores();

  const connectedStores = stores.filter(s => s.status === 'connected');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Shopify Integration</h1>
              {connectedStores.length > 0 && (
                <Badge variant="secondary">{connectedStores.length} connected</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Connect your Shopify stores to enable commerce-driven engagement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate('/app/integrations/shopify/connect')}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Store
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {connectedStores.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{connectedStores.length}</p>
                    <p className="text-xs text-muted-foreground">Connected Stores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {connectedStores.filter(s => s.webhooks_registered).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Webhooks Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {connectedStores.filter(s => s.last_synced_at).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Synced</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Webhook className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {connectedStores.filter(s => s.app_embed_enabled).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Widget Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stores Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Shopify Stores Connected</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Connect your Shopify store to sync products, customers, and orders for WhatsApp engagement.
              </p>
              <Button onClick={() => navigate('/app/integrations/shopify/connect')}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => navigate(`/app/integrations/shopify/${store.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
