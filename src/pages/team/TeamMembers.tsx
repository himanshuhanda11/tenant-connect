import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Search, UserPlus, MoreHorizontal, Eye, Edit, Ban, 
  RotateCcw, Mail, Users 
} from 'lucide-react';
import { useTeamMembers, useMemberInvites } from '@/hooks/useTeam';
import { STATUS_COLORS, PRESENCE_COLORS } from '@/types/team';
import { formatDistanceToNow } from 'date-fns';
import InviteMemberModal from '@/components/team/InviteMemberModal';
import MemberDetailDrawer from '@/components/team/MemberDetailDrawer';

const TeamMembers = () => {
  const { members, loading, disableMember, enableMember, updateMember } = useTeamMembers();
  const { invites, resendInvite, cancelInvite } = useMemberInvites();
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const filteredMembers = members.filter(m => 
    m.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingInvites = invites.filter(i => !i.accepted_at);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">
              Manage your team members and their access
            </p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending Invites ({pendingInvites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{invite.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite.role && (
                        <Badge variant="secondary">{invite.role.name}</Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => resendInvite(invite.id)}>
                        Resend
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cancelInvite(invite.id)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Members</CardTitle>
                <CardDescription>{members.length} team members</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No members found</p>
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite your first member
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Presence</TableHead>
                    <TableHead>Open Chats</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={member.profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {(member.display_name || member.profile?.full_name || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span 
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${PRESENCE_COLORS[member.presence as keyof typeof PRESENCE_COLORS] || 'bg-gray-400'}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.display_name || member.profile?.full_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.profile?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{member.role || 'Agent'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`w-2 h-2 rounded-full ${PRESENCE_COLORS[member.presence as keyof typeof PRESENCE_COLORS] || 'bg-gray-400'}`}
                          />
                          <span className="capitalize text-sm">{member.presence}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.open_conversations_count || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {member.last_active_at 
                            ? formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })
                            : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedMember(member.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedMember(member.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {member.is_active ? (
                              <DropdownMenuItem 
                                onClick={() => disableMember(member.id)}
                                className="text-destructive"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Disable Access
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => enableMember(member.id)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Enable Access
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <InviteMemberModal 
        open={showInviteModal} 
        onOpenChange={setShowInviteModal} 
      />

      <MemberDetailDrawer
        memberId={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </DashboardLayout>
  );
};

export default TeamMembers;
