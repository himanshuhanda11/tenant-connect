import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Lock, ArrowRight, AlertTriangle, UserPlus, Mail, Eye, EyeOff } from 'lucide-react';
import { useMemberInvites, useRoles, useTeams } from '@/hooks/useTeam';
import { useTeamMembers } from '@/hooks/useTeam';
import { usePlanGate, getPlanLabel } from '@/hooks/usePlanGate';
import { UpgradePlanDialog } from '@/components/billing/UpgradePlanDialog';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteMemberModal = ({ open, onOpenChange }: InviteMemberModalProps) => {
  const { sendInvite } = useMemberInvites();
  const { refetch } = useTeamMembers();
  const { roles } = useRoles();
  const { teams } = useTeams();
  const { currentTenant } = useTenant();
  const { canInviteMembers, teamMemberLimit, teamMemberCount, currentPlan, nextPlan } = usePlanGate();
  
  const [tab, setTab] = useState<string>('invite');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setFullName('');
    setRoleId('');
    setSelectedTeams([]);
    setShowPassword(false);
  };

  const handleInviteSubmit = async () => {
    if (!email || !roleId) return;
    if (!canInviteMembers) { setShowUpgrade(true); return; }
    
    setSending(true);
    await sendInvite(email, roleId, selectedTeams, [], fullName);
    setSending(false);
    resetForm();
    onOpenChange(false);
  };

  const handleDirectAdd = async () => {
    const loginEmail = email || (username ? `${username}@${currentTenant?.slug || 'workspace'}.local` : '');
    if (!loginEmail || !password || !currentTenant?.id) return;
    if (!canInviteMembers) { setShowUpgrade(true); return; }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-team-member', {
        body: {
          email: loginEmail,
          password,
          fullName: fullName || username || loginEmail.split('@')[0],
          tenantId: currentTenant.id,
          roleId: roleId || undefined,
          teamIds: selectedTeams.length > 0 ? selectedTeams : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Team member added successfully');
      resetForm();
      onOpenChange(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setSending(false);
    }
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) ? prev.filter(t => t !== teamId) : [...prev, teamId]
    );
  };

  const sharedFields = (
    <>
      <div className="space-y-2">
        <Label className="text-sm">Role</Label>
        <Select value={roleId} onValueChange={setRoleId} disabled={!canInviteMembers}>
          <SelectTrigger className="touch-manipulation">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                  {role.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Team Groups (Optional)</Label>
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]">
          {teams.map(team => (
            <Badge
              key={team.id}
              variant={selectedTeams.includes(team.id) ? 'default' : 'outline'}
              className="cursor-pointer touch-manipulation py-1.5"
              onClick={() => canInviteMembers && toggleTeam(team.id)}
            >
              {team.name}
              {selectedTeams.includes(team.id) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
          {teams.length === 0 && (
            <span className="text-xs text-muted-foreground">No teams created yet</span>
          )}
        </div>
      </div>
    </>
  );

  const directAddValid = (email || username) && password && password.length >= 6;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Add Team Member</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Send an email invite or add a member directly
            </DialogDescription>
          </DialogHeader>

          {/* Plan limit warning */}
          {!canInviteMembers && (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Team member limit reached</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your {getPlanLabel(currentPlan)} plan allows {teamMemberLimit} team member{teamMemberLimit > 1 ? 's' : ''}. 
                  You currently have {teamMemberCount}.
                  {nextPlan && ` Upgrade to ${getPlanLabel(nextPlan)} to add more.`}
                </p>
                {nextPlan && (
                  <Button 
                    size="sm" 
                    className="mt-2 gap-1.5 text-xs h-7"
                    onClick={() => { onOpenChange(false); setShowUpgrade(true); }}
                  >
                    <Lock className="w-3 h-3" />
                    Upgrade to {getPlanLabel(nextPlan)}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => { setTab(v); resetForm(); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invite" className="gap-1.5 text-xs sm:text-sm">
                <Mail className="h-3.5 w-3.5" />
                Send Invite
              </TabsTrigger>
              <TabsTrigger value="add" className="gap-1.5 text-xs sm:text-sm">
                <UserPlus className="h-3.5 w-3.5" />
                Add Directly
              </TabsTrigger>
            </TabsList>

            {/* Send Invite Tab */}
            <TabsContent value="invite" className="space-y-3 mt-3 max-h-[55vh] overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={!canInviteMembers}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  disabled={!canInviteMembers}
                />
              </div>
              {sharedFields}
            </TabsContent>

            {/* Direct Add Tab */}
            <TabsContent value="add" className="space-y-3 mt-3 max-h-[55vh] overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={!canInviteMembers}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@company.com (optional if username provided)"
                  disabled={!canInviteMembers}
                />
              </div>
              <div className="space-y-2">
                <Label>Username <span className="text-xs text-muted-foreground">(if no email)</span></Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                  placeholder="johndoe"
                  disabled={!canInviteMembers || !!email}
                />
                {username && !email && (
                  <p className="text-[10px] text-muted-foreground">
                    Login: {username}@{currentTenant?.slug || 'workspace'}.local
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    disabled={!canInviteMembers}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              {sharedFields}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="touch-manipulation w-full sm:w-auto">
              Cancel
            </Button>
            {canInviteMembers ? (
              tab === 'invite' ? (
                <Button 
                  onClick={handleInviteSubmit} 
                  disabled={!email || !roleId || sending}
                  className="touch-manipulation w-full sm:w-auto"
                >
                  {sending ? 'Sending...' : 'Send Invite'}
                </Button>
              ) : (
                <Button 
                  onClick={handleDirectAdd} 
                  disabled={!directAddValid || sending}
                  className="touch-manipulation w-full sm:w-auto"
                >
                  {sending ? 'Adding...' : 'Add Member'}
                </Button>
              )
            ) : (
              <Button
                onClick={() => { onOpenChange(false); setShowUpgrade(true); }}
                className="touch-manipulation w-full sm:w-auto gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Upgrade to Invite
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePlanDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        currentPlanId={currentPlan}
      />
    </>
  );
};

export default InviteMemberModal;
