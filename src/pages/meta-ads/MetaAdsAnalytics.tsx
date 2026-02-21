import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Download,
  RefreshCw,
  Calendar,
  Target,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
} from 'lucide-react';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';

export default function MetaAdsAnalytics() {
  const [dateRange, setDateRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { campaigns, isLoading, refetch } = useMetaAdAccounts();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Compute real stats
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads_count || 0), 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend_amount || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalConversations = campaigns.reduce((sum, c) => sum + (c.conversations_started || 0), 0);
  const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;
  const chatStartRate = totalClicks > 0 ? (totalConversations / totalClicks) * 100 : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
          <Skeleton className="h-14 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Quick Guide */}
        <QuickGuide {...quickGuides.metaAds} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25">
              <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Lead Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Track ad performance and lead quality
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 sm:w-40 h-9 text-xs sm:text-sm">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : '—'}</div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{costPerLead > 0 ? `${campaigns[0]?.spend_currency || 'USD'} ${costPerLead.toFixed(2)}` : '—'}</div>
              <p className="text-sm text-muted-foreground">Cost per Lead</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Impressions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">{chatStartRate > 0 ? `${chatStartRate.toFixed(0)}%` : '—'}</div>
              <p className="text-sm text-muted-foreground">Chat Started Rate</p>
            </CardContent>
          </Card>
        </div>

        {campaigns.length > 0 ? (
          <>
            {/* Campaign Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Campaign Performance
                  </CardTitle>
                  <CardDescription>Leads and spend per campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => {
                      const maxLeads = Math.max(...campaigns.map(c => c.leads_count || 0), 1);
                      return (
                        <div key={campaign.id} className="flex items-center gap-4">
                          <div className="w-32 sm:w-40 text-sm font-medium truncate">{campaign.campaign_name}</div>
                          <div className="flex-1">
                            <div className="h-10 bg-muted rounded-xl overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-end pr-4 transition-all duration-500"
                                style={{ width: `${((campaign.leads_count || 0) / maxLeads) * 100}%`, minWidth: campaign.leads_count ? '40px' : '0' }}
                              >
                                <span className="text-sm font-bold text-primary-foreground">
                                  {campaign.leads_count || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-24 text-right">
                            <span className="text-sm font-medium">{campaign.spend_currency || 'USD'} {(campaign.spend_amount || 0).toFixed(2)}</span>
                            <p className="text-xs text-muted-foreground">spend</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Leads by Campaign */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    By Campaign
                  </CardTitle>
                  <CardDescription>Lead distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.map((campaign, idx) => {
                    const maxLeads = Math.max(...campaigns.map(c => c.leads_count || 0), 1);
                    const percentage = ((campaign.leads_count || 0) / maxLeads) * 100;
                    const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[150px]">{campaign.campaign_name}</span>
                          <span className="font-bold">{campaign.leads_count || 0}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Conversion Funnel
                </CardTitle>
                <CardDescription>Ad click to conversion journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  {[
                    { label: 'Ad Impressions', value: totalImpressions, icon: TrendingUp, color: 'bg-blue-500' },
                    { label: 'Ad Clicks', value: totalClicks, icon: Target, color: 'bg-violet-500' },
                    { label: 'Conversations', value: totalConversations, icon: MessageSquare, color: 'bg-emerald-500' },
                    { label: 'Leads', value: totalLeads, icon: Users, color: 'bg-amber-500' },
                  ].map((step, idx, arr) => (
                    <div key={idx} className="flex-1 relative">
                      <div className="text-center">
                        <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xl font-bold">{step.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{step.label}</p>
                        {idx > 0 && arr[idx - 1].value > 0 && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {((step.value / arr[idx - 1].value) * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-muted" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{totalConversations}</p>
                      <p className="text-sm text-muted-foreground">Conversations Started</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{campaigns[0]?.spend_currency || 'USD'} {totalSpend.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add campaigns from the Meta Ads Overview page to see analytics here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
