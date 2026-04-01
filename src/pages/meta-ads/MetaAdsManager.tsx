import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Megaphone,
  Search,
  RefreshCw,
  MoreHorizontal,
  BarChart3,
  Zap,
  Play,
  Pause,
  ExternalLink,
  TrendingUp,
  Users,
  DollarSign,
  MousePointerClick,
  Filter,
  Inbox,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import { cn } from '@/lib/utils';

export default function MetaAdsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { currentTenant } = useTenant();
  const { campaigns, connectedAccounts, isConnected, isLoading, refetch } = useMetaAdAccounts();

  // Sort: active first, then by name
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return a.campaign_name.localeCompare(b.campaign_name);
  });

  const filteredCampaigns = sortedCampaigns.filter(campaign =>
    campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.ad_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }

    setIsRefreshing(true);

    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-sync', {
        body: { tenantId: currentTenant.id },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      await refetch();
      toast.success(data?.synced ? `Synced ${data.synced} campaign${data.synced === 1 ? '' : 's'}` : 'Meta Ads synced');
    } catch (error: any) {
      toast.error(error?.message || 'Meta Ads sync failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><Play className="h-3 w-3 mr-1" />Active</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totals = campaigns.reduce((acc, c) => ({
    impressions: acc.impressions + (c.impressions || 0),
    clicks: acc.clicks + (c.clicks || 0),
    spend: acc.spend + (c.spend_amount || 0),
    leads: acc.leads + (c.leads_count || 0),
  }), { impressions: 0, clicks: 0, spend: 0, leads: 0 });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
          <Skeleton className="h-14 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ads Manager</h1>
              <p className="text-sm text-muted-foreground">
                View your Click-to-WhatsApp campaigns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild size="sm" className="gap-1.5 shadow-lg shadow-primary/25">
              <Link to="/meta-ads/create">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm" onClick={() => window.open('https://www.facebook.com/adsmanager/manage/campaigns', '_blank', 'noopener,noreferrer')}>
              <span className="hidden xs:inline">Open</span> Meta Ads
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totals.impressions.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Impressions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex-shrink-0">
                <MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totals.clicks.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Clicks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totals.leads}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{campaigns[0]?.spend_currency || 'USD'} {totals.spend.toFixed(2)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Spend</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button variant="outline" className="gap-2 h-10 text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Campaigns Table or Empty State */}
        {campaigns.length > 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[300px]">Campaign / Ad</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">CPL</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const ctr = (campaign.impressions || 0) > 0 ? ((campaign.clicks || 0) / (campaign.impressions || 1)) * 100 : 0;
                    const cpl = (campaign.leads_count || 0) > 0 ? (campaign.spend_amount || 0) / (campaign.leads_count || 1) : 0;
                    return (
                      <TableRow key={campaign.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.campaign_name}</p>
                            {campaign.ad_name && <p className="text-sm text-muted-foreground">{campaign.ad_name}</p>}
                            {campaign.adset_name && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {campaign.adset_name}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {(campaign.impressions || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(campaign.clicks || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-medium",
                            ctr > 3 ? "text-emerald-600" : "text-muted-foreground"
                          )}>
                            {ctr.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">{campaign.leads_count || 0}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {cpl > 0 ? `${campaign.spend_currency || 'USD'} ${cpl.toFixed(2)}` : '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {campaign.spend_currency || 'USD'} {(campaign.spend_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/meta-ads/analytics?campaign=${campaign.id}`} className="gap-2 cursor-pointer">
                                  <BarChart3 className="h-4 w-4" />
                                  View Analytics
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/contacts?source=meta_ads&campaign=${campaign.meta_campaign_id}`} className="gap-2 cursor-pointer">
                                  <Users className="h-4 w-4" />
                                  View Leads
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link to="/meta-ads/automations" className="gap-2 cursor-pointer">
                                  <Zap className="h-4 w-4" />
                                  Create Automation
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add campaigns from the Meta Ads Overview page to see them here.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-sm text-muted-foreground text-center">
          To create or edit ads, use{' '}
          <a
            href="https://adsmanager.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Meta Ads Manager
          </a>
        </p>
      </div>
    </DashboardLayout>
  );
}
