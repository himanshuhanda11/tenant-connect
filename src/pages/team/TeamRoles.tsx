import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Shield, Plus, Edit, Trash2, Eye, Check, X,
  MessageSquare, Users, FileText, Send, Zap, 
  Link2, CreditCard, Lock, Phone, UsersRound
} from 'lucide-react';
import { useRoles } from '@/hooks/useTeam';
import type { Permission, Role, PermissionCategory, AppRole } from '@/types/team';

const CATEGORY_ICONS: Record<PermissionCategory, React.ReactNode> = {
  messaging: <MessageSquare className="h-4 w-4" />,
  contacts: <Users className="h-4 w-4" />,
  templates: <FileText className="h-4 w-4" />,
  campaigns: <Send className="h-4 w-4" />,
  automation: <Zap className="h-4 w-4" />,
  integrations: <Link2 className="h-4 w-4" />,
  billing: <CreditCard className="h-4 w-4" />,
  security: <Lock className="h-4 w-4" />,
  phone_numbers: <Phone className="h-4 w-4" />,
  team: <UsersRound className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<PermissionCategory, string> = {
  messaging: 'Messaging',
  contacts: 'Contacts',
  templates: 'Templates',
  campaigns: 'Campaigns',
  automation: 'Automation',
  integrations: 'Integrations',
  billing: 'Billing',
  security: 'Security',
  phone_numbers: 'Phone Numbers',
  team: 'Team',
};

const TeamRoles = () => {
  const { roles, permissions, loading, createRole, updateRole, deleteRole, getRolePermissions } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState<{ name: string; description: string; base_role: AppRole; color: string }>({ 
    name: '', 
    description: '', 
    base_role: 'agent', 
    color: '#6366f1' 
  });
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [viewAsRole, setViewAsRole] = useState<string | null>(null);

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    const cat = perm.category as PermissionCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {} as Record<PermissionCategory, Permission[]>);

  useEffect(() => {
    if (selectedRole) {
      getRolePermissions(selectedRole.id).then(setRolePermissions);
    }
  }, [selectedRole, getRolePermissions]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setViewAsRole(null);
  };

  const handleTogglePermission = (permId: string) => {
    const newPerms = rolePermissions.includes(permId)
      ? rolePermissions.filter(p => p !== permId)
      : [...rolePermissions, permId];
    setRolePermissions(newPerms);
  };

  const handleSavePermissions = async () => {
    if (selectedRole) {
      setSaving(true);
      try {
        await updateRole(selectedRole.id, {}, rolePermissions);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;
    
    setSubmitting(true);
    try {
      await createRole(newRole, newRolePermissions);
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', base_role: 'agent' as AppRole, color: '#6366f1' });
      setNewRolePermissions([]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleNewRolePermission = (permId: string) => {
    setNewRolePermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">
              Configure roles and access control for your team
            </p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Create a custom role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="e.g., Senior Agent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Role</Label>
                    <Select 
                      value={newRole.base_role} 
                      onValueChange={(v) => setNewRole({ ...newRole, base_role: v as AppRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe this role's responsibilities..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(c => (
                      <button
                        key={c}
                        className={`w-8 h-8 rounded-full border-2 ${newRole.color === c ? 'border-foreground' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewRole({ ...newRole, color: c })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="border rounded-lg max-h-64 overflow-y-auto p-3 space-y-4">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          {CATEGORY_ICONS[category as PermissionCategory]}
                          <span className="font-medium text-sm">
                            {CATEGORY_LABELS[category as PermissionCategory]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          {perms.map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newRolePermissions.includes(perm.id)}
                                onChange={() => handleToggleNewRolePermission(perm.id)}
                                className="rounded"
                              />
                              {perm.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={!newRole.name.trim() || submitting}>
                  {submitting ? 'Creating...' : 'Create Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Roles</CardTitle>
              <CardDescription>{roles.length} roles configured</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : roles.length === 0 ? (
                  <div className="p-4 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No custom roles yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleSelectRole(role)}
                        className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                          selectedRole?.id === role.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: role.color }}
                            />
                            <div>
                              <p className="font-medium">{role.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {role.base_role}
                              </p>
                            </div>
                          </div>
                          {role.is_system && (
                            <Badge variant="secondary" className="text-xs">System</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedRole ? `${selectedRole.name} Permissions` : 'Permission Matrix'}
                  </CardTitle>
                  <CardDescription>
                    {selectedRole 
                      ? selectedRole.description || 'Configure what this role can access'
                      : 'Select a role to view and edit permissions'
                    }
                  </CardDescription>
                </div>
                {selectedRole && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setViewAsRole(selectedRole.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View as Role
                    </Button>
                    <Button size="sm" onClick={handleSavePermissions} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedRole ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Select a role from the left to configure permissions
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="messaging">
                  <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
                    {Object.keys(permissionsByCategory).map(cat => (
                      <TabsTrigger key={cat} value={cat} className="text-xs">
                        {CATEGORY_ICONS[cat as PermissionCategory]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          {CATEGORY_ICONS[category as PermissionCategory]}
                          {CATEGORY_LABELS[category as PermissionCategory]}
                        </h3>
                        <div className="grid gap-2">
                          {perms.map(perm => (
                            <div 
                              key={perm.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{perm.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {perm.description}
                                </p>
                              </div>
                              <Switch
                                checked={rolePermissions.includes(perm.id)}
                                onCheckedChange={() => handleTogglePermission(perm.id)}
                                disabled={selectedRole.is_system && selectedRole.base_role === 'owner'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamRoles;
