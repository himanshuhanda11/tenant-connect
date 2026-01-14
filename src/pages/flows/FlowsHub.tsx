import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  Upload, 
  Sparkles, 
  LayoutGrid, 
  List, 
  Filter,
  ChevronDown,
  Play,
  Pause,
  MoreVertical,
  Copy,
  Download,
  Archive,
  BarChart3,
  FolderOpen,
  Clock,
  Users,
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Phone,
  Building2,
  Crown,
  Target,
  Calendar,
  ShoppingCart,
  Headphones,
  Star,
  Workflow,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for flows
const mockFlows = [
  {
    id: '1',
    name: 'Welcome Message',
    emoji: '👋',
    status: 'active',
    triggers: ['keyword', 'qr'],
    health: 'green',
    lastTriggered: '2 hours ago',
    completionRate: 94,
    owner: 'John Doe',
    lastEdited: '1 day ago',
    folder: 'Onboarding',
  },
  {
    id: '2',
    name: 'Lead Qualification',
    emoji: '🎯',
    status: 'active',
    triggers: ['keyword', 'api'],
    health: 'amber',
    lastTriggered: '30 min ago',
    completionRate: 78,
    owner: 'Jane Smith',
    lastEdited: '3 hours ago',
    folder: 'Sales',
  },
  {
    id: '3',
    name: 'Appointment Booking',
    emoji: '📅',
    status: 'inactive',
    triggers: ['keyword'],
    health: 'green',
    lastTriggered: '5 days ago',
    completionRate: 89,
    owner: 'Mike Wilson',
    lastEdited: '1 week ago',
    folder: 'Support',
  },
  {
    id: '4',
    name: 'After Hours Reply',
    emoji: '🌙',
    status: 'active',
    triggers: ['default'],
    health: 'red',
    lastTriggered: '1 hour ago',
    completionRate: 45,
    owner: 'John Doe',
    lastEdited: '2 days ago',
    folder: 'Support',
  },
];

const mockTemplates = [
  {
    id: 't1',
    title: 'E-commerce Order Status',
    category: 'E-commerce',
    goal: 'Support',
    uplift: '+35% CSAT',
    tags: ['order', 'tracking', 'support'],
  },
  {
    id: 't2',
    title: 'Real Estate Lead Capture',
    category: 'Real Estate',
    goal: 'Sales',
    uplift: '+50% conversion',
    tags: ['leads', 'property', 'sales'],
  },
  {
    id: 't3',
    title: 'Clinic Appointment Reminder',
    category: 'Healthcare',
    goal: 'Operations',
    uplift: '-40% no-shows',
    tags: ['appointments', 'reminders'],
  },
  {
    id: 't4',
    title: 'Education Course Enrollment',
    category: 'Education',
    goal: 'Growth',
    uplift: '+25% enrollments',
    tags: ['courses', 'enrollment'],
  },
];

const quickCreateOptions = [
  { label: 'Lead Qualification', icon: Target, description: 'Qualify and score incoming leads' },
  { label: 'Appointment Booking', icon: Calendar, description: 'Let customers book appointments' },
  { label: 'Support Triage', icon: Headphones, description: 'Route support requests smartly' },
  { label: 'Abandoned Cart', icon: ShoppingCart, description: 'Recover abandoned checkouts' },
  { label: 'Feedback NPS', icon: Star, description: 'Collect customer feedback' },
];

