import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlows, useFlowTemplates } from '@/hooks/useFlows';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';

const quickCreateOptions = [
  { label: 'Lead Qualification', icon: Target, description: 'Qualify and score incoming leads', emoji: '🎯' },
  { label: 'Appointment Booking', icon: Calendar, description: 'Let customers book appointments', emoji: '📅' },
  { label: 'Support Triage', icon: Headphones, description: 'Route support requests smartly', emoji: '🎧' },
  { label: 'Abandoned Cart', icon: ShoppingCart, description: 'Recover abandoned checkouts', emoji: '🛒' },
  { label: 'Feedback NPS', icon: Star, description: 'Collect customer feedback', emoji: '⭐' },
];

const categoryFilters = ['All', 'E-commerce', 'Real Estate', 'Healthcare', 'Education', 'IT', 'Recruitment', 'Travel'];

const FlowsHub = () => {
  const navigate = useNavigate();
  const { flows, loading, createFlow, deleteFlow, duplicateFlow, toggleFlowStatus } = useFlows();
  const { templates, loading: templatesLoading } = useFlowTemplates();
  const { phoneNumbers } = usePhoneNumbers();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowEmoji, setNewFlowEmoji] = useState('🔄');

  // Stats
  const activeFlows = flows.filter(f => f.status === 'active').length;
  const totalTriggeredToday = flows.reduce((acc, f) => acc + (f.sessions_today || 0), 0);
  const avgCompletion = flows.length > 0 
    ? Math.round(flows.reduce((acc, f) => acc + (f.completion_rate || 0), 0) / flows.length)
    : 0;
  const errorFlows = flows.filter(f => f.health_score < 50).length;

  const filteredFlows = flows.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = templates.filter(t => 
    selectedCategory === 'All' || t.category === selectedCategory
  );

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;
    
    const flow = await createFlow({ name: newFlowName, emoji: newFlowEmoji });
    if (flow) {
      setCreateDialogOpen(false);
      setNewFlowName('');
      navigate(`/flows/builder/${flow.id}`);
    }
  };

  const handleQuickCreate = async (option: typeof quickCreateOptions[0]) => {
    const flow = await createFlow({ 
      name: option.label, 
      emoji: option.emoji,
      description: option.description 
    });
    if (flow) {
      navigate(`/flows/builder/${flow.id}`);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10';
    if (score >= 50) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  const getTriggerBadge = (trigger: string) => {
    const config: Record<string, { label: string; className: string }> = {
      keyword: { label: 'Keyword', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      regex: { label: 'Regex', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
      qr: { label: 'QR', className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
      meta_ad: { label: 'Meta Ad', className: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
      api: { label: 'API', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
      manual: { label: 'Manual', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
      fallback: { label: 'Fallback', className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    };
    const c = config[trigger] || config.fallback;
    return (
      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', c.className)}>
        {c.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Flows
            </h1>
            <p className="text-muted-foreground mt-1">
              Build interactive conversation flows with our visual builder
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px] bg-card">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Numbers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Numbers</SelectItem>
                {phoneNumbers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.phone_e164 || p.display_name || p.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Live
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  Create Flow
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="py-3">
                  <Plus className="w-4 h-4 mr-3" />
                  <div>
                    <p className="font-medium">Blank Flow</p>
                    <p className="text-xs text-muted-foreground">Start from scratch</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Quick Create
                </div>
                {quickCreateOptions.map((opt) => (
                  <DropdownMenuItem 
                    key={opt.label} 
                    onClick={() => handleQuickCreate(opt)}
                    className="py-3"
                  >
                    <span className="text-xl mr-3">{opt.emoji}</span>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Flow</DialogTitle>
                <DialogDescription>
                  Give your flow a name and optional emoji to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-3">
                  <div className="space-y-2">
                    <Label>Emoji</Label>
                    <Select value={newFlowEmoji} onValueChange={setNewFlowEmoji}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['🔄', '👋', '🎯', '📅', '🛒', '⭐', '🎧', '📧', '💬', '🚀'].map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Flow Name</Label>
                    <Input 
                      placeholder="e.g., Welcome Message" 
                      value={newFlowName}
                      onChange={(e) => setNewFlowName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFlow()}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateFlow} disabled={!newFlowName.trim()}>
                  Create Flow
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          
          <Button variant="outline" className="gap-2 ml-auto border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Flows</p>
                  <p className="text-2xl font-bold mt-1">{flows.length} <span className="text-sm text-muted-foreground font-normal">/ 10</span></p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/5 to-card border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{activeFlows}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Triggered Today</p>
                  <p className="text-2xl font-bold mt-1">{totalTriggeredToday}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn(errorFlows > 0 && 'bg-gradient-to-br from-red-500/5 to-card border-red-500/20')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Issues</p>
                  <p className={cn('text-2xl font-bold mt-1', errorFlows > 0 ? 'text-red-600' : 'text-green-600')}>
                    {errorFlows}
                  </p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', 
                  errorFlows > 0 ? 'bg-red-500/10' : 'bg-green-500/10')}>
                  {errorFlows > 0 
                    ? <AlertTriangle className="w-5 h-5 text-red-500" />
                    : <CheckCircle2 className="w-5 h-5 text-green-500" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Avg Completion</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{avgCompletion}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search flows by name, tag, or trigger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
            
            <div className="flex border rounded-lg overflow-hidden bg-card">
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
        <Tabs defaultValue="your-flows" className="space-y-6">
          <TabsList className="bg-card border">
            <TabsTrigger value="your-flows" className="gap-2">
              <Workflow className="w-4 h-4" />
              Your Flows
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="your-flows" className="space-y-4">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFlows.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Workflow className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No flows yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Create your first conversation flow to automate customer interactions on WhatsApp.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Flow
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFlows.map((flow) => (
                  <Card 
                    key={flow.id} 
                    className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30"
                    onClick={() => navigate(`/flows/builder/${flow.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl shadow-sm">
                            {flow.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {flow.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              {flow.triggers?.slice(0, 2).map((t, i) => (
                                <span key={i}>{getTriggerBadge(t.trigger_type)}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/flows/builder/${flow.id}`); }}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateFlow(flow.id); }}>
                              <Copy className="w-4 h-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" /> Export JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteFlow(flow.id); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn('flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium', getHealthBg(flow.health_score))}>
                          {flow.health_score >= 80 ? (
                            <CheckCircle2 className={cn('w-3.5 h-3.5', getHealthColor(flow.health_score))} />
                          ) : flow.health_score >= 50 ? (
                            <AlertTriangle className={cn('w-3.5 h-3.5', getHealthColor(flow.health_score))} />
                          ) : (
                            <XCircle className={cn('w-3.5 h-3.5', getHealthColor(flow.health_score))} />
                          )}
                          <span className={getHealthColor(flow.health_score)}>
                            {flow.health_score >= 80 ? 'Healthy' : flow.health_score >= 50 ? 'Warning' : 'Issues'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Switch 
                            checked={flow.status === 'active'}
                            onCheckedChange={(checked) => toggleFlowStatus(flow.id, checked ? 'active' : 'inactive')}
                          />
                          <span className={cn('text-xs font-medium', flow.status === 'active' ? 'text-green-600' : 'text-muted-foreground')}>
                            {flow.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Sessions today</p>
                          <p className="font-semibold">{flow.sessions_today}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Completion</p>
                          <p className="font-semibold">{flow.completion_rate}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {new Date(flow.updated_at).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="divide-y">
                  {filteredFlows.map((flow) => (
                    <div 
                      key={flow.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/flows/builder/${flow.id}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                        {flow.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{flow.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {flow.triggers?.slice(0, 2).map((t, i) => (
                            <span key={i}>{getTriggerBadge(t.trigger_type)}</span>
                          ))}
                        </div>
                      </div>
                      <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs', getHealthBg(flow.health_score))}>
                        {flow.health_score >= 80 ? (
                          <CheckCircle2 className={cn('w-4 h-4', getHealthColor(flow.health_score))} />
                        ) : (
                          <AlertTriangle className={cn('w-4 h-4', getHealthColor(flow.health_score))} />
                        )}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch 
                          checked={flow.status === 'active'}
                          onCheckedChange={(checked) => toggleFlowStatus(flow.id, checked ? 'active' : 'inactive')}
                        />
                      </div>
                      <div className="text-sm text-right w-20">
                        <p className="font-medium">{flow.completion_rate}%</p>
                        <p className="text-xs text-muted-foreground">completion</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateFlow(flow.id)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Export</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteFlow(flow.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map((cat) => (
                <Button 
                  key={cat} 
                  variant={selectedCategory === cat ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'shadow-lg shadow-primary/20' : ''}
                >
                  {cat}
                </Button>
              ))}
            </div>
            
            {templatesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/30">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="bg-muted/50">{template.category}</Badge>
                        {template.goal && (
                          <Badge className="bg-primary/10 text-primary border-0">{template.goal}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{template.title}</h3>
                      {template.subtitle && (
                        <p className="text-sm text-muted-foreground mb-3">{template.subtitle}</p>
                      )}
                      {template.expected_uplift && (
                        <p className="text-sm text-green-600 font-medium mb-3">{template.expected_uplift}</p>
                      )}
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FlowsHub;
