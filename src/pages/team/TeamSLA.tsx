import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Clock, AlertTriangle, Plus, Save, Trash2, Edit
} from 'lucide-react';
import { useWorkingHoursAndSLA, useTeams } from '@/hooks/useTeam';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { DAYS_OF_WEEK } from '@/types/team';
import type { WorkingHours, SLASettings } from '@/types/team';

const TeamSLA = () => {
  const { workingHours, slaSettings, loading, saveWorkingHours, saveSLASettings } = useWorkingHoursAndSLA();
  const { teams } = useTeams();
  const [editingSLA, setEditingSLA] = useState<Partial<SLASettings> | null>(null);
  
  // Working hours state (workspace-level)
  const [hours, setHours] = useState<Partial<WorkingHours>[]>(
    workingHours.filter(wh => !wh.team_id && !wh.user_id).length > 0
      ? workingHours.filter(wh => !wh.team_id && !wh.user_id)
      : DAYS_OF_WEEK.map((_, idx) => ({
          day_of_week: idx,
          start_time: idx >= 1 && idx <= 5 ? '09:00' : '',
          end_time: idx >= 1 && idx <= 5 ? '18:00' : '',
          is_active: idx >= 1 && idx <= 5,
        }))
  );

  const handleToggleDay = (dayIndex: number) => {
    setHours(prev => prev.map((h, i) => 
      i === dayIndex ? { ...h, is_active: !h.is_active } : h
    ));
  };

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setHours(prev => prev.map((h, i) => 
      i === dayIndex ? { ...h, [field]: value } : h
    ));
  };

  const handleSaveHours = () => {
    const validHours = hours.filter(h => h.is_active && h.start_time && h.end_time);
    saveWorkingHours(validHours);
  };

  const handleSaveSLA = () => {
    if (editingSLA) {
      saveSLASettings(editingSLA);
      setEditingSLA(null);
    }
  };

  const handleCreateSLA = () => {
    setEditingSLA({
      name: 'Default SLA',
      first_response_minutes: 15,
      follow_up_minutes: 60,
      resolution_hours: 24,
      escalate_on_breach: true,
      escalate_to_team_lead: true,
      after_hours_auto_reply: true,
      is_active: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TeamBreadcrumb currentPage="Working Hours & SLA" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Working Hours & SLA</h1>
            <p className="text-muted-foreground">
              Configure business hours and service level agreements
            </p>
          </div>
        </div>

        <Tabs defaultValue="hours">
          <TabsList>
            <TabsTrigger value="hours">Working Hours</TabsTrigger>
            <TabsTrigger value="sla">SLA Settings</TabsTrigger>
          </TabsList>

          {/* Working Hours Tab */}
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Business Hours</CardTitle>
                    <CardDescription>
                      Set when your team is available to respond
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveHours}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Hours
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const dayHours = hours[index] || { is_active: false, start_time: '', end_time: '' };
                    return (
                      <div key={day} className="flex items-center gap-4 py-3 border-b last:border-0">
                        <div className="w-32">
                          <span className="font-medium">{day}</span>
                        </div>
                        <Switch
                          checked={dayHours.is_active}
                          onCheckedChange={() => handleToggleDay(index)}
                        />
                        {dayHours.is_active ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={dayHours.start_time || ''}
                              onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={dayHours.end_time || ''}
                              onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timezone</CardTitle>
                <CardDescription>All times are in this timezone</CardDescription>
              </CardHeader>
              <CardContent>
                <Select defaultValue="UTC">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">After-Hours Behavior</CardTitle>
                <CardDescription>What happens when customers message outside business hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Send automatic reply</p>
                    <p className="text-sm text-muted-foreground">
                      Let customers know you'll respond during business hours
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Queue for next business day</p>
                    <p className="text-sm text-muted-foreground">
                      Keep in unassigned queue until agents are available
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA Settings Tab */}
          <TabsContent value="sla" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">SLA Policies</CardTitle>
                    <CardDescription>
                      Define response time targets and escalation rules
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateSLA}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add SLA Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : slaSettings.length === 0 && !editingSLA ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No SLA policies</h3>
                    <p className="text-muted-foreground mb-4">
                      Create SLA policies to set response time targets
                    </p>
                    <Button onClick={handleCreateSLA}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create SLA Policy
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slaSettings.map((sla) => (
                      <div key={sla.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{sla.name}</h4>
                            {sla.team && (
                              <Badge variant="secondary">{sla.team.name}</Badge>
                            )}
                            {!sla.is_active && (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingSLA(sla)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">First Response</p>
                            <p className="font-medium">{sla.first_response_minutes} minutes</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Follow-up</p>
                            <p className="font-medium">{sla.follow_up_minutes} minutes</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Resolution</p>
                            <p className="font-medium">{sla.resolution_hours} hours</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Edit/Create Form */}
                    {editingSLA && (
                      <div className="p-4 border-2 border-primary rounded-lg space-y-4">
                        <h4 className="font-medium">
                          {editingSLA.id ? 'Edit SLA Policy' : 'New SLA Policy'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Policy Name</Label>
                            <Input
                              value={editingSLA.name || ''}
                              onChange={(e) => setEditingSLA({ ...editingSLA, name: e.target.value })}
                              placeholder="e.g., Standard SLA"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Apply to Team</Label>
                            <Select 
                              value={editingSLA.team_id || ''} 
                              onValueChange={(v) => setEditingSLA({ ...editingSLA, team_id: v || undefined })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All teams (default)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All teams</SelectItem>
                                {teams.map(t => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>First Response (minutes)</Label>
                            <Input
                              type="number"
                              value={editingSLA.first_response_minutes || 15}
                              onChange={(e) => setEditingSLA({ 
                                ...editingSLA, 
                                first_response_minutes: parseInt(e.target.value) 
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Follow-up (minutes)</Label>
                            <Input
                              type="number"
                              value={editingSLA.follow_up_minutes || 60}
                              onChange={(e) => setEditingSLA({ 
                                ...editingSLA, 
                                follow_up_minutes: parseInt(e.target.value) 
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Resolution (hours)</Label>
                            <Input
                              type="number"
                              value={editingSLA.resolution_hours || 24}
                              onChange={(e) => setEditingSLA({ 
                                ...editingSLA, 
                                resolution_hours: parseInt(e.target.value) 
                              })}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Escalate on Breach</p>
                              <p className="text-xs text-muted-foreground">
                                Notify when SLA is at risk
                              </p>
                            </div>
                            <Switch
                              checked={editingSLA.escalate_on_breach}
                              onCheckedChange={(v) => setEditingSLA({ ...editingSLA, escalate_on_breach: v })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Escalate to Team Lead</p>
                              <p className="text-xs text-muted-foreground">
                                Alert team lead when breached
                              </p>
                            </div>
                            <Switch
                              checked={editingSLA.escalate_to_team_lead}
                              onCheckedChange={(v) => setEditingSLA({ ...editingSLA, escalate_to_team_lead: v })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingSLA(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveSLA}>
                            Save SLA Policy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SLA Breach Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  SLA Breach Handling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show SLA Risk Badge</p>
                    <p className="text-sm text-muted-foreground">
                      Display warning on conversations nearing SLA breach
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Prioritize at Risk</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically set priority to high when SLA is at risk
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Create Task on Breach</p>
                    <p className="text-sm text-muted-foreground">
                      Create urgent task for manager when SLA is breached
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeamSLA;
