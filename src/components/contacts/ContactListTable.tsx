import { Contact, PRIORITY_OPTIONS, LEAD_STATUS_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  MessageSquare, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Bot,
  UserCheck,
  Ban,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContactListTableProps {
  contacts: Contact[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
}

export function ContactListTable({
  contacts,
  loading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onSelectContact,
  selectedContactId,
}: ContactListTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getInitials = (name?: string | null, waId?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  const getPriorityBadge = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option ? (
      <Badge variant="secondary" className={`${option.color} text-xs`}>
        {option.label}
      </Badge>
    ) : null;
  };

  const getLeadStatusBadge = (status: string) => {
    const option = LEAD_STATUS_OPTIONS.find(s => s.value === status);
    return option ? (
      <Badge variant="secondary" className={`${option.color} text-xs`}>
        {option.label}
      </Badge>
    ) : null;
  };

  const getMauStatusBadge = (status: string) => {
    const option = MAU_STATUS_OPTIONS.find(s => s.value === status);
    return option ? (
      <Badge variant="secondary" className={`${option.color} text-xs`}>
        {option.label}
      </Badge>
    ) : null;
  };

  const getComplianceBadges = (contact: Contact) => {
    const badges = [];
    
    if (contact.opt_in_status) {
      badges.push(
        <span key="optin" className="inline-flex items-center text-green-600" title="Opted In">
          <ShieldCheck className="h-4 w-4" />
        </span>
      );
    } else if (contact.opt_out) {
      badges.push(
        <span key="optout" className="inline-flex items-center text-red-600" title="Opted Out">
          <ShieldAlert className="h-4 w-4" />
        </span>
      );
    }
    
    if (contact.blocked_by_user) {
      badges.push(
        <span key="blocked" className="inline-flex items-center text-red-600" title="Blocked">
          <Ban className="h-4 w-4" />
        </span>
      );
    }
    
    if (contact.intervened) {
      badges.push(
        <span key="intervened" className="inline-flex items-center text-blue-600" title="Human Intervened">
          <UserCheck className="h-4 w-4" />
        </span>
      );
    } else if (contact.bot_handled) {
      badges.push(
        <span key="bot" className="inline-flex items-center text-purple-600" title="Bot Handled">
          <Bot className="h-4 w-4" />
        </span>
      );
    }
    
    return badges;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No contacts found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your filters or wait for new contacts to arrive via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[280px]">Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>MAU</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow
                key={contact.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedContactId === contact.id ? 'bg-primary/5' : ''
                }`}
                onClick={() => onSelectContact(contact)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.profile_picture_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(contact.name, contact.wa_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {contact.name || contact.first_name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">+{contact.wa_id}</span>
                      </div>
                    </div>
                    {contact.assigned_agent && (
                      <Badge variant="outline" className="text-xs ml-auto shrink-0">
                        {contact.assigned_agent.full_name?.split(' ')[0] || 'Assigned'}
                      </Badge>
                    )}
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
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {contact.tags?.slice(0, 2).map((ct) => (
                      <Badge 
                        key={ct.id} 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: ct.tag?.color || undefined }}
                      >
                        {ct.tag?.name}
                      </Badge>
                    ))}
                    {(contact.tags?.length || 0) > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(contact.tags?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getComplianceBadges(contact)}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount} contacts
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
