import React from 'react';
import { 
  Code, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Megaphone, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Settings,
  Activity,
  Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { IntegrationWithStatus, IntegrationCategory } from '@/types/integration';

const CATEGORY_ICON_MAP: Record<IntegrationCategory, React.ElementType> = {
  api: Code,
  ecommerce: ShoppingCart,
  payments: CreditCard,
  crm: Users,
  marketing: Megaphone,
  automation: Zap,
};

const INTEGRATION_LOGOS: Record<string, string> = {
  shopify: 'https://cdn.worldvectorlogo.com/logos/shopify.svg',
  woocommerce: 'https://cdn.worldvectorlogo.com/logos/woocommerce.svg',
  zapier: 'https://cdn.worldvectorlogo.com/logos/zapier.svg',
  razorpay: 'https://cdn.worldvectorlogo.com/logos/razorpay.svg',
  // Fallback to initials for others
};

interface IntegrationCardProps {
  integration: IntegrationWithStatus;
  onConnect: () => void;
  onManage: () => void;
  onViewDocs?: () => void;
  onViewEvents?: () => void;
}

export function IntegrationCard({ 
  integration, 
  onConnect, 
  onManage,
  onViewDocs,
  onViewEvents 
}: IntegrationCardProps) {
  const CategoryIcon = CATEGORY_ICON_MAP[integration.category];
  const logoUrl = INTEGRATION_LOGOS[integration.key];
  
  const getHealthColor = () => {
    if (!integration.isConnected) return '';
    switch (integration.tenantIntegration?.health_status) {
      case 'healthy': return 'border-green-500/30 bg-green-500/5';
      case 'degraded': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error': return 'border-red-500/30 bg-red-500/5';
      default: return '';
    }
  };

  const getStatusBadge = () => {
    if (integration.is_pro_only && !integration.isConnected) {
      return (
        <Badge variant="outline" className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/30">
          <Lock className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      );
    }
    
    if (integration.isConnected) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-0">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not connected
      </Badge>
    );
  };

  const getHealthIndicator = () => {
    if (!integration.isConnected) return null;
    
    const status = integration.tenantIntegration?.health_status;
    const Icon = status === 'healthy' ? CheckCircle2 : status === 'error' ? XCircle : AlertCircle;
    const color = status === 'healthy' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-yellow-500';
    
    return (
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-3.5 h-3.5", color)} />
            {integration.lastEventFormatted && (
              <span className="text-xs text-muted-foreground">
                {integration.lastEventFormatted}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Health: {status}</p>
          {integration.tenantIntegration?.last_error && (
            <p className="text-red-400 text-xs mt-1">
              {integration.tenantIntegration.last_error}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 border-border/50",
      getHealthColor(),
      integration.isConnected && "border-primary/20"
    )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200"
            )}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={integration.name} 
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={cn(
                "text-lg font-bold text-slate-600",
                logoUrl && "hidden"
              )}>
                {integration.name.charAt(0)}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {integration.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground capitalize">
                  {integration.category.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {integration.description}
        </p>

        {/* Health & Setup Time */}
        <div className="flex items-center justify-between mb-4">
          {integration.isConnected ? (
            getHealthIndicator()
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">~{integration.setup_time_minutes} min setup</span>
            </div>
          )}
          
          {integration.supported_events.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  {integration.supported_events.length} events
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium mb-1">Supported Events:</p>
                <ul className="text-xs space-y-0.5">
                  {integration.supported_events.slice(0, 5).map(event => (
                    <li key={event}>• {event}</li>
                  ))}
                  {integration.supported_events.length > 5 && (
                    <li>+ {integration.supported_events.length - 5} more</li>
                  )}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {integration.isConnected ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={onManage}
              >
                <Settings className="w-4 h-4 mr-1.5" />
                Manage
              </Button>
              {onViewEvents && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onViewEvents}
                >
                  <Activity className="w-4 h-4" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={onConnect}
                disabled={integration.is_pro_only}
              >
                {integration.is_pro_only ? (
                  <>
                    <Lock className="w-4 h-4 mr-1.5" />
                    Upgrade to Pro
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
              {onViewDocs && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onViewDocs}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
