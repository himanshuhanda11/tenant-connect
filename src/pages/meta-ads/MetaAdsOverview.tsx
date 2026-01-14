import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { MOCK_META_ADS_OVERVIEW, MOCK_LEADS_BY_DAY } from '@/types/metaAds';
import { formatDistanceToNow } from 'date-fns';

export default function MetaAdsOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const data = MOCK_META_ADS_OVERVIEW;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Meta Ads</h1>
              <p className="text-muted-foreground">
                Click-to-WhatsApp ad performance & lead tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
            <Button asChild className="gap-2 shadow-lg shadow-primary/25">
              <Link to="/meta-ads/setup">
                <Settings className="h-4 w-4" />
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
            SMEKSH only reads ad performance and lead attribution data. Ads are fully created and billed via Meta Ads Manager.
          </AlertDescription>
        </Alert>

        {/* Connection Status */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{data.accountName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Connected • Last synced {formatDistanceToNow(new Date(data.lastSyncedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Open Ads Manager
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <div className="text-3xl font-bold">{data.activeAdsCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Active Ads</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-center text-emerald-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  +12%
                </div>
              </div>
              <div className="text-3xl font-bold">{data.leadsToday}</div>
              <p className="text-sm text-muted-foreground mt-1">Leads Today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <Target className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex items-center text-emerald-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  +5%
                </div>
              </div>
              <div className="text-3xl font-bold">{data.leadsThisMonth}</div>
              <p className="text-sm text-muted-foreground mt-1">Leads This Month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex items-center text-rose-600 text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3" />
                  -8%
                </div>
              </div>
              <div className="text-3xl font-bold">${data.costPerLead.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Cost per Lead</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{data.conversionRate}%</p>
                </div>
              </div>
              <Progress value={data.conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Ad Click → WhatsApp Chat
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">2.4 min</p>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-medium">
                ✓ Within SLA target
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold">${data.totalSpend.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This month • Billed by Meta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <Link to="/meta-ads/analytics" className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Detailed lead & campaign insights</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <Link to="/meta-ads/automations" className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Setup Automations</h3>
                  <p className="text-sm text-muted-foreground">Auto-respond to ad leads</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <Link to="/meta-ads/ads" className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">View Ads</h3>
                  <p className="text-sm text-muted-foreground">See all Click-to-WhatsApp ads</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads Preview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Leads This Week
                </CardTitle>
                <CardDescription>Daily lead generation from Meta Ads</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/meta-ads/analytics">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_LEADS_BY_DAY.map((day, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">{day.date}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-end pr-3"
                        style={{ width: `${(day.leads / 60) * 100}%` }}
                      >
                        <span className="text-xs font-medium text-primary-foreground">
                          {day.leads}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm text-muted-foreground">
                    ${day.spend.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
