import React, { useState, useEffect } from 'react';
import { Users, Plus, MoreHorizontal, Mail, Shield, Crown, UserCog, Loader2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TenantRole } from '@/types/tenant';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['admin', 'agent']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface MemberWithProfile {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  profile: { id: string; email: string; full_name: string | null; avatar_url: string | null } | null;
}

const roleConfig: Record<TenantRole, { icon: React.ComponentType<{className?: string}>, color: string, label: string }> = {
  owner: { icon: Crown, color: 'bg-warning/20 text-warning border-warning/30', label: 'Owner' },
  admin: { icon: Shield, color: 'bg-info/20 text-info border-info/30', label: 'Admin' },
  agent: { icon: UserCog, color: 'bg-muted text-muted-foreground border-border', label: 'Agent' },
};

export default function Team() {
  const { currentTenant, currentRole } = useTenant();
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberWithProfile | null>(null);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'agent' },
  });

  const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

  useEffect(() => {
    if (currentTenant) fetchMembers();
  }, [currentTenant]);

  const fetchMembers = async () => {
    if (!currentTenant) return;
    try {
      const { data: membersData, error } = await supabase
        .from('tenant_members')
        .select('id, tenant_id, user_id, role')
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = (membersData || []).map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

      setMembers((membersData || []).map(m => ({
        ...m,
        role: m.role as TenantRole,
        profile: profilesMap.get(m.user_id) || null
      })));
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const onInvite = async (data: InviteFormData) => {
    if (!currentTenant) return;
    setInviting(true);
    try {
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', data.email).maybeSingle();
      if (!existingUser) { toast.error('No user found with this email. They need to sign up first.'); return; }
      const { data: existingMember } = await supabase.from('tenant_members').select('id').eq('tenant_id', currentTenant.id).eq('user_id', existingUser.id).maybeSingle();
      if (existingMember) { toast.error('This user is already a member.'); return; }
      const { error } = await supabase.from('tenant_members').insert({ tenant_id: currentTenant.id, user_id: existingUser.id, role: data.role });
      if (error) throw error;
      toast.success('Team member added!');
      form.reset();
      setInviteOpen(false);
      fetchMembers();
    } catch (error) {
      toast.error('Failed to add member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TenantRole) => {
    const { error } = await supabase.from('tenant_members').update({ role: newRole }).eq('id', memberId);
    if (error) { toast.error('Failed to update role'); return; }
    toast.success('Role updated');
    fetchMembers();
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    const { error } = await supabase.from('tenant_members').delete().eq('id', memberToDelete.id);
    if (error) { toast.error('Failed to remove member'); return; }
    toast.success('Member removed');
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
    fetchMembers();
  };

  const getInitials = (name: string | null, email: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : email.slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team</h1>
            <p className="text-muted-foreground mt-1">Manage your workspace members</p>
          </div>
          {canManageTeam && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Member</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Team Member</DialogTitle><DialogDescription>Add a new member. They must have an existing account.</DialogDescription></DialogHeader>
                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="colleague@company.com" {...form.register('email')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={form.watch('role')} onValueChange={(v) => form.setValue('role', v as 'admin' | 'agent')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={inviting}>{inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Team Members</CardTitle><CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> : (
              <div className="divide-y divide-border">
                {members.map((member) => {
                  const roleInfo = roleConfig[member.role];
                  const RoleIcon = roleInfo.icon;
                  const isCurrentUser = member.user_id === user?.id;
                  const isOwner = member.role === 'owner';
                  return (
                    <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(member.profile?.full_name ?? null, member.profile?.email ?? '')}</AvatarFallback></Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{member.profile?.full_name || 'Unnamed'}</p>
                            {isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{member.profile?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={roleInfo.color}><RoleIcon className="w-3 h-3 mr-1" />{roleInfo.label}</Badge>
                        {canManageTeam && !isOwner && !isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')} disabled={member.role === 'admin'}>Make Admin</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'agent')} disabled={member.role === 'agent'}>Make Agent</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setMemberToDelete(member); setDeleteDialogOpen(true); }} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove team member?</AlertDialogTitle><AlertDialogDescription>This will remove {memberToDelete?.profile?.full_name || memberToDelete?.profile?.email} from this workspace.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
