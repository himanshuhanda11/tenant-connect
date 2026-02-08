import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Phone, 
  MoreVertical, 
  Star, 
  StarOff,
  Settings,
  Unplug,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Ban,
  Zap,
  Activity,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
  Send,
  X,
  Link2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { 
  PhoneNumber, 
  NumberStatus,
  QualityRating,
  LimitTier,
  WebhookHealth,
  STATUS_CONFIG, 
  QUALITY_CONFIG, 
  LIMIT_CONFIG, 
  WEBHOOK_HEALTH_CONFIG 
} from '@/types/phoneNumber';
import { cn } from '@/lib/utils';

interface Filters {
  status: NumberStatus | 'all';
  quality: QualityRating | 'all';
  limit: LimitTier | 'all';
  webhookHealth: WebhookHealth | 'all';
  isDefault: 'all' | 'yes' | 'no';
}

export default function PhoneNumbersList() {
  const navigate = useNavigate();
  const { phoneNumbers, loading, setDefaultNumber, disconnectNumber, refetch } = usePhoneNumbers();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    quality: 'all',
    limit: 'all',
    webhookHealth: 'all',
    isDefault: 'all',
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.quality !== 'all') count++;
    if (filters.limit !== 'all') count++;
    if (filters.webhookHealth !== 'all') count++;
    if (filters.isDefault !== 'all') count++;
    return count;
  }, [filters]);

  const filteredNumbers = useMemo(() => {
    return phoneNumbers.filter(n => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || 
        n.display_name?.toLowerCase().includes(searchLower) ||
        n.phone_e164.includes(search) ||
        n.phone_number_id.includes(search) ||
        n.waba_id?.includes(search);

      // Status filter
      const matchesStatus = filters.status === 'all' || n.status === filters.status;
      
      // Quality filter
      const matchesQuality = filters.quality === 'all' || n.quality_rating === filters.quality;
      
      // Limit filter
      const matchesLimit = filters.limit === 'all' || n.messaging_limit === filters.limit;
      
      // Webhook health filter
      const matchesWebhook = filters.webhookHealth === 'all' || n.webhook_health === filters.webhookHealth;
      
      // Default filter
      const matchesDefault = filters.isDefault === 'all' || 
        (filters.isDefault === 'yes' ? n.is_default : !n.is_default);

      return matchesSearch && matchesStatus && matchesQuality && matchesLimit && matchesWebhook && matchesDefault;
    });
  }, [phoneNumbers, search, filters]);

  const clearFilters = () => {
    setFilters({
      status: 'all',
      quality: 'all',
      limit: 'all',
      webhookHealth: 'all',
      isDefault: 'all',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verification_required': return <Shield className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'disabled': return <Ban className="h-4 w-4" />;
      default: return <Unplug className="h-4 w-4" />;
    }
  };

  const handleAction = (action: string, number: PhoneNumber) => {
    switch (action) {
      case 'view':
        navigate(`/phone-numbers/${number.id}`);
        break;
      case 'set-default':
        setDefaultNumber(number.id);
        break;
      case 'settings':
        navigate(`/phone-numbers/${number.id}?tab=settings`);
        break;
      case 'test':
        navigate(`/phone-numbers/${number.id}?tab=diagnostics`);
        break;
      case 'reconnect':
        navigate('/phone-numbers/connect');
        break;
      case 'disconnect':
        disconnectNumber(number.id);
        break;
    }
  };

  // Stats
  const stats = {
    total: phoneNumbers.length,
    connected: phoneNumbers.filter(n => n.status === 'connected').length,
    highQuality: phoneNumbers.filter(n => n.quality_rating === 'green').length,
    healthyWebhooks: phoneNumbers.filter(n => n.webhook_health === 'healthy').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Phone Numbers</h1>
            <p className="text-muted-foreground">Manage your WhatsApp Business phone numbers and routing</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate('/phone-numbers/connect')} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect Number
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Numbers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.connected}</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.highQuality}</p>
                  <p className="text-sm text-muted-foreground">High Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.healthyWebhooks}</p>
                  <p className="text-sm text-muted-foreground">Healthy Webhooks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, WABA ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <div className="min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verification_required">Verification Required</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quality Rating</label>
                  <Select value={filters.quality} onValueChange={(v) => setFilters(f => ({ ...f, quality: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="green">High (Green)</SelectItem>
                      <SelectItem value="yellow">Medium (Yellow)</SelectItem>
                      <SelectItem value="red">Low (Red)</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Messaging Limit</label>
                  <Select value={filters.limit} onValueChange={(v) => setFilters(f => ({ ...f, limit: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Limits</SelectItem>
                      <SelectItem value="tier_1k">1K/day</SelectItem>
                      <SelectItem value="tier_10k">10K/day</SelectItem>
                      <SelectItem value="tier_100k">100K/day</SelectItem>
                      <SelectItem value="tier_unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Webhook Health</label>
                  <Select value={filters.webhookHealth} onValueChange={(v) => setFilters(f => ({ ...f, webhookHealth: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                      <SelectItem value="down">Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Default</label>
                  <Select value={filters.isDefault} onValueChange={(v) => setFilters(f => ({ ...f, isDefault: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">Default Only</SelectItem>
                      <SelectItem value="no">Non-default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {activeFilterCount > 0 && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                      <X className="h-4 w-4 mr-1" />
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilters(f => ({ ...f, webhookHealth: 'down' }))}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Show Webhook Issues
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilters(f => ({ ...f, status: 'verification_required' }))}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Shield className="h-4 w-4 mr-1" />
            Needs Verification
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilters(f => ({ ...f, quality: 'red' }))}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Zap className="h-4 w-4 mr-1" />
            Low Quality Numbers
          </Button>
        </div>

        {/* Numbers List */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredNumbers.map((number) => (
              <Card 
                key={number.id} 
                className={cn(
                  "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50",
                  number.is_default && "ring-2 ring-primary/20 border-primary/50"
                )}
                onClick={() => navigate(`/phone-numbers/${number.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">
                          {number.display_name || 'Unnamed Number'}
                        </CardTitle>
                        {number.is_default && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono truncate">
                        {number.phone_e164}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('view', number); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('test', number); }}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Test Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('set-default', number); }}>
                          {number.is_default ? <StarOff className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                          {number.is_default ? 'Remove Default' : 'Set as Default'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('settings', number); }}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('reconnect', number); }}>
                          <Link2 className="h-4 w-4 mr-2" />
                          Reconnect
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleAction('disconnect', number); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Unplug className="h-4 w-4 mr-2" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status & Quality Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline"
                      className={cn(
                        STATUS_CONFIG[number.status]?.bgColor,
                        STATUS_CONFIG[number.status]?.color,
                        "border-0 font-medium"
                      )}
                    >
                      {getStatusIcon(number.status)}
                      <span className="ml-1">{STATUS_CONFIG[number.status]?.label}</span>
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={cn(
                        QUALITY_CONFIG[number.quality_rating]?.bgColor,
                        QUALITY_CONFIG[number.quality_rating]?.color,
                        "border-0"
                      )}
                    >
                      {QUALITY_CONFIG[number.quality_rating]?.label} Quality
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs mb-0.5">Limit</span>
                      <span className="font-medium">{LIMIT_CONFIG[number.messaging_limit]?.label}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs mb-0.5">Webhook</span>
                      <Badge 
                        variant="outline"
                        className={cn(
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.bgColor,
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.color,
                          "border-0 text-xs"
                        )}
                      >
                        {WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.label}
                      </Badge>
                    </div>
                  </div>

                  {/* WABA Info */}
                  {number.waba && (
                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      <span className="font-medium">WABA:</span> {number.waba.name || number.waba_id}
                    </div>
                  )}

                  {/* Last Activity */}
                  {number.last_message_at && (
                    <div className="text-xs text-muted-foreground">
                      Last message {formatDistanceToNow(new Date(number.last_message_at), { addSuffix: true })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {filteredNumbers.length === 0 && !loading && (
              <div className="col-span-full">
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Phone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {search || activeFilterCount > 0 ? 'No matching numbers' : 'No phone numbers'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      {search || activeFilterCount > 0 
                        ? 'Try adjusting your search or filters'
                        : 'Connect your first WhatsApp Business phone number to start messaging'}
                    </p>
                    {search || activeFilterCount > 0 ? (
                      <Button variant="outline" onClick={() => { setSearch(''); clearFilters(); }}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => navigate('/phone-numbers/connect')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect Number
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>WABA</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNumbers.map((number) => (
                  <TableRow 
                    key={number.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/phone-numbers/${number.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {number.is_default && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                        <div>
                          <p className="font-medium">{number.display_name || 'Unnamed'}</p>
                          <p className="text-sm text-muted-foreground font-mono">{number.phone_e164}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          STATUS_CONFIG[number.status]?.bgColor,
                          STATUS_CONFIG[number.status]?.color,
                          "border-0"
                        )}
                      >
                        {STATUS_CONFIG[number.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          QUALITY_CONFIG[number.quality_rating]?.bgColor,
                          QUALITY_CONFIG[number.quality_rating]?.color,
                          "border-0"
                        )}
                      >
                        {QUALITY_CONFIG[number.quality_rating]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{LIMIT_CONFIG[number.messaging_limit]?.label}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {number.waba?.name || number.waba_id || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.bgColor,
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.color,
                          "border-0 text-xs"
                        )}
                      >
                        {WEBHOOK_HEALTH_CONFIG[number.webhook_health]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {number.last_message_at 
                        ? formatDistanceToNow(new Date(number.last_message_at), { addSuffix: true })
                        : '-'
                      }
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction('view', number)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('test', number)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('set-default', number)}>
                            {number.is_default ? <StarOff className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                            {number.is_default ? 'Remove Default' : 'Set Default'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction('reconnect', number)}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Reconnect
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAction('disconnect', number)}
                            className="text-destructive"
                          >
                            <Unplug className="h-4 w-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
