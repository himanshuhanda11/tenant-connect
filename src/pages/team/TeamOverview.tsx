import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, UserPlus, Shield, UsersRound, Route, Clock, 
  FileText, AlertTriangle, MessageSquare, Activity, 
  ArrowRight, CheckCircle2, Sparkles, Info, TrendingUp
} from 'lucide-react';
import { useTeamStats, useTeams, useTeamMembers, useRoles } from '@/hooks/useTeam';
import { TeamGuideCard } from '@/components/team/TeamGuideCard';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TeamOverview = () => {
  const { stats, loading: statsLoading } = useTeamStats();
  const { teams, loading: teamsLoading } = useTeams();
  const { members } = useTeamMembers();
  const { roles } = useRoles();

  // Calculate setup progress
  const setupSteps = [
    { label: 'Create your first role', done: roles.length > 0 },
    { label: 'Invite team members', done: members.length > 1 },
    { label: 'Create a team group', done: teams.length > 0 },
    { label: 'Configure routing rules', done: false }, // Would check routing_rules
  ];
  const completedSteps = setupSteps.filter(s => s.done).length;
  const setupProgress = (completedSteps / setupSteps.length) * 100;

  const statCards = [
    {
      title: 'Total Members',
      value: stats?.total_members || 0,
      subtitle: `${stats?.active_members || 0} active`,
      change: stats?.invited_members ? `+${stats.invited_members} pending` : null,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/team/members',
    },
    {
      title: 'Online Now',
      value: stats?.online_now || 0,
      subtitle: 'Currently available',
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      href: '/team/members',
    },
    {
      title: 'Avg Response Time',
      value: stats?.avg_first_response_minutes ? `${stats.avg_first_response_minutes}m` : '—',
      subtitle: 'Last 7 days',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      href: '/team/sla',
    },
    {
      title: 'Open Conversations',
      value: stats?.open_conversations || 0,
      subtitle: 'Across all teams',
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      href: '/inbox',
    },
    {
      title: 'SLA Breaches',
      value: stats?.sla_breaches_today || 0,
      subtitle: 'Today',
      icon: AlertTriangle,
      color: stats?.sla_breaches_today ? 'text-red-600' : 'text-green-600',
      bg: stats?.sla_breaches_today ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
      href: '/team/sla',
    },
  ];

  const quickActions = [
    { label: 'Invite Member', description: 'Add new team member', icon: UserPlus, href: '/team/members', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Create Role', description: 'Define permissions', icon: Shield, href: '/team/roles', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Create Team', description: 'Organize members', icon: UsersRound, href: '/team/groups', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Setup Routing', description: 'Auto-assign chats', icon: Route, href: '/team/routing', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  const navLinks = [
    { label: 'Members', description: 'Manage team members, invites, and access levels', icon: Users, href: '/team/members', count: stats?.total_members },
    { label: 'Roles & Permissions', description: 'Create custom roles with granular permissions', icon: Shield, href: '/team/roles', count: roles.length },
    { label: 'Teams (Groups)', description: 'Organize members into functional teams', icon: UsersRound, href: '/team/groups', count: teams.length },
    { label: 'Routing & Assignment', description: 'Configure auto-assignment and routing rules', icon: Route, href: '/team/routing' },
    { label: 'Working Hours & SLA', description: 'Set business hours and response time targets', icon: Clock, href: '/team/sla' },
    { label: 'Audit Logs', description: 'Track all team actions and changes', icon: FileText, href: '/team/audit' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <TeamBreadcrumb currentPage="Overview" />
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members, roles, permissions, and routing
            </p>
          </div>
          <Button asChild>
            <Link to="/team/members">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Link>
          </Button>
        </div>

        {/* Setup Progress (show if not complete) */}
        {completedSteps < setupSteps.length && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Complete your team setup</h3>
                    <span className="text-sm text-muted-foreground">{completedSteps}/{setupSteps.length} steps</span>
                  </div>
                  <Progress value={setupProgress} className="h-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {setupSteps.map((step, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      step.done ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${step.done ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${step.done ? 'text-green-700 dark:text-green-300' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guide Card */}
        <TeamGuideCard
          title="Getting Started with Team Management"
          description="Set up your team structure to efficiently handle customer conversations at scale."
          tips={[
            "Create roles to define what each team member can access",
            "Organize members into teams (e.g., Sales, Support)",
            "Set up routing rules to auto-assign conversations",
            "Configure SLA targets to monitor response times"
          ]}
          dismissKey="team-overview-guide"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                          </TooltipTrigger>
                          <TooltipContent>Click to view details</TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-2xl font-bold mt-1 group-hover:text-primary transition-colors">
                        {statsLoading ? '...' : stat.value}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                        {stat.change && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {stat.change}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common team management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link 
                  key={action.label} 
                  to={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                >
                  <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Teams Overview */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Teams</CardTitle>
                  <CardDescription>{teams.length} team{teams.length !== 1 ? 's' : ''} configured</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/team/groups">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8">
                  <UsersRound className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No teams created yet</p>
                  <Button asChild size="sm">
                    <Link to="/team/groups">
                      <UsersRound className="mr-2 h-4 w-4" />
                      Create Team
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {teams.slice(0, 4).map((team) => (
                    <Link
                      key={team.id}
                      to="/team/groups"
                      className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <p className="font-medium text-sm">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.member_count || 0} member{team.member_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {team.default_routing_strategy?.replace('_', ' ')}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Team Settings</CardTitle>
              <CardDescription>Configure all aspects of your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{link.label}</p>
                        {link.count !== undefined && (
                          <Badge variant="secondary" className="text-xs">{link.count}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tips */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Pro Tips for Team Efficiency</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Use <strong>skill-based routing</strong> to match conversations with specialized agents</li>
                  <li>• Set up <strong>SLA alerts</strong> to prevent response time breaches</li>
                  <li>• Create <strong>overflow rules</strong> to handle peak hours automatically</li>
                  <li>• Review <strong>audit logs</strong> regularly for security compliance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeamOverview;
