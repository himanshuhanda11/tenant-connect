import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  User, Shield, Clock, BarChart3, X, Plus, Save
} from 'lucide-react';
import { useTeamMembers, useRoles, useTeams } from '@/hooks/useTeam';
import { PRESENCE_COLORS, STATUS_COLORS, DAYS_OF_WEEK } from '@/types/team';
import type { TeamMember } from '@/types/team';

interface MemberDetailDrawerProps {
  memberId: string | null;
  onClose: () => void;
}

const MemberDetailDrawer = ({ memberId, onClose }: MemberDetailDrawerProps) => {
  const { members, updateMember } = useTeamMembers();
  const { roles } = useRoles();
  const { teams } = useTeams();
  
  const member = members.find(m => m.id === memberId);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        display_name: member.display_name || '',
        role: member.role || 'agent',
        timezone: member.timezone || 'UTC',
        max_open_chats: member.max_open_chats || 10,
        skills: member.skills || [],
        languages: member.languages || [],
        notes: member.notes || '',
      });
    }
  }, [member]);

  if (!member) {
    return (
      <Sheet open={!!memberId} onOpenChange={() => onClose()}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Member not found</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const handleSave = () => {
    updateMember(member.id, formData);
    onClose();
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter(s => s !== skill)
    });
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages?.includes(languageInput.trim())) {
      setFormData({
        ...formData,
        languages: [...(formData.languages || []), languageInput.trim()]
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData({
      ...formData,
      languages: (formData.languages || []).filter(l => l !== lang)
    });
  };

  return (
    <Sheet open={!!memberId} onOpenChange={() => onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {(member.display_name || member.profile?.full_name || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span 
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                  PRESENCE_COLORS[member.presence as keyof typeof PRESENCE_COLORS] || 'bg-gray-400'
                }`}
              />
            </div>
            <div>
              <SheetTitle>
                {member.display_name || member.profile?.full_name || 'Unknown'}
              </SheetTitle>
              <SheetDescription>{member.profile?.email}</SheetDescription>
              <div className="flex gap-2 mt-1">
                <Badge className={STATUS_COLORS[member.status as keyof typeof STATUS_COLORS]}>
                  {member.status}
                </Badge>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">
              <User className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="access">
              <Shield className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Clock className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart3 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Display name"
              />
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2">
                <Input
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="Add language"
                  onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                />
                <Button size="sm" onClick={addLanguage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.languages || []).map(lang => (
                  <Badge key={lang} variant="secondary">
                    {lang}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeLanguage(lang)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add skill"
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button size="sm" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map(skill => (
                  <Badge key={skill} variant="outline">
                    {skill}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes about this team member..."
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Access Tab */}
          <TabsContent value="access" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                value={formData.role || 'agent'} 
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.base_role}>
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
              <Label>Team Memberships</Label>
              <div className="p-3 border rounded-lg space-y-2">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-sm">{team.name}</span>
                    </div>
                    <Switch />
                  </div>
                ))}
                {teams.length === 0 && (
                  <p className="text-sm text-muted-foreground">No teams created</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permissions Preview</Label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  This member has {formData.role} access level permissions.
                  View the Roles page to see full permission details.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select 
                value={formData.timezone || 'UTC'} 
                onValueChange={(v) => setFormData({ ...formData, timezone: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Asia/Kolkata">India</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-2">
              <Label>Working Hours</Label>
              <div className="p-3 border rounded-lg space-y-2">
                {DAYS_OF_WEEK.slice(1, 6).map((day, idx) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span>{day}</span>
                    <span className="text-muted-foreground">09:00 - 18:00</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Inheriting from workspace default. Override in Working Hours settings.
              </p>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">{member.open_conversations_count || 0}</p>
                <p className="text-sm text-muted-foreground">Open Chats</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">0m</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">SLA Breaches</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">CSAT Score</h4>
              <p className="text-muted-foreground text-sm">
                No customer satisfaction data available yet
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MemberDetailDrawer;
