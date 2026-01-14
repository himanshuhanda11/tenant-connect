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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useMemberInvites, useRoles, useTeams } from '@/hooks/useTeam';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteMemberModal = ({ open, onOpenChange }: InviteMemberModalProps) => {
  const { sendInvite } = useMemberInvites();
  const { roles } = useRoles();
  const { teams } = useTeams();
  const { phoneNumbers } = usePhoneNumbers();
  
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!email || !roleId) return;
    
    setSending(true);
    await sendInvite(email, roleId, selectedTeams, selectedPhones);
    setSending(false);
    
    // Reset form
    setEmail('');
    setRoleId('');
    setSelectedTeams([]);
    setSelectedPhones([]);
    onOpenChange(false);
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(t => t !== teamId)
        : [...prev, teamId]
    );
  };

  const togglePhone = (phoneId: string) => {
    setSelectedPhones(prev => 
      prev.includes(phoneId) 
        ? prev.filter(p => p !== phoneId)
        : [...prev, phoneId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invite to add a new member to your team
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Team Groups (Optional)</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
              {teams.map(team => (
                <Badge
                  key={team.id}
                  variant={selectedTeams.includes(team.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTeam(team.id)}
                >
                  {team.name}
                  {selectedTeams.includes(team.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
              {teams.length === 0 && (
                <span className="text-sm text-muted-foreground">No teams created yet</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phone Number Access (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Restrict to specific phone numbers, or leave empty for all access
            </p>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
              {phoneNumbers.map(phone => (
                <Badge
                  key={phone.id}
                  variant={selectedPhones.includes(phone.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => togglePhone(phone.id)}
                >
                  {phone.display_name || phone.phone_e164}
                  {selectedPhones.includes(phone.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
              {phoneNumbers.length === 0 && (
                <span className="text-sm text-muted-foreground">No phone numbers connected</span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!email || !roleId || sending}
          >
            {sending ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;
