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
    } catch { toast.error('Failed to send reset email'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
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
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => onViewDetails(member.id)}>
              <Eye className="mr-1.5 h-3 w-3" /> Profile
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setNameValue(displayName); setEditNameOpen(true); }}>
              <Pencil className="mr-1.5 h-3 w-3" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setResetPwOpen(true)}>
              <KeyRound className="mr-1.5 h-3 w-3" /> Reset
            </Button>
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
      <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Send a password reset email to <strong>{email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Send Reset Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
