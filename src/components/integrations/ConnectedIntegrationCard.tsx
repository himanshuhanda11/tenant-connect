import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Database,
  Webhook,
  Settings,
  ShoppingCart,
  Zap,
  BarChart3,
  Store,
  LayoutDashboard,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IntegrationWithStatus } from '@/types/integration';

interface SubMenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
  description: string;
}

const INTEGRATION_SUB_MENUS: Record<string, (storeId?: string) => SubMenuItem[]> = {
  shopify: (storeId) => {
    const base = storeId
      ? `/app/integrations/shopify/${storeId}`
      : '/app/integrations/shopify';
    return [
      { label: 'Overview', icon: LayoutDashboard, path: storeId ? base : '/app/integrations/shopify', description: 'Store overview & health' },
      ...(storeId ? [
        { label: 'Sync Center', icon: RefreshCw, path: `${base}/sync`, description: 'Manual sync & jobs' },
        { label: 'Webhooks', icon: Webhook, path: `${base}/webhooks`, description: 'Event delivery' },
        { label: 'Data Explorer', icon: Database, path: `${base}/data`, description: 'Browse synced data' },
        { label: 'Cart Recovery', icon: ShoppingCart, path: `${base}/recovery`, description: 'Abandoned carts' },
        { label: 'Automations', icon: Zap, path: `${base}/automations`, description: 'Engagement rules' },
        { label: 'Analytics', icon: BarChart3, path: `${base}/analytics`, description: 'Conversion data' },
        { label: 'Settings', icon: Settings, path: `${base}/settings`, description: 'Widget & toggles' },
      ] : []),
    ];
  },
};

// Default sub-menu for integrations without specialized pages
const defaultSubMenu = (key: string): SubMenuItem[] => [
  { label: 'Overview', icon: LayoutDashboard, path: `/app/integrations/${key}`, description: 'Integration overview' },
];

interface ConnectedIntegrationCardProps {
  integration: IntegrationWithStatus;
  storeId?: string;
}

export function ConnectedIntegrationCard({ integration, storeId }: ConnectedIntegrationCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const getSubMenus = INTEGRATION_SUB_MENUS[integration.key];
  const subMenus = getSubMenus
    ? getSubMenus(storeId)
    : defaultSubMenu(integration.key);

  const healthStatus = integration.tenantIntegration?.health_status;

  return (
    <Card className={cn(
      'border-primary/20 transition-all duration-200',
      expanded && 'shadow-md'
    )}>
      <CardContent className="p-0">
        {/* Header - clickable to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors rounded-t-lg text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{integration.name}</h3>
              <Badge className="bg-green-500/10 text-green-600 border-0 shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              {healthStatus === 'degraded' && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 shrink-0">Degraded</Badge>
              )}
              {healthStatus === 'error' && (
                <Badge variant="outline" className="text-red-600 border-red-500/30 shrink-0">Error</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {integration.lastEventFormatted
                ? `Last event ${integration.lastEventFormatted}`
                : 'No events yet'}
            </p>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Sub-menu items */}
        {expanded && (
          <div className="border-t border-border/50 px-2 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {subMenus.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="justify-start h-auto py-2.5 px-3 gap-3"
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="text-left min-w-0">
                      <span className="text-sm font-medium block">{item.label}</span>
                      <span className="text-xs text-muted-foreground block">{item.description}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
