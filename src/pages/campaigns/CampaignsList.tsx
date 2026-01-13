import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Send, 
  Calendar,
  Users,
  Eye,
  Copy,
  Pause,
  Play,
  XCircle,
  Download,
  LayoutGrid,
  List,
  Megaphone,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Upload,
  Sparkles,
  Zap
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Campaign, 
  MOCK_CAMPAIGNS, 
  CAMPAIGN_STATUS_CONFIG,
  CampaignStatus 
} from '@/types/campaign';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CampaignsList() {
  const navigate = useNavigate();
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'sending').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalSent: campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0),
    totalDelivered: campaigns.reduce((acc, c) => acc + (c.delivered_count || 0), 0),
    avgReadRate: campaigns.length > 0 
      ? Math.round((campaigns.reduce((acc, c) => {
          const rate = c.delivered_count ? ((c.read_count || 0) / c.delivered_count) * 100 : 0;
          return acc + rate;
        }, 0) / campaigns.filter(c => c.delivered_count).length) || 0)
      : 0,
  };

  const getProgressPercentage = (campaign: Campaign) => {
    const total = campaign.total_recipients || 0;
    const processed = (campaign.sent_count || 0) + (campaign.failed_count || 0) + (campaign.skipped_count || 0);
    return total > 0 ? Math.round((processed / total) * 100) : 0;
  };

  const renderStatusBadge = (status: CampaignStatus) => {
    const config = CAMPAIGN_STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
        {status === 'sending' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        {status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
        {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  const renderKPIs = (campaign: Campaign) => {
    if (!campaign.sent_count) return <span className="text-muted-foreground">—</span>;
    
    const deliveryRate = campaign.sent_count ? Math.round(((campaign.delivered_count || 0) / campaign.sent_count) * 100) : 0;
    const readRate = campaign.delivered_count ? Math.round(((campaign.read_count || 0) / campaign.delivered_count) * 100) : 0;
    const replyRate = campaign.read_count ? Math.round(((campaign.replied_count || 0) / campaign.read_count) * 100) : 0;

    return (
      <div className="flex gap-3 text-xs">
        <span className="text-green-600">{deliveryRate}% delivered</span>
        <span className="text-blue-600">{readRate}% read</span>
        <span className="text-purple-600">{replyRate}% replied</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              Campaigns
            </h1>
            <p className="text-muted-foreground">
              Create and manage WhatsApp broadcast campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/campaigns/library')}>
              <FileText className="h-4 w-4 mr-2" />
              Library
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Audience
            </Button>
            <Button onClick={() => navigate('/campaigns/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Messages Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgReadRate}%</p>
                  <p className="text-xs text-muted-foreground">Avg. Read Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
                <TabsList>
                  <TabsTrigger value="table">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="cards">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        {viewMode === 'table' ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium">No campaigns found</p>
                        <p className="text-sm text-muted-foreground">Create your first campaign to start engaging with contacts</p>
                        <Button className="mt-4" onClick={() => navigate('/campaigns/create')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Campaign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{campaign.name}</p>
                              {campaign.is_ab_test && (
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  A/B Test
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{campaign.template_name}</span>
                              <span>•</span>
                              <span>{campaign.phone_display}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {renderStatusBadge(campaign.status)}
                            {campaign.status === 'sending' && (
                              <div className="w-24">
                                <Progress value={getProgressPercentage(campaign)} className="h-1" />
                                <span className="text-xs text-muted-foreground">{getProgressPercentage(campaign)}%</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{(campaign.total_recipients || 0).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{renderKPIs(campaign)}</TableCell>
                        <TableCell>
                          {campaign.scheduled_at ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {format(new Date(campaign.scheduled_at), 'MMM d, yyyy')}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(campaign.scheduled_at), 'h:mm a')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {campaign.status === 'sending' && (
                                <DropdownMenuItem className="text-amber-600">
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'paused' && (
                                <DropdownMenuItem className="text-green-600">
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              )}
                              {['sending', 'scheduled'].includes(campaign.status) && (
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card 
                key={campaign.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {campaign.name}
                        {campaign.is_ab_test && <Sparkles className="h-4 w-4 text-primary" />}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{campaign.template_name}</p>
                    </div>
                    {renderStatusBadge(campaign.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Audience</span>
                      <span className="font-medium">{(campaign.total_recipients || 0).toLocaleString()}</span>
                    </div>
                    
                    {campaign.status === 'sending' && (
                      <div className="space-y-1">
                        <Progress value={getProgressPercentage(campaign)} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">{getProgressPercentage(campaign)}% complete</p>
                      </div>
                    )}

                    {campaign.sent_count && campaign.sent_count > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                        <div>
                          <p className="text-lg font-semibold text-green-600">
                            {Math.round(((campaign.delivered_count || 0) / campaign.sent_count) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-blue-600">
                            {Math.round(((campaign.read_count || 0) / (campaign.delivered_count || 1)) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Read</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-purple-600">
                            {Math.round(((campaign.replied_count || 0) / (campaign.read_count || 1)) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Replied</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>
                        {campaign.scheduled_at 
                          ? format(new Date(campaign.scheduled_at), 'MMM d, h:mm a')
                          : 'No schedule'}
                      </span>
                      <span>{campaign.phone_display}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}