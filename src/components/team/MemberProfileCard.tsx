import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  MoreVertical, Pencil, Mail, KeyRound, Ban, RotateCcw,
  RefreshCw, MessageSquare, Clock, Globe, Wrench, Trash2, Save, Plus, X
} from 'lucide-react';
import { STATUS_COLORS, PRESENCE_COLORS } from '@/types/team';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRoles, useTeams } from '@/hooks/useTeam';

interface MemberProfileCardProps {
  member: any;
  onDisable: (id: string) => void;
  onEnable: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => void;
  onRefetch: () => void;
}

export function MemberProfileCard({
  member, onDisable, onEnable, onUpdate, onDelete, onRefetch
}: MemberProfileCardProps) {
  const { roles } = useRoles();
  const { teams } = useTeams();
  const [editOpen, setEditOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualPassword, setManualPassword] = useState('');
  const [confirmManualPassword, setConfirmManualPassword] = useState('');
  const [resetMode, setResetMode] = useState<'choose' | 'manual'>('choose');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editLanguages, setEditLanguages] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [langInput, setLangInput] = useState('');

  const isInvited = member.status === 'invited';
  const displayName = member.display_name || member.profile?.full_name || 'Unknown';
  const email = member.profile?.email || '';
  const initials = displayName[0]?.toUpperCase() || 'U';

  const openEditDrawer = () => {
    setEditName(displayName);
    setEditEmail(email);
    setEditRole(member._role_id || '');
    setEditNotes(member.notes || '');
    setEditSkills(member.skills || []);
    setEditLanguages(member.languages || []);
    setEditOpen(true);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Find the selected role to get base_role for agents table
      const selectedRoleObj = roles.find(r => r.id === editRole);
      await onUpdate(member.id, {
        display_name: editName.trim(),
        role: selectedRoleObj?.name || selectedRoleObj?.base_role || member.role,
        notes: editNotes,
        skills: editSkills,
        languages: editLanguages,
        _new_role_id: editRole || undefined,
      } as any);
      if (member.user_id) {
        await supabase.from('profiles').update({
          full_name: editName.trim(),
          ...(editEmail !== email ? { email: editEmail.trim() } : {}),
        }).eq('id', member.user_id);
      }
      toast.success('Member updated');
      setEditOpen(false);
      onRefetch();
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent');
      setResetPwOpen(false);
      setResetMode('choose');
    } catch { toast.error('Failed to send reset email'); }
    finally { setLoading(false); }
  };

  const handleSetManualPassword = async () => {
    if (!manualPassword || manualPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (manualPassword !== confirmManualPassword) {
      toast.error('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-set-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            user_id: member.user_id,
            new_password: manualPassword,
            tenant_id: member.tenant_id,
          }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      toast.success('Password updated');
      setResetPwOpen(false);
      setManualPassword('');
      setConfirmManualPassword('');
      setResetMode('choose');
    } catch (err: any) {
      toast.error(err.message || 'Failed to set password');
    } finally { setLoading(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !editSkills.includes(skillInput.trim())) {
      setEditSkills([...editSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const addLang = () => {
    if (langInput.trim() && !editLanguages.includes(langInput.trim())) {
      setEditLanguages([...editLanguages, langInput.trim()]);
      setLangInput('');
    }
  };

  const presenceColor = PRESENCE_COLORS[member.presence as keyof typeof PRESENCE_COLORS] || 'bg-gray-400';

  return (
    <>
      <Card className={`group relative overflow-hidden rounded-2xl border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 ${isInvited ? 'border-amber-300/60 dark:border-amber-700/40' : ''}`}>
        {/* Subtle gradient accent at top */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
        
        <CardContent className="p-5">
          {/* Header: Avatar + Info + Menu */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-background ${presenceColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate leading-tight">{displayName}</h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-medium">
                  {member.role || 'Agent'}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-2 py-0 h-5 ${STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] || ''}`}
                >
                  {member.status}
                </Badge>
              </div>
            </div>
            {!isInvited && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={openEditDrawer}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResetPwOpen(true)}>
                    <KeyRound className="mr-2 h-3.5 w-3.5" /> Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {member.is_active ? (
                    <DropdownMenuItem onClick={() => onDisable(member.id)} className="text-amber-600 focus:text-amber-600">
                      <Ban className="mr-2 h-3.5 w-3.5" /> Disable Access
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onEnable(member.id)}>
                      <RotateCcw className="mr-2 h-3.5 w-3.5" /> Enable Access
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
              <MessageSquare className="h-3 w-3 flex-shrink-0 text-primary/60" />
              <span>{member.open_conversations_count || 0} chats</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
              <Clock className="h-3 w-3 flex-shrink-0 text-primary/60" />
              <span className="truncate">
                {member.last_active_at
                  ? formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
          </div>

          {/* Tags row */}
          {(member.skills?.length > 0 || member.languages?.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-3">
              {member.languages?.slice(0, 2).map((l: string) => (
                <Badge key={l} variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
                  <Globe className="h-2.5 w-2.5 mr-0.5" />{l}
                </Badge>
              ))}
              {member.skills?.slice(0, 2).map((s: string) => (
                <Badge key={s} variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400">
                  <Wrench className="h-2.5 w-2.5 mr-0.5" />{s}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick action */}
          {isInvited ? (
            <p className="text-[11px] text-amber-600 italic text-center mt-4 pt-3 border-t border-border/40">
              Pending invitation
            </p>
          ) : (
            <div className="mt-4 pt-3 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-8 hover:bg-primary/5 hover:text-primary"
                onClick={openEditDrawer}
              >
                <Pencil className="mr-1.5 h-3 w-3" /> Edit Profile & Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-base">Edit Member</span>
                <p className="text-xs text-muted-foreground font-normal">{email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Display Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999]">
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.base_role}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Languages */}
            <div className="space-y-1.5">
              <Label className="text-xs">Languages</Label>
              <div className="flex gap-2">
                <Input value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="Add language" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLang())} />
                <Button size="sm" variant="outline" onClick={addLang}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editLanguages.map(l => (
                  <Badge key={l} variant="secondary" className="text-xs gap-1">
                    {l}<X className="h-3 w-3 cursor-pointer" onClick={() => setEditLanguages(editLanguages.filter(x => x !== l))} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <Label className="text-xs">Skills</Label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <Button size="sm" variant="outline" onClick={addSkill}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editSkills.map(s => (
                  <Badge key={s} variant="outline" className="text-xs gap-1">
                    {s}<X className="h-3 w-3 cursor-pointer" onClick={() => setEditSkills(editSkills.filter(x => x !== s))} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Internal Notes</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes about this member..." rows={2} />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAll} disabled={loading}>
              {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{displayName}</strong> from this workspace? 
              This will revoke their access and remove their agent profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(member.id)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwOpen} onOpenChange={(open) => { setResetPwOpen(open); if (!open) { setResetMode('choose'); setManualPassword(''); setConfirmManualPassword(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Choose how to reset the password for <strong>{displayName}</strong>
            </DialogDescription>
          </DialogHeader>
          {resetMode === 'choose' ? (
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={handleResetPassword} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                <div className="text-left">
                  <p className="font-medium text-sm">Send Reset Email</p>
                  <p className="text-xs text-muted-foreground">Send a password reset link to {email}</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => setResetMode('manual')}>
                <KeyRound className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium text-sm">Set New Password Manually</p>
                  <p className="text-xs text-muted-foreground">Enter a new password directly</p>
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={manualPassword} onChange={(e) => setManualPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmManualPassword} onChange={(e) => setConfirmManualPassword(e.target.value)} placeholder="Confirm password" />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setResetMode('choose'); setManualPassword(''); setConfirmManualPassword(''); }}>Back</Button>
                <Button onClick={handleSetManualPassword} disabled={loading || !manualPassword || manualPassword.length < 6}>
                  {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  Set Password
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
