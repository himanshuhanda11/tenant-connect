import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Shield, Plus, Eye, EyeOff, Check, ChevronRight,
  MessageSquare, Users, FileText, Send, Zap,
  Link2, CreditCard, Lock, Phone, UsersRound, Megaphone,
  Loader2, Save, RefreshCw
} from 'lucide-react';
import { useRoles } from '@/hooks/useTeam';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Permission, Role, PermissionCategory, AppRole } from '@/types/team';

const CATEGORY_META: Record<PermissionCategory, { icon: React.ReactNode; label: string; description: string }> = {
  messaging: { icon: <MessageSquare className="h-4 w-4" />, label: 'Messaging', description: 'Inbox & conversation access' },
  contacts: { icon: <Users className="h-4 w-4" />, label: 'Contacts', description: 'CRM & contact management' },
  templates: { icon: <FileText className="h-4 w-4" />, label: 'Templates', description: 'WhatsApp message templates' },
  campaigns: { icon: <Send className="h-4 w-4" />, label: 'Campaigns', description: 'Broadcast & campaign tools' },
  automation: { icon: <Zap className="h-4 w-4" />, label: 'Automation', description: 'Workflow automations' },
  integrations: { icon: <Link2 className="h-4 w-4" />, label: 'Integrations', description: 'Third-party connections' },
  billing: { icon: <CreditCard className="h-4 w-4" />, label: 'Billing', description: 'Plan & payment settings' },
  security: { icon: <Lock className="h-4 w-4" />, label: 'Security', description: 'Audit logs & access controls' },
  phone_numbers: { icon: <Phone className="h-4 w-4" />, label: 'Phone Numbers', description: 'WABA number management' },
  team: { icon: <UsersRound className="h-4 w-4" />, label: 'Team', description: 'Members, roles & routing' },
  meta_ads: { icon: <Megaphone className="h-4 w-4" />, label: 'Meta Ads', description: 'Ad campaigns & attribution' },
};

const CATEGORY_ORDER: PermissionCategory[] = [
  'messaging', 'contacts', 'templates', 'campaigns', 'automation',
  'meta_ads', 'integrations', 'phone_numbers', 'team', 'billing', 'security',
];

