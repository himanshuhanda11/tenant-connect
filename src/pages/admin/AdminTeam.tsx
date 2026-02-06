import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserPlus, UserMinus, ShieldCheck, Headset } from 'lucide-react';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

interface PlatformAdmin {
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  email: string;
}

export default function AdminTeam() {
  const { role } = useOutletContext<{ role: string }>();
  const { get, post, loading } = useAdminApi();
  const [team, setTeam] = useState<PlatformAdmin[]>([]);
  const [addDialog, setAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('support');
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  const loadTeam = async () => {
    try {
      const data = await get('team');
      setTeam(data.team || []);
    } catch {}
  };

  useEffect(() => { loadTeam(); }, []);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setSubmitting(true);
    try {
      await post('team/add', { email: newEmail.trim(), role: newRole });
      toast({ title: 'Team member added' });
      setAddDialog(false);
      setNewEmail('');
      setNewRole('support');
      loadTeam();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await post('team/remove', { user_id: userId });
      toast({ title: 'Team member deactivated' });
      loadTeam();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Only Super Admins can manage the support team.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Support Team</h1>
        <Button onClick={() => setAddDialog(true)} className="rounded-xl">
          <UserPlus className="h-4 w-4 mr-1" /> Add Member
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardContent className="p-0">
          {loading && team.length === 0 ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map(m => (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium text-sm">{m.email}</TableCell>
                    <TableCell>
                      <Badge variant={m.role === 'super_admin' ? 'default' : 'secondary'} className="gap-1 text-[11px]">
                        {m.role === 'super_admin' ? <ShieldCheck className="h-3 w-3" /> : <Headset className="h-3 w-3" />}
                        {m.role === 'super_admin' ? 'Super Admin' : 'Support'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={m.is_active ? 'active' : 'disconnected'} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {m.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-7 w-7 p-0"
                          onClick={() => handleRemove(m.user_id)}
                          title="Deactivate"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {team.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      No team members yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Support Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email (must have an existing account)</Label>
              <Input
                placeholder="user@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
