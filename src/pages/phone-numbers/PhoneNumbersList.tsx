import { useState } from 'react';
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
  List
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { 
  PhoneNumber, 
  STATUS_CONFIG, 
  QUALITY_CONFIG, 
  LIMIT_CONFIG, 
  WEBHOOK_HEALTH_CONFIG 
} from '@/types/phoneNumber';
import { cn } from '@/lib/utils';

export default function PhoneNumbersList() {
  const navigate = useNavigate();
  const { phoneNumbers, loading, setDefaultNumber, disconnectNumber } = usePhoneNumbers();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredNumbers = phoneNumbers.filter(n => 
    n.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    n.phone_e164.includes(search) ||
    n.phone_number_id.includes(search)
  );

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
        navigate(`/phone-numbers/${number.id}/settings`);
        break;
      case 'disconnect':
        disconnectNumber(number.id);
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Phone Numbers</h1>
            <p className="text-muted-foreground">Manage your WhatsApp Business phone numbers</p>
          </div>
          <Button onClick={() => navigate('/phone-numbers/connect')}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Number
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{phoneNumbers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Numbers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {phoneNumbers.filter(n => n.status === 'connected').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {phoneNumbers.filter(n => n.quality_rating === 'green').length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {phoneNumbers.filter(n => n.webhook_health === 'healthy').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Healthy Webhooks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search numbers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-lg p-1">
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

        {/* Numbers List */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNumbers.map((number) => (
              <Card 
                key={number.id} 
                className={cn(
                  "cursor-pointer hover:border-primary/50 transition-colors",
                  number.is_default && "border-primary"
                )}
                onClick={() => navigate(`/phone-numbers/${number.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {number.display_name || 'Unnamed'}
                        </CardTitle>
                        {number.is_default && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {number.phone_e164}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('view', number); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('set-default', number); }}>
                          {number.is_default ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Remove Default
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('settings', number); }}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleAction('disconnect', number); }}
                          className="text-red-600"
                        >
                          <Unplug className="h-4 w-4 mr-2" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status & Quality */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline"
                      className={cn(
                        STATUS_CONFIG[number.status].bgColor,
                        STATUS_CONFIG[number.status].color,
                        "border-0"
                      )}
                    >
                      {getStatusIcon(number.status)}
                      <span className="ml-1">{STATUS_CONFIG[number.status].label}</span>
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={cn(
                        QUALITY_CONFIG[number.quality_rating].bgColor,
                        QUALITY_CONFIG[number.quality_rating].color,
                        "border-0"
                      )}
                    >
                      Quality: {QUALITY_CONFIG[number.quality_rating].label}
                    </Badge>
                  </div>

                  {/* Limit & Webhook */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Limit</span>
                    <span className="font-medium">{LIMIT_CONFIG[number.messaging_limit].label}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Webhook</span>
                    <Badge 
                      variant="outline"
                      className={cn(
                        WEBHOOK_HEALTH_CONFIG[number.webhook_health].bgColor,
                        WEBHOOK_HEALTH_CONFIG[number.webhook_health].color,
                        "border-0 text-xs"
                      )}
                    >
                      {WEBHOOK_HEALTH_CONFIG[number.webhook_health].label}
                    </Badge>
                  </div>

                  {/* WABA Info */}
                  {number.waba && (
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <p>WABA: {number.waba.name || number.waba_id}</p>
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
                  <CardContent className="py-12 text-center">
                    <Phone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No phone numbers</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your first WhatsApp Business number to get started
                    </p>
                    <Button onClick={() => navigate('/phone-numbers/connect')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Number
                    </Button>
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
                          STATUS_CONFIG[number.status].bgColor,
                          STATUS_CONFIG[number.status].color,
                          "border-0"
                        )}
                      >
                        {STATUS_CONFIG[number.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          QUALITY_CONFIG[number.quality_rating].bgColor,
                          QUALITY_CONFIG[number.quality_rating].color,
                          "border-0"
                        )}
                      >
                        {QUALITY_CONFIG[number.quality_rating].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{LIMIT_CONFIG[number.messaging_limit].label}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {number.waba?.name || number.waba_id || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health].bgColor,
                          WEBHOOK_HEALTH_CONFIG[number.webhook_health].color,
                          "border-0 text-xs"
                        )}
                      >
                        {WEBHOOK_HEALTH_CONFIG[number.webhook_health].label}
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
                          <DropdownMenuItem onClick={() => handleAction('set-default', number)}>
                            <Star className="h-4 w-4 mr-2" />
                            {number.is_default ? 'Remove Default' : 'Set as Default'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleAction('disconnect', number)}
                            className="text-red-600"
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
