import { Contact, PRIORITY_OPTIONS, LEAD_STATUS_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  User, 
  Phone, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Bot,
  UserCheck,
  Ban,
  ChevronRight,
  MessageSquare,
  Clock,
  Sparkles,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
  selectedContactIds: string[];
  onToggleSelection: (contactId: string) => void;
  onSelectAll: () => void;
}

export function ContactsTable({
  contacts,
  loading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onSelectContact,
  selectedContactId,
  selectedContactIds,
  onToggleSelection,
  onSelectAll,
}: ContactsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const allSelected = contacts.length > 0 && contacts.every(c => selectedContactIds.includes(c.id));
  const someSelected = contacts.some(c => selectedContactIds.includes(c.id)) && !allSelected;

  const getInitials = (name?: string | null, waId?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  const getPriorityBadge = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option ? (
      <Badge variant="secondary" className={cn(option.color, "text-xs font-medium")}>
        {option.label}
      </Badge>
    ) : null;
  };

  const getLeadStatusBadge = (status: string) => {
    const option = LEAD_STATUS_OPTIONS.find(s => s.value === status);
    return option ? (
      <Badge variant="secondary" className={cn(option.color, "text-xs font-medium")}>
        {option.label}
      </Badge>
    ) : null;
  };

  const getMauStatusBadge = (status: string) => {
    const option = MAU_STATUS_OPTIONS.find(s => s.value === status);
    return option ? (
      <Badge variant="secondary" className={cn(option.color, "text-xs font-medium")}>
        {option.label}
      </Badge>
    ) : null;
  };

  const getComplianceIcons = (contact: Contact) => {
    const icons = [];
    
    if (contact.opt_in_status) {
      icons.push(
        <Tooltip key="optin">
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>Opted In</TooltipContent>
        </Tooltip>
      );
    } else if (contact.opt_out) {
      icons.push(
        <Tooltip key="optout">
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-100 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>Opted Out</TooltipContent>
        </Tooltip>
      );
    }
    
    if (contact.blocked_by_user) {
      icons.push(
        <Tooltip key="blocked">
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 text-red-600">
              <Ban className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>Blocked</TooltipContent>
        </Tooltip>
      );
    }
    
    if (contact.intervened) {
      icons.push(
        <Tooltip key="intervened">
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600">
              <UserCheck className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>Human Intervened</TooltipContent>
        </Tooltip>
      );
    } else if (contact.bot_handled) {
      icons.push(
        <Tooltip key="bot">
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 text-violet-600">
              <Bot className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>Bot Handled</TooltipContent>
        </Tooltip>
      );
    }
    
    return icons;
  };

  if (loading) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-xl bg-card animate-pulse">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 shadow-lg">
          <Inbox className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-xl mb-2">No contacts found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your filters or wait for new contacts to arrive via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className={someSelected ? "opacity-50" : ""}
                />
              </TableHead>
              <TableHead className="w-[300px]">
                <div className="flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Contact
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2 font-semibold">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Status
                </div>
              </TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  MAU
                </div>
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>
                <div className="flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Status
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Last Active
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => {
              const isSelected = selectedContactIds.includes(contact.id);
              const isActive = selectedContactId === contact.id;
              
              return (
                <TableRow
                  key={contact.id}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    isActive && 'bg-primary/5 border-l-2 border-l-primary',
                    isSelected && !isActive && 'bg-muted/50',
                    !isActive && !isSelected && 'hover:bg-muted/30'
                  )}
                  onClick={() => onSelectContact(contact)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection(contact.id)}
                      aria-label={`Select ${contact.name || contact.wa_id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                        <AvatarImage src={contact.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                          {getInitials(contact.name, contact.wa_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold truncate flex items-center gap-2">
                          {contact.name || contact.first_name || 'Unknown'}
                          {contact.assigned_agent && (
                            <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                              {contact.assigned_agent.full_name?.split(' ')[0] || 'Assigned'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">+{contact.wa_id}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLeadStatusBadge(contact.lead_status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(contact.priority_level)}
                  </TableCell>
                  <TableCell>
                    {getMauStatusBadge(contact.mau_status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {contact.tags?.slice(0, 2).map((ct) => (
                        <Badge 
                          key={ct.id} 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0"
                          style={{ backgroundColor: ct.tag?.color || undefined }}
                        >
                          {ct.tag?.name}
                        </Badge>
                      ))}
                      {(contact.tags?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{(contact.tags?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getComplianceIcons(contact)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {contact.last_seen 
                        ? formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })
                        : 'Never'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((page - 1) * pageSize) + 1}</span> - <span className="font-medium text-foreground">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span> contacts
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  className={cn(
                    "rounded-lg",
                    page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'
                  )}
                />
              </PaginationItem>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNum)}
                      isActive={page === pageNum}
                      className={cn(
                        "rounded-lg",
                        page === pageNum 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "cursor-pointer hover:bg-muted"
                      )}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  className={cn(
                    "rounded-lg",
                    page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
