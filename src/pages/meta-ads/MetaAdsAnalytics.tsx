import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter,
} from 'lucide-react';
import { MOCK_LEADS_BY_DAY, MOCK_LEADS_BY_CAMPAIGN, MOCK_META_ADS_OVERVIEW } from '@/types/metaAds';

export default function MetaAdsAnalytics() {
  const [dateRange, setDateRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const data = MOCK_META_ADS_OVERVIEW;
  const leadsByDay = MOCK_LEADS_BY_DAY;
  const leadsByCampaign = MOCK_LEADS_BY_CAMPAIGN;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
  };

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
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs sm:text-sm">
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
                <div className="flex items-center text-emerald-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  +18%
                </div>
              </div>
              <div className="text-2xl font-bold">{data.leadsThisMonth}</div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-center text-emerald-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  +5%
                </div>
              </div>
              <div className="text-2xl font-bold">{data.conversionRate}%</div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex items-center text-rose-600 text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3" />
                  -12%
                </div>
              </div>
              <div className="text-2xl font-bold">${data.costPerLead.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Cost per Lead</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <Clock className="h-5 w-5 text-violet-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">2.4 min</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-sm text-muted-foreground">Chat Started Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Leads Over Time */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Leads Over Time
              </CardTitle>
              <CardDescription>Daily lead generation from Meta Ads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadsByDay.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">{day.date}</div>
                    <div className="flex-1">
                      <div className="h-10 bg-muted rounded-xl overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-end pr-4 transition-all duration-500"
                          style={{ width: `${(day.leads / 60) * 100}%` }}
                        >
                          <span className="text-sm font-bold text-primary-foreground">
                            {day.leads}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <span className="text-sm font-medium">${day.spend.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">spend</p>
                    </div>
                  </div>
                ))}
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
              <CardDescription>Top performing campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leadsByCampaign.map((campaign, idx) => {
                const maxLeads = Math.max(...leadsByCampaign.map(c => c.leads));
                const percentage = (campaign.leads / maxLeads) * 100;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[150px]">{campaign.campaign}</span>
                      <span className="font-bold">{campaign.leads}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: campaign.color
                        }}
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
                { label: 'Ad Impressions', value: 89000, icon: TrendingUp, color: 'bg-blue-500' },
                { label: 'Ad Clicks', value: 4440, icon: Target, color: 'bg-violet-500' },
                { label: 'WhatsApp Opened', value: 3996, icon: MessageSquare, color: 'bg-emerald-500' },
                { label: 'Chat Started', value: 3552, icon: Users, color: 'bg-amber-500' },
                { label: 'Converted', value: 1243, icon: DollarSign, color: 'bg-primary' },
              ].map((step, idx, arr) => (
                <div key={idx} className="flex-1 relative">
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xl font-bold">{step.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.label}</p>
                    {idx > 0 && (
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

        {/* Time-based Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">8 sec</p>
                  <p className="text-sm text-muted-foreground">Click to Chat Open</p>
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
                  <p className="text-3xl font-bold">45 sec</p>
                  <p className="text-sm text-muted-foreground">First Message Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">2.4 min</p>
                  <p className="text-sm text-muted-foreground">First Agent Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
