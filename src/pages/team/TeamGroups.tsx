import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  UsersRound, Plus, Edit, Trash2, Users, 
  MessageSquare, Clock, AlertTriangle, MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTeams, useTeamMembers } from '@/hooks/useTeam';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { ROUTING_STRATEGY_LABELS } from '@/types/team';
import type { Team, RoutingStrategy } from '@/types/team';

const TeamGroups = () => {
  const { teams, loading, createTeam, updateTeam, deleteTeam } = useTeams();
  const { members } = useTeamMembers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    team_lead_id: '',
    default_routing_strategy: 'round_robin' as RoutingStrategy,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6366f1',
      team_lead_id: '',
      default_routing_strategy: 'round_robin',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingTeam(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (team: Team) => {
    setFormData({
      name: team.name,
      description: team.description || '',
      color: team.color,
      team_lead_id: team.team_lead_id || '',
      default_routing_strategy: team.default_routing_strategy,
    });
    setEditingTeam(team);
    setShowCreateModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setSubmitting(true);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, formData);
      } else {
        await createTeam(formData);
      }
      setShowCreateModal(false);
      resetForm();
      setEditingTeam(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      await deleteTeam(id);
    }
  };

  const colorOptions = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TeamBreadcrumb currentPage="Teams (Groups)" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teams (Groups)</h1>
            <p className="text-muted-foreground">
              Organize your members into teams for better collaboration
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create teams to organize your members and set up routing rules
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>{team.description || 'No description'}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(team)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(team.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Lead */}
                  {team.team_lead && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={team.team_lead.avatar_url || undefined} />
                        <AvatarFallback>
                          {(team.team_lead.full_name || team.team_lead.email)[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {team.team_lead.full_name || team.team_lead.email}
                      </span>
                      <Badge variant="secondary" className="text-xs">Lead</Badge>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-muted rounded-lg">
                      <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{team.member_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <MessageSquare className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{team.open_chats_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Open</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">0m</p>
                      <p className="text-xs text-muted-foreground">Avg Resp</p>
                    </div>
                  </div>

                  {/* Routing Strategy */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Routing</span>
                    <Badge variant="outline">
                      {ROUTING_STRATEGY_LABELS[team.default_routing_strategy]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
              <DialogDescription>
                {editingTeam 
                  ? 'Update team details and settings' 
                  : 'Create a new team to organize your members'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Team"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this team handle?"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === c ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setFormData({ ...formData, color: c })}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Team Lead</Label>
                <Select 
                  value={formData.team_lead_id} 
                  onValueChange={(v) => setFormData({ ...formData, team_lead_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.user_id}>
                        {m.display_name || m.profile?.full_name || m.profile?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Routing Strategy</Label>
                <Select 
                  value={formData.default_routing_strategy} 
                  onValueChange={(v) => setFormData({ 
                    ...formData, 
                    default_routing_strategy: v as RoutingStrategy 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROUTING_STRATEGY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim() || submitting}>
                {submitting ? 'Saving...' : editingTeam ? 'Save Changes' : 'Create Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeamGroups;
