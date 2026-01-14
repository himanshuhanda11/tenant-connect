import { Contact } from '@/types/contact';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Globe, 
  Clock, 
  Calendar,
  MessageSquare,
  TrendingUp,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Star,
  Shield,
  Bot,
  UserCheck
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UnifiedProfileCardProps {
  contact: Contact;
  onOpenChat?: () => void;
}

export function UnifiedProfileCard({ contact, onOpenChat }: UnifiedProfileCardProps) {
  const getInitials = (name?: string | null, waId?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const statCards = [
    {
      label: 'First Contact',
      value: contact.first_message_time 
        ? formatDistanceToNow(new Date(contact.first_message_time), { addSuffix: true })
        : 'Never',
      icon: Calendar,
    },
    {
      label: 'Last Active',
      value: contact.last_seen 
        ? formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })
        : 'Never',
      icon: Clock,
    },
    {
      label: 'Source',
      value: contact.source || 'Unknown',
      icon: TrendingUp,
    },
    {
      label: 'Language',
      value: contact.language?.toUpperCase() || 'N/A',
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={contact.profile_picture_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-semibold">
              {getInitials(contact.name, contact.wa_id)}
            </AvatarFallback>
          </Avatar>
          {/* Online/MAU Status Indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background",
            contact.mau_status === 'active' ? 'bg-emerald-500' :
            contact.mau_status === 'inactive' ? 'bg-amber-500' : 'bg-slate-400'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold truncate">
                {contact.name || contact.first_name || 'Unknown Contact'}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+{contact.wa_id}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(contact.wa_id, 'Phone number')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpenChat}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {contact.priority_level === 'high' || contact.priority_level === 'urgent' ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 gap-1">
                <Star className="h-3 w-3" />
                VIP
              </Badge>
            ) : null}
            {contact.opt_in_status && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 gap-1">
                <Shield className="h-3 w-3" />
                Opted In
              </Badge>
            )}
            {contact.bot_handled && !contact.intervened && (
              <Badge variant="secondary" className="bg-violet-100 text-violet-700 gap-1">
                <Bot className="h-3 w-3" />
                Bot Active
              </Badge>
            )}
            {contact.intervened && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 gap-1">
                <UserCheck className="h-3 w-3" />
                Human Mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat) => (
          <div 
            key={stat.label}
            className="p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <stat.icon className="h-3.5 w-3.5" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <span className="text-sm font-medium">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Attribution */}
      {(contact.campaign_source || contact.entry_point) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Attribution
            </h4>
            <div className="flex flex-wrap gap-2">
              {contact.campaign_source && (
                <Badge variant="outline" className="text-xs">
                  Campaign: {contact.campaign_source}
                </Badge>
              )}
              {contact.entry_point && (
                <Badge variant="outline" className="text-xs">
                  Entry: {contact.entry_point}
                </Badge>
              )}
              {contact.referrer_url && (
                <Badge variant="outline" className="text-xs">
                  Referrer: {new URL(contact.referrer_url).hostname}
                </Badge>
              )}
            </div>
          </div>
        </>
      )}

      {/* Assigned Agent */}
      {contact.assigned_agent && (
        <>
          <Separator />
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {(contact.assigned_agent.full_name || contact.assigned_agent.email)
                  .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">Assigned Agent</div>
              <div className="text-sm font-medium truncate">
                {contact.assigned_agent.full_name || contact.assigned_agent.email}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
