import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle, Activity, BookOpen, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { ConnectedIntegrationCard } from '@/components/integrations/ConnectedIntegrationCard';
import { IntegrationFilters } from '@/components/integrations/IntegrationFilters';
import { ConnectIntegrationModal } from '@/components/integrations/ConnectIntegrationModal';
import { RazorpayConnectModal } from '@/components/integrations/RazorpayConnectModal';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useIntegrationAudit } from '@/hooks/useIntegrationAudit';
import { useIntegrationPermissions } from '@/hooks/useIntegrationPermissions';
import { useToast } from '@/hooks/use-toast';
import type { IntegrationCatalog, IntegrationCategory } from '@/types/integration';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlanGate } from '@/hooks/usePlanGate';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { UpgradePlanDialog } from '@/components/billing/UpgradePlanDialog';

export default function IntegrationsHub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    integrationsWithStatus, 
    isLoading, 
    connect, 
    isConnecting,
    refetch
  } = useIntegrations();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCatalog | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const { hasFeature, currentPlan, requiredPlanFor } = usePlanGate();
  const integrationsLocked = !hasFeature('integrations');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { log: auditLog } = useIntegrationAudit();
  const { canConnect, canDisconnect } = useIntegrationPermissions();

  // Calculate counts for filters
  const counts = useMemo(() => {
    const result: Record<string, number> = { all: integrationsWithStatus.length };
    
    integrationsWithStatus.forEach(integration => {
      result[integration.category] = (result[integration.category] || 0) + 1;
      if (integration.isConnected) {
        result.connected = (result.connected || 0) + 1;
      }
    });

    return result;
  }, [integrationsWithStatus]);

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    let result = integrationsWithStatus;

    // Filter by category or connected status
    if (activeFilter === 'connected') {
      result = result.filter(i => i.isConnected);
    } else if (activeFilter !== 'all') {
      result = result.filter(i => i.category === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [integrationsWithStatus, activeFilter, searchQuery]);

  const handleConnect = (integration: IntegrationCatalog) => {
    if (!canConnect) {
      toast({
        title: 'Permission Denied',
        description: 'Only owners and admins can connect integrations.',
        variant: 'destructive',
      });
      return;
    }

    if (integration.key === 'razorpay') {
      setIsRazorpayModalOpen(true);
      return;
    }
    
    setSelectedIntegration(integration);
    setIsConnectModalOpen(true);
  };

  const handleConnectSubmit = (credentials?: Record<string, unknown>) => {
    if (!selectedIntegration) return;

    connect({
      integrationKey: selectedIntegration.key,
      credentials,
    }, {
      onSuccess: () => {
        auditLog('integration.connected', 'integration', selectedIntegration.key, {
          integration_name: selectedIntegration.name,
        });
        toast({
          title: 'Integration Connected',
          description: `${selectedIntegration.name} has been connected successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Connection Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const connectedIntegrations = integrationsWithStatus.filter(i => i.isConnected);
  const connectedCount = connectedIntegrations.length;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {integrationsLocked && (
          <UpgradePrompt
            currentPlan={currentPlan}
            requiredPlan={requiredPlanFor('integrations') || 'pro'}
            feature="Integrations"
            description="Connect with Shopify, WooCommerce, Razorpay, Zapier and more. Upgrade to Pro to unlock integrations."
            onUpgrade={() => setUpgradeOpen(true)}
            className="mb-6"
          />
        )}
        {/* Quick Guide Banner */}
        <QuickGuide
          title="Integrations Guide"
          description={quickGuides.integrations.description}
          links={quickGuides.integrations.links}
          className="mb-6"
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Puzzle className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
              {connectedCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {connectedCount} connected
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Connect your favorite tools and automate WhatsApp workflows
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/help/integrations-guide')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings?tab=integrations')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <IntegrationFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={counts}
          />
        </div>

        {/* Connected Integrations with Sub-Menus */}
        {connectedIntegrations.length > 0 && activeFilter !== 'connected' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Active Integrations
              <Badge variant="secondary">{connectedIntegrations.length}</Badge>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {connectedIntegrations.map((integration) => (
                <ConnectedIntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Integrations Grid */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {activeFilter === 'connected' ? 'Connected Integrations' : 'All Integrations'}
          </h2>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <Puzzle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No integrations found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : 'No integrations in this category yet'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onManage={() => navigate(`/app/integrations/${integration.key}`)}
                onViewDocs={() => window.open(integration.documentation_url || '/help/integrations-guide', '_blank')}
                onViewEvents={() => navigate(`/app/integrations/${integration.key}?tab=events`)}
              />
            ))}
          </div>
        )}

        {/* Connect Modal */}
        <ConnectIntegrationModal
          integration={selectedIntegration}
          isOpen={isConnectModalOpen}
          onClose={() => {
            setIsConnectModalOpen(false);
            setSelectedIntegration(null);
          }}
          onConnect={handleConnectSubmit}
          isConnecting={isConnecting}
        />

        {/* Razorpay Connect Modal */}
        <RazorpayConnectModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          onSuccess={() => {
            setIsRazorpayModalOpen(false);
            refetch(); // Refresh integrations list
            toast({
              title: 'Razorpay Connected',
              description: 'You can now create event mappings to send WhatsApp messages.',
            });
            navigate('/app/integrations/razorpay');
          }}
        />
      </div>
      <UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlanId={currentPlan} />
    </DashboardLayout>
  );
}
