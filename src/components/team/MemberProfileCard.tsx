import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal, Eye, Pencil, Mail, KeyRound, Ban, RotateCcw,
  RefreshCw, MessageSquare, Clock, Globe, Wrench
} from 'lucide-react';
import { STATUS_COLORS, PRESENCE_COLORS } from '@/types/team';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MemberProfileCardProps {
  member: any;
  onViewDetails: (id: string) => void;
  onDisable: (id: string) => void;
  onEnable: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onRefetch: () => void;
}

export function MemberProfileCard({
  member, onViewDetails, onDisable, onEnable, onUpdate, onRefetch
}: MemberProfileCardProps) {
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualPassword, setManualPassword] = useState('');
  const [confirmManualPassword, setConfirmManualPassword] = useState('');
  const [resetMode, setResetMode] = useState<'choose' | 'manual'>('choose');

  const isInvited = member.status === 'invited';
  const displayName = member.display_name || member.profile?.full_name || 'Unknown';
  const email = member.profile?.email || '';
  const initials = displayName[0]?.toUpperCase() || 'U';

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setLoading(true);
    try {
      await onUpdate(member.id, { display_name: nameValue.trim() });
      if (member.user_id) {
        await supabase.from('profiles').update({ full_name: nameValue.trim() }).eq('id', member.user_id);
      }
      toast.success('Name updated');
      setEditNameOpen(false);
      onRefetch();
    } catch { toast.error('Failed to update name'); }
    finally { setLoading(false); }
  };

  const handleSaveEmail = async () => {
    if (!emailValue.trim()) return;
    setLoading(true);
    try {
      if (member.user_id) {
        await supabase.from('profiles').update({ email: emailValue.trim() }).eq('id', member.user_id);
      }
      toast.success('Email updated');
      setEditEmailOpen(false);
      onRefetch();
    } catch { toast.error('Failed to update email'); }
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
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (manualPassword !== confirmManualPassword) {
      toast.error('Passwords do not match');
      return;
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
      toast.success('Password updated successfully');
      setResetPwOpen(false);
      setManualPassword('');
      setConfirmManualPassword('');
      setResetMode('choose');
    } catch (err: any) {
      toast.error(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className={`group hover:shadow-md transition-shadow ${isInvited ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
        <CardContent className="p-5">
          {/* Header row: avatar + actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                    PRESENCE_COLORS[member.presence as keyof typeof PRESENCE_COLORS] || 'bg-gray-400'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(member.id)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setNameValue(displayName); setEditNameOpen(true); }}>
                  <Pencil className="mr-2 h-4 w-4" /> Change Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setEmailValue(email); setEditEmailOpen(true); }}>
                  <Mail className="mr-2 h-4 w-4" /> Edit Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setResetPwOpen(true)}>
                  <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {member.is_active ? (
                  <DropdownMenuItem onClick={() => onDisable(member.id)} className="text-destructive focus:text-destructive">
                    <Ban className="mr-2 h-4 w-4" /> Disable Access
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onEnable(member.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Enable Access
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">{member.role || 'Agent'}</Badge>
            <Badge
              variant="secondary"
              className={`text-xs ${STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active}`}
            >
              {member.status}
            </Badge>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{member.open_conversations_count || 0} open chats</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {member.last_active_at
                  ? formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
            {member.skills?.length > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                <Wrench className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{member.skills.slice(0, 3).join(', ')}</span>
              </div>
            )}
            {member.languages?.length > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{member.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            {isInvited ? (
              <p className="text-xs text-muted-foreground italic flex-1 text-center">Pending invitation acceptance</p>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => onViewDetails(member.id)}>
                  <Eye className="mr-1.5 h-3 w-3" /> Profile
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setNameValue(displayName); setEditNameOpen(true); }}>
                  <Pencil className="mr-1.5 h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setResetPwOpen(true)}>
                  <KeyRound className="mr-1.5 h-3 w-3" /> Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Name Dialog */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Name</DialogTitle>
            <DialogDescription>Update the display name for this team member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} placeholder="Enter new name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNameOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveName} disabled={loading || !nameValue.trim()}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Email Address</DialogTitle>
            <DialogDescription>Update the email address for this team member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} placeholder="Enter new email" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEmail} disabled={loading || !emailValue.trim()}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                <div className="text-left">
                  <p className="font-medium text-sm">Send Reset Email</p>
                  <p className="text-xs text-muted-foreground">Send a password reset link to {email}</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => setResetMode('manual')}
              >
                <KeyRound className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium text-sm">Set New Password Manually</p>
                  <p className="text-xs text-muted-foreground">Enter a new password for this member directly</p>
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmManualPassword}
                  onChange={(e) => setConfirmManualPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setResetMode('choose'); setManualPassword(''); setConfirmManualPassword(''); }}>
                  Back
                </Button>
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