const TeamRoles = () => {
  const { roles, permissions, loading, createRole, updateRole, deleteRole, getRolePermissions, refetch } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<PermissionCategory>('messaging');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewAsMode, setViewAsMode] = useState(false);
  const [newRole, setNewRole] = useState<{ name: string; description: string; base_role: AppRole; color: string }>({
    name: '', description: '', base_role: 'agent', color: '#6366f1'
  });
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  // Group permissions by category (ordered)
  const permissionsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const perms = permissions.filter(p => p.category === cat);
    if (perms.length > 0) acc[cat] = perms;
    return acc;
  }, {} as Record<PermissionCategory, Permission[]>);

  const categories = Object.keys(permissionsByCategory) as PermissionCategory[];

  const loadPermissions = useCallback(async (roleId: string) => {
    const perms = await getRolePermissions(roleId);
    setRolePermissions(perms);
    setOriginalPermissions(perms);
  }, [getRolePermissions]);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions(selectedRole.id);
    }
  }, [selectedRole, loadPermissions]);

  // Auto-select first role
  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setViewAsMode(false);
    setActiveCategory('messaging');
  };

  const handleTogglePermission = (permId: string) => {
    setRolePermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const hasUnsavedChanges = JSON.stringify([...rolePermissions].sort()) !== JSON.stringify([...originalPermissions].sort());

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const success = await updateRole(selectedRole.id, {}, rolePermissions);
      if (success) {
        setOriginalPermissions([...rolePermissions]);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;
    setSubmitting(true);
    try {
      const success = await createRole(newRole, newRolePermissions);
      if (success) {
        setShowCreateModal(false);
        setNewRole({ name: '', description: '', base_role: 'agent', color: '#6366f1' });
        setNewRolePermissions([]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleNewRolePermission = (permId: string) => {
    setNewRolePermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleCategoryAll = (category: PermissionCategory, perms: Permission[]) => {
    const allEnabled = perms.every(p => rolePermissions.includes(p.id));
    if (allEnabled) {
      setRolePermissions(prev => prev.filter(id => !perms.find(p => p.id === id)));
    } else {
      setRolePermissions(prev => [...new Set([...prev, ...perms.map(p => p.id)])]);
    }
  };

  const enabledCount = rolePermissions.length;
  const totalCount = permissions.length;

  const activePerms = permissionsByCategory[activeCategory] || [];
  const activeCategoryAllEnabled = activePerms.length > 0 && activePerms.every(p => rolePermissions.includes(p.id));
  const isOwnerRole = selectedRole?.is_system && selectedRole?.base_role === 'owner';

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-7xl mx-auto">
        <TeamBreadcrumb currentPage="Roles & Permissions" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure access control for each role in your workspace
            </p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a custom role with specific permissions for your team
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
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Role</Label>
                    <Select
                      value={newRole.base_role}
                      onValueChange={(v) => setNewRole({ ...newRole, base_role: v as AppRole })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
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
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'].map(c => (
                      <button
                        key={c}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform",
                          newRole.color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewRole({ ...newRole, color: c })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <ScrollArea className="h-64 border rounded-xl p-3">
                    <div className="space-y-4">
                      {Object.entries(permissionsByCategory).map(([category, perms]) => {
                        const meta = CATEGORY_META[category as PermissionCategory];
                        return (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-muted-foreground">{meta.icon}</span>
                              <span className="font-medium text-sm">{meta.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 pl-6">
                              {perms.map(perm => (
                                <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={newRolePermissions.includes(perm.id)}
                                    onChange={() => handleToggleNewRolePermission(perm.id)}
                                    className="rounded accent-primary"
                                  />
                                  {perm.name}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting} className="rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={!newRole.name.trim() || submitting} className="rounded-xl gap-2">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Roles Sidebar */}
          <Card className="lg:col-span-3 rounded-2xl border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Roles
              </CardTitle>
              <CardDescription className="text-xs">{roles.length} configured</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="px-2 pb-2 space-y-1">
                    {roles.map((role) => {
                      const isSelected = selectedRole?.id === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => handleSelectRole(role)}
                          className={cn(
                            "w-full p-3 rounded-xl text-left transition-all duration-150 group",
                            isSelected
                              ? 'bg-primary/10 border border-primary/20 shadow-sm'
                              : 'hover:bg-muted/60 border border-transparent'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background"
                              style={{ backgroundColor: role.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn("font-medium text-sm truncate", isSelected && "text-primary")}>
                                {role.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground capitalize">{role.base_role}</p>
                            </div>
                            {role.is_system && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 flex-shrink-0">System</Badge>
                            )}
                            <ChevronRight className={cn(
                              "h-3.5 w-3.5 text-muted-foreground/50 transition-transform flex-shrink-0",
                              isSelected && "text-primary rotate-90"
                            )} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <div className="lg:col-span-9 space-y-4">
            {!selectedRole ? (
              <Card className="rounded-2xl border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Select a role to manage permissions</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Click any role on the left to get started</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Role Header Bar */}
                <Card className="rounded-2xl border-border/50">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                        style={{ backgroundColor: selectedRole.color }}
                      >
                        {selectedRole.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-base">{selectedRole.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {enabledCount} of {totalCount} permissions enabled
                          {selectedRole.description && ` · ${selectedRole.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewAsMode ? "default" : "outline"}
                            size="sm"
                            className="gap-1.5 rounded-xl text-xs"
                            onClick={() => setViewAsMode(!viewAsMode)}
                          >
                            {viewAsMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {viewAsMode ? 'Exit Preview' : 'View as Role'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview what this role can see</TooltipContent>
                      </Tooltip>

                      {hasUnsavedChanges && !isOwnerRole && (
                        <Button
                          size="sm"
                          className="gap-1.5 rounded-xl text-xs shadow-lg shadow-primary/20"
                          onClick={handleSavePermissions}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* View-as-Role Preview */}
                {viewAsMode && (
                  <Card className="rounded-2xl border-primary/30 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm text-primary">Role Preview — {selectedRole.name}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {categories.map(cat => {
                          const meta = CATEGORY_META[cat];
                          const perms = permissionsByCategory[cat] || [];
                          const enabledPerms = perms.filter(p => rolePermissions.includes(p.id));
                          const hasAccess = enabledPerms.length > 0;
                          return (
                            <div
                              key={cat}
                              className={cn(
                                "p-3 rounded-xl border transition-colors",
                                hasAccess
                                  ? "bg-background border-primary/20"
                                  : "bg-muted/30 border-border/30 opacity-50"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className={hasAccess ? "text-primary" : "text-muted-foreground"}>{meta.icon}</span>
                                <span className="text-xs font-medium">{meta.label}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {hasAccess ? `${enabledPerms.length}/${perms.length} permissions` : 'No access'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Category Tabs + Permissions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Category Nav */}
                  <Card className="lg:col-span-4 rounded-2xl border-border/50 overflow-hidden">
                    <CardContent className="p-2">
                      <ScrollArea className="h-[420px]">
                        <div className="space-y-0.5">
                          {categories.map(cat => {
                            const meta = CATEGORY_META[cat];
                            const perms = permissionsByCategory[cat] || [];
                            const enabledPerms = perms.filter(p => rolePermissions.includes(p.id));
                            const isActive = activeCategory === cat;
                            return (
                              <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                  isActive
                                    ? "bg-primary/10 border border-primary/15"
                                    : "hover:bg-muted/50 border border-transparent"
                                )}
                              >
                                <span className={cn(
                                  "p-1.5 rounded-lg",
                                  isActive ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"
                                )}>
                                  {meta.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-sm font-medium", isActive && "text-primary")}>{meta.label}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                                </div>
                                <Badge
                                  variant={enabledPerms.length === perms.length ? "default" : "secondary"}
                                  className="text-[10px] h-5 px-1.5 flex-shrink-0"
                                >
                                  {enabledPerms.length}/{perms.length}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Permission Toggles */}
                  <Card className="lg:col-span-8 rounded-2xl border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{CATEGORY_META[activeCategory]?.icon}</span>
                          <CardTitle className="text-base">{CATEGORY_META[activeCategory]?.label}</CardTitle>
                        </div>
                        {!isOwnerRole && activePerms.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 gap-1.5"
                            onClick={() => handleToggleCategoryAll(activeCategory, activePerms)}
                          >
                            {activeCategoryAllEnabled ? (
                              <>Disable All</>
                            ) : (
                              <>Enable All</>
                            )}
                          </Button>
                        )}
                      </div>
                      <CardDescription className="text-xs">{CATEGORY_META[activeCategory]?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[365px]">
                        <div className="space-y-2 pr-3">
                          {activePerms.map(perm => {
                            const isEnabled = rolePermissions.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                className={cn(
                                  "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                                  isEnabled
                                    ? "bg-primary/5 border-primary/15"
                                    : "bg-background border-border/40 hover:border-border"
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={cn(
                                    "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0",
                                    isEnabled ? "bg-primary/15" : "bg-muted/60"
                                  )}>
                                    {isEnabled
                                      ? <Check className="h-3.5 w-3.5 text-primary" />
                                      : <Lock className="h-3 w-3 text-muted-foreground/50" />
                                    }
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium">{perm.name}</p>
                                    {perm.description && (
                                      <p className="text-[11px] text-muted-foreground truncate">{perm.description}</p>
                                    )}
                                  </div>
                                </div>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={() => handleTogglePermission(perm.id)}
                                  disabled={isOwnerRole}
                                />
                              </div>
                            );
                          })}
                          {activePerms.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground text-sm">
                              No permissions in this category
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamRoles;
