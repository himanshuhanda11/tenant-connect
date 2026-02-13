import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, UserPlus, Mail, Users, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import { useTeamMembers, useMemberInvites } from '@/hooks/useTeam';
import { formatDistanceToNow } from 'date-fns';
import InviteMemberModal from '@/components/team/InviteMemberModal';
import MemberDetailDrawer from '@/components/team/MemberDetailDrawer';
import { TeamGuideCard } from '@/components/team/TeamGuideCard';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import { MemberProfileCard } from '@/components/team/MemberProfileCard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TeamMembers = () => {
  const { members, loading, disableMember, enableMember, updateMember, refetch } = useTeamMembers();
  const { invites, resendInvite, cancelInvite } = useMemberInvites();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

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
            <p className="text-muted-foreground mt-1">
              Manage your team members, invites, and access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh members</TooltipContent>
            </Tooltip>
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Guide for new users */}
        {members.length < 2 && (
          <TeamGuideCard
            title="Build Your Team"
            description="Invite team members to help manage customer conversations."
            tips={[
              "Assign roles to control what each member can access",
              "Add members to teams for organized routing",
              "Set skills and languages for smart assignment"
            ]}
            dismissKey="members-guide"
          />
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online Now</p>
                  <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invites</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingInvites.length}</p>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold">{statusCounts.active}</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  {Math.round((statusCounts.active / Math.max(members.length, 1)) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Pending Invites ({pendingInvites.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {invite.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                          {invite.inviter?.full_name && ` by ${invite.inviter.full_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite.role && (
                        <Badge variant="outline" style={{ borderColor: invite.role.color, color: invite.role.color }}>
                          {invite.role.name}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => resendInvite(invite.id)}>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Resend
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => cancelInvite(invite.id)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Members</CardTitle>
                <CardDescription>{filteredMembers.length} of {members.length} members</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          {/* Status Tabs */}
          <div className="px-6 border-b">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="h-auto p-0 bg-transparent gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <CardContent className="pt-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <EmptyTeamState
                icon={Users}
                title={search ? 'No members found' : 'No team members yet'}
                description={search
                  ? `No members match "${search}". Try a different search.`
                  : 'Invite your first team member to get started with collaborative inbox management.'
                }
                actionLabel={!search ? 'Invite Member' : undefined}
                onAction={!search ? () => setShowInviteModal(true) : undefined}
                tips={!search ? [
                  'Team members can help respond to customers',
                  'Assign different roles for different access levels',
                  'Add skills and languages for smart routing'
                ] : undefined}
              />
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((member) => (
                  <MemberProfileCard
                    key={member.id}
                    member={member}
                    onViewDetails={setSelectedMember}
                    onDisable={disableMember}
                    onEnable={enableMember}
                    onUpdate={updateMember}
                    onRefetch={refetch}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InviteMemberModal open={showInviteModal} onOpenChange={setShowInviteModal} />
      <MemberDetailDrawer memberId={selectedMember} onClose={() => setSelectedMember(null)} />
    </DashboardLayout>
  );
};

export default TeamMembers;
