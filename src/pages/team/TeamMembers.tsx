import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, UserPlus, Mail, Users, RefreshCw
} from 'lucide-react';
import { useTeamMembers, useMemberInvites } from '@/hooks/useTeam';
import { formatDistanceToNow } from 'date-fns';
import InviteMemberModal from '@/components/team/InviteMemberModal';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import { MemberProfileCard } from '@/components/team/MemberProfileCard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TeamMembers = () => {
  const { members, loading, disableMember, enableMember, updateMember, deleteMember, refetch } = useTeamMembers();
  const { invites, resendInvite, cancelInvite } = useMemberInvites();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.profile?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingInvites = invites.filter(i => !i.accepted_at);

  const statusCounts = {
    all: members.length,
    active: members.filter(m => m.status === 'active').length,
    invited: members.filter(m => m.status === 'invited').length,
    disabled: members.filter(m => m.status === 'disabled').length,
  };

  const onlineCount = members.filter(m => m.presence === 'online').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <TeamBreadcrumb currentPage="Members" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team, roles, and access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Button onClick={() => setShowInviteModal(true)} className="rounded-xl gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Stat Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-2xl border-border/50 hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
                <p className="text-xl font-bold text-primary mt-0.5">{members.length}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Online</p>
                <p className="text-xl font-bold text-green-600 mt-0.5">{onlineCount}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-xl font-bold text-amber-600 mt-0.5">{pendingInvites.length}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active</p>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">{statusCounts.active}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <Card className="rounded-2xl border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Pending Invites ({pendingInvites.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-background/80 rounded-xl border border-border/40">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold">
                        {invite.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{invite.email}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                        {invite.inviter?.full_name && ` • by ${invite.inviter.full_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {invite.role && (
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: invite.role.color, color: invite.role.color }}>
                        {invite.role.name}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => resendInvite(invite.id)}>
                      <RefreshCw className="mr-1 h-3 w-3" /> Resend
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => cancelInvite(invite.id)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Members Grid */}
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Members</CardTitle>
                <CardDescription className="text-xs">{filteredMembers.length} of {members.length}</CardDescription>
              </div>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-sm"
                />
              </div>
            </div>
          </CardHeader>

          {/* Status Filter */}
          <div className="px-6 border-b border-border/40">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="h-auto p-0 bg-transparent gap-1">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 pb-2.5 text-xs font-medium"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{count}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <CardContent className="pt-5">
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <EmptyTeamState
                icon={Users}
                title={search ? 'No members found' : 'No team members yet'}
                description={search
                  ? `No members match "${search}".`
                  : 'Add your first team member to get started.'
                }
                actionLabel={!search ? 'Add Member' : undefined}
                onAction={!search ? () => setShowInviteModal(true) : undefined}
              />
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((member) => (
                  <MemberProfileCard
                    key={member.id}
                    member={member}
                    onDisable={disableMember}
                    onEnable={enableMember}
                    onUpdate={updateMember}
                    onDelete={deleteMember}
                    onRefetch={refetch}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InviteMemberModal open={showInviteModal} onOpenChange={setShowInviteModal} />
    </DashboardLayout>
  );
};

export default TeamMembers;
