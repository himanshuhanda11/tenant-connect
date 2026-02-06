import React, { useState } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { KeyRound, Mail, Phone, Loader2, Copy, ExternalLink } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  role: string;
  profiles?: { email?: string; full_name?: string };
}

interface Props {
  member: Member;
  isSuperAdmin: boolean;
}

export default function UserManagementActions({ member, isSuperAdmin }: Props) {
  const { post } = useAdminApi();
  const [resetDialog, setResetDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [phoneDialog, setPhoneDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isSuperAdmin) return null;

  const userId = member.user_id;

  const handleResetPassword = async () => {
    setSubmitting(true);
    try {
      const data = await post(`users/${userId}/reset-password`, {});
      setResetLink(data.reset_link || '');
      toast({ title: `Password reset link generated for ${data.email}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    setSubmitting(true);
    try {
      await post(`users/${userId}/update-email`, { email: newEmail.trim() });
      toast({ title: 'Email updated successfully' });
      setEmailDialog(false);
      setNewEmail('');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) return;
    setSubmitting(true);
    try {
      await post(`users/${userId}/update-phone`, { phone: newPhone.trim() });
      toast({ title: 'Phone updated successfully' });
      setPhoneDialog(false);
      setNewPhone('');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink);
    toast({ title: 'Link copied to clipboard' });
  };

  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" title="Reset Password" onClick={() => { setResetLink(''); setResetDialog(true); }}>
          <KeyRound className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" title="Change Email" onClick={() => setEmailDialog(true)}>
          <Mail className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" title="Change Phone" onClick={() => setPhoneDialog(true)}>
          <Phone className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialog} onOpenChange={setResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {member.profiles?.full_name || member.profiles?.email}</DialogTitle>
          </DialogHeader>
          {resetLink ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Password reset link generated. Share this with the user:</p>
              <div className="flex gap-2">
                <Input value={resetLink} readOnly className="text-xs" />
                <Button size="sm" variant="outline" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">This link expires in 24 hours.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This will generate a password reset link for <strong>{member.profiles?.email}</strong>. You can share this link with the user.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialog(false)}>Close</Button>
            {!resetLink && (
              <Button onClick={handleResetPassword} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Generate Reset Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email for {member.profiles?.full_name || 'User'}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Current Email</Label>
            <Input value={member.profiles?.email || ''} disabled className="mb-3" />
            <Label>New Email</Label>
            <Input placeholder="new@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateEmail} disabled={submitting || !newEmail.trim()}>
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Phone Dialog */}
      <Dialog open={phoneDialog} onOpenChange={setPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Phone for {member.profiles?.full_name || 'User'}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>New Phone Number (with country code, e.g. +91...)</Label>
            <Input placeholder="+919876543210" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhoneDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdatePhone} disabled={submitting || !newPhone.trim()}>
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update Phone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