const FlowsHub = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'bg-green-500';
      case 'amber': return 'bg-amber-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'green': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'amber': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'red': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTriggerBadge = (trigger: string) => {
    const config: Record<string, { label: string; className: string }> = {
      keyword: { label: 'Keyword', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      qr: { label: 'QR', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
      api: { label: 'API', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
      ad: { label: 'Ad', className: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
      webhook: { label: 'Webhook', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      default: { label: 'Default', className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    };
    const c = config[trigger] || config.default;
    return (
      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', c.className)}>
        {c.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Flows</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Build and manage automated conversation flows
            </p>
          </div>
          
          {/* Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="workspace1">
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workspace1">Main Workspace</SelectItem>
                <SelectItem value="workspace2">Test Workspace</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="phone1">
              <SelectTrigger className="w-[180px]">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Phone Number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone1">+1 555 123 4567</SelectItem>
                <SelectItem value="phone2">+91 98765 43210</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Live
            </Badge>
          </div>
        </div>

        {/* CTAs Row */}
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Flow
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuItem onClick={() => navigate('/flows/builder')}>
                <Plus className="w-4 h-4 mr-2" />
                Blank Flow
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Quick Create
              </div>
              {quickCreateOptions.map((opt) => (
                <DropdownMenuItem key={opt.label} onClick={() => navigate('/flows/builder')}>
                  <opt.icon className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Explore Templates
          </Button>
          
          <Button variant="outline" className="gap-2 ml-auto">
            <Crown className="w-4 h-4 text-amber-500" />
            Upgrade for Pro
          </Button>
        </div>

        {/* Usage Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Flows Used</p>
                  <p className="text-2xl font-bold">4 / 10</p>
                </div>
                <Workflow className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Flows</p>
                  <p className="text-2xl font-bold text-green-600">3</p>
                </div>
                <Play className="w-8 h-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Triggered Today</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Errors (24h)</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Completion</p>
                  <p className="text-2xl font-bold text-blue-600">76%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search flows, tags, triggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
                <SelectItem value="qr">QR Code</SelectItem>
                <SelectItem value="ad">Ad Click</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="your-flows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="your-flows">Your Flows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="your-flows" className="space-y-4">
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockFlows.map((flow) => (
                  <Card 
                    key={flow.id} 
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/flows/builder/${flow.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                            {flow.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{flow.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {flow.triggers.map((t) => getTriggerBadge(t))}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Play className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                            <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Export</DropdownMenuItem>
                            <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Assign Owner</DropdownMenuItem>
                            <DropdownMenuItem><FolderOpen className="w-4 h-4 mr-2" /> Add to Folder</DropdownMenuItem>
                            <DropdownMenuItem><BarChart3 className="w-4 h-4 mr-2" /> View Analytics</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive"><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getHealthIcon(flow.health)}
                          <span className="text-sm text-muted-foreground">
                            {flow.health === 'green' ? 'Healthy' : flow.health === 'amber' ? 'Warning' : 'Issues'}
                          </span>
                        </div>
                        <Badge 
                          variant={flow.status === 'active' ? 'default' : 'secondary'}
                          className={flow.status === 'active' ? 'bg-green-500' : ''}
                        >
                          {flow.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Last triggered</p>
                          <p className="font-medium">{flow.lastTriggered}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Completion</p>
                          <p className="font-medium">{flow.completionRate}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <span>{flow.owner}</span>
                        <span>Edited {flow.lastEdited}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="divide-y">
                  {mockFlows.map((flow) => (
                    <div 
                      key={flow.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/flows/builder/${flow.id}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                        {flow.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{flow.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {flow.triggers.map((t) => getTriggerBadge(t))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getHealthIcon(flow.health)}
                      </div>
                      <Badge 
                        variant={flow.status === 'active' ? 'default' : 'secondary'}
                        className={flow.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {flow.status}
                      </Badge>
                      <div className="text-sm text-right">
                        <p className="font-medium">{flow.completionRate}%</p>
                        <p className="text-xs text-muted-foreground">completion</p>
                      </div>
                      <div className="text-sm text-right text-muted-foreground">
                        <p>{flow.lastTriggered}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Export</DropdownMenuItem>
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'E-commerce', 'Real Estate', 'Education', 'Healthcare', 'IT', 'Recruitment', 'Travel'].map((cat) => (
                <Button key={cat} variant="outline" size="sm" className={cat === 'All' ? 'bg-primary text-primary-foreground' : ''}>
                  {cat}
                </Button>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0">{template.goal}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{template.title}</h3>
                    <p className="text-sm text-green-600 font-medium mb-3">{template.uplift}</p>
                    <div className="flex gap-1 flex-wrap mb-4">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Flow Library Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Save and organize your flows in folders. Share flows across workspaces and teams.
              </p>
              <Button variant="outline" className="mt-4">
                <Crown className="w-4 h-4 mr-2" />
                Available in Pro Plan
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FlowsHub;
