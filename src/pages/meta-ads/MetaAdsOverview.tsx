import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Megaphone,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Settings,
  Zap,
  Shield,
  Play,
  Target,
  MousePointerClick,
  LinkIcon,
  Inbox,
} from 'lucide-react';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import { formatDistanceToNow } from 'date-fns';

export default function MetaAdsOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { accounts, connectedAccounts, campaigns, isConnected, isLoading, refetch } = useMetaAdAccounts();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Compute real stats from campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads_count || 0), 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend_amount || 0), 0);
  const totalConversations = campaigns.reduce((sum, c) => sum + (c.conversations_started || 0), 0);
  const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const conversionRate = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0) > 0
    ? (totalLeads / campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)) * 100
    : 0;

  const connectedAccount = connectedAccounts[0];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
          <Skeleton className="h-14 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <Megaphone className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Meta Ads</h1>
              <p className="text-sm text-muted-foreground">
                Click-to-WhatsApp ad performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Sync </span>Data
            </Button>
            <Button asChild size="sm" className="gap-1.5 shadow-lg shadow-primary/25 text-xs sm:text-sm">
              <Link to="/meta-ads/setup">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Setup
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Guide */}
        <QuickGuide {...quickGuides.metaAds} />

        {/* Compliance Notice */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Meta App Review Compliant</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            AIREATRO only reads ad performance and lead attribution data. Ads are fully created and billed via Meta Ads Manager.
          </AlertDescription>
        </Alert>

        {/* Connection Status */}
        {isConnected && connectedAccount ? (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {connectedAccount.meta_account_name || `Ad Account ${connectedAccount.meta_account_id}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Connected
                      {connectedAccount.last_synced_at && (
                        <> • Last synced {formatDistanceToNow(new Date(connectedAccount.last_synced_at), { addSuffix: true })}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm h-8 sm:h-9">
                    <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener noreferrer" className="gap-1.5 sm:gap-2">
                      <span className="hidden xs:inline">Open</span> Ads Manager
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">No Ad Account Connected</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Connect your Meta Ad Account to start tracking leads
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="gap-1.5">
                  <Link to="/meta-ads/setup">
                    <LinkIcon className="h-4 w-4" />
                    Connect Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Active</Badge>
              </div>
              <div className="text-xl sm:text-3xl font-bold">{activeCampaigns.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Active Campaigns</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold">{totalLeads}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Leads</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold">{totalConversations}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Conversations</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold">
                {avgCPL > 0 ? `$${avgCPL.toFixed(2)}` : '—'}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Cost per Lead</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-xl sm:text-2xl font-bold">{conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : '—'}</p>
                </div>
              </div>
              <Progress value={conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Ad Click → WhatsApp Chat
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-xl sm:text-2xl font-bold">{campaigns.length}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeCampaigns.length} active, {campaigns.length - activeCampaigns.length} paused/other
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalSpend > 0 ? `$${totalSpend.toFixed(2)}` : '—'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns • Billed by Meta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List or Empty State */}
        {campaigns.length > 0 ? (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Campaign Performance
                  </CardTitle>
                  <CardDescription>Your active Meta Ad campaigns</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/meta-ads/manager">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background border">
                        <Megaphone className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">{campaign.campaign_name}</span>
                        <p className="text-xs text-muted-foreground">
                          {campaign.leads_count} leads • {campaign.conversations_started} conversations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {campaign.status}
                      </Badge>
                      <span className="text-sm font-semibold text-muted-foreground">
                        ${(campaign.spend_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Campaign Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                {isConnected
                  ? 'Your ad account is connected. Campaign data will appear here once your Meta Ads start generating leads through Click-to-WhatsApp ads.'
                  : 'Connect your Meta Ad Account first, then campaign data will sync automatically.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {!isConnected && (
                  <Button asChild>
                    <Link to="/meta-ads/setup">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Ad Account
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Open Ads Manager
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group touch-manipulation">
            <CardContent className="p-4 sm:p-6">
              <Link to="/meta-ads/analytics" className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform flex-shrink-0">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">View Analytics</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Detailed lead & campaign insights</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group touch-manipulation">
            <CardContent className="p-4 sm:p-6">
              <Link to="/meta-ads/automations" className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">Setup Automations</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Auto-respond to ad leads</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group touch-manipulation">
            <CardContent className="p-4 sm:p-6">
              <Link to="/meta-ads/manager" className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">Ads Manager</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Manage all campaigns</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
