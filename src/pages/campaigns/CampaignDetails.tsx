import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Phone,
  Play,
  RefreshCw,
  Send,
  Settings,
  Shield,
  StopCircle,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  CAMPAIGN_STATUS_CONFIG, 
  Campaign,
  CampaignStatus
} from '@/types/campaign';
import { useCampaigns } from '@/hooks/useCampaigns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MOCK_TIMELINE_DATA = [
  { time: '09:00', sent: 0, delivered: 0, read: 0 },
  { time: '09:30', sent: 450, delivered: 420, read: 180 },
  { time: '10:00', sent: 980, delivered: 920, read: 520 },
  { time: '10:30', sent: 1560, delivered: 1480, read: 980 },
  { time: '11:00', sent: 2100, delivered: 2010, read: 1450 },
  { time: '11:30', sent: 2450, delivered: 2380, read: 1850 },
];

const MOCK_ERROR_LOGS = [
  { id: 1, phone: '+971501234567', error: 'Invalid phone number format', time: '10:15 AM' },
  { id: 2, phone: '+971509876543', error: 'Recipient blocked sender', time: '10:22 AM' },
  { id: 3, phone: '+971505555555', error: 'Rate limit exceeded', time: '10:45 AM' },
];

const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find campaign from mock data
  const campaign = MOCK_CAMPAIGNS.find(c => c.id === id) || MOCK_CAMPAIGNS[0];
  
  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
  
  const getProgressPercentage = () => {
    const total = campaign.total_recipients || 0;
    const processed = (campaign.sent_count || 0) + (campaign.failed_count || 0) + (campaign.skipped_count || 0);
    return total > 0 ? Math.round((processed / total) * 100) : 0;
  };

  const deliveryRate = campaign.sent_count ? Math.round(((campaign.delivered_count || 0) / campaign.sent_count) * 100) : 0;
  const readRate = campaign.delivered_count ? Math.round(((campaign.read_count || 0) / campaign.delivered_count) * 100) : 0;
  const replyRate = campaign.read_count ? Math.round(((campaign.replied_count || 0) / campaign.read_count) * 100) : 0;
  const conversionRate = campaign.delivered_count ? Math.round(((campaign.conversion_count || 0) / campaign.delivered_count) * 100) : 0;

  const funnelData = [
    { name: 'Sent', value: campaign.sent_count || 0, color: '#10b981' },
    { name: 'Delivered', value: campaign.delivered_count || 0, color: '#3b82f6' },
    { name: 'Read', value: campaign.read_count || 0, color: '#8b5cf6' },
    { name: 'Replied', value: campaign.replied_count || 0, color: '#f59e0b' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <Badge variant="outline" className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                  {campaign.status === 'sending' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                {campaign.phone_display}
                <span>•</span>
                <MessageSquare className="h-4 w-4" />
                {campaign.template_name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {campaign.status === 'sending' && (
              <>
                <Button variant="outline" className="text-amber-600">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button variant="destructive">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Campaign
                </Button>
              </>
            )}
            {campaign.status === 'paused' && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Progress Bar (for active campaigns) */}
        {campaign.status === 'sending' && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span className="font-medium">Campaign in Progress</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {getProgressPercentage()}% complete
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{(campaign.sent_count || 0).toLocaleString()} sent</span>
                <span>{(campaign.queued_count || 0).toLocaleString()} remaining</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(campaign.total_recipients || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Audience</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deliveryRate}%</p>
                  <p className="text-xs text-muted-foreground">Delivery Rate</p>
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
                  <p className="text-2xl font-bold">{readRate}%</p>
                  <p className="text-xs text-muted-foreground">Read Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{replyRate}%</p>
                  <p className="text-xs text-muted-foreground">Reply Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.failed_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Timeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_TIMELINE_DATA}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} name="Sent" />
                        <Line type="monotone" dataKey="delivered" stroke="#3b82f6" strokeWidth={2} name="Delivered" />
                        <Line type="monotone" dataKey="read" stroke="#8b5cf6" strokeWidth={2} name="Read" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funnelData.map((item, index) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-8 bg-muted rounded-lg overflow-hidden">
                          <div 
                            className="h-full rounded-lg transition-all duration-500"
                            style={{ 
                              width: `${(item.value / (campaign.sent_count || 1)) * 100}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span>{campaign.scheduled_at ? format(new Date(campaign.scheduled_at), 'MMM d, h:mm a') : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span>{campaign.started_at ? format(new Date(campaign.started_at), 'MMM d, h:mm a') : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{campaign.completed_at ? format(new Date(campaign.completed_at), 'MMM d, h:mm a') : '—'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate Limit</span>
                    <span>30 / min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Hours</span>
                    <span>Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency Cap</span>
                    <span>1 / week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Opt-in enforced</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Opt-out respected</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Rate limited</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Breakdown</CardTitle>
                <CardDescription>Summary of recipients and exclusions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Included Segments</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm">VIP Customers</span>
                        <Badge variant="secondary">450</Badge>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm">Active Leads</span>
                        <Badge variant="secondary">2,050</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Excluded</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm">Opted-out</span>
                        <Badge variant="destructive">45</Badge>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm">Invalid phone</span>
                        <Badge variant="destructive">12</Badge>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm">Frequency capped</span>
                        <Badge variant="destructive">13</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Final Audience</h4>
                    <div className="p-6 bg-primary/10 rounded-lg text-center">
                      <p className="text-4xl font-bold text-primary">{(campaign.total_recipients || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-1">Recipients</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Error Log</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Errors
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ERROR_LOGS.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-red-600 bg-red-50">
                            {log.error}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Message Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={funnelData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Export Full Report</h4>
                    <p className="text-sm text-muted-foreground">Download detailed analytics and recipient data</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      CSV Report
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      PDF Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}