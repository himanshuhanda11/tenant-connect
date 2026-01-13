import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserPlus, Shield, UsersRound, Route, Clock, 
  FileText, AlertTriangle, MessageSquare, CheckCircle2, 
  Activity, Settings 
} from 'lucide-react';
import { useTeamStats, useTeams } from '@/hooks/useTeam';

const TeamOverview = () => {
  const { stats, loading: statsLoading } = useTeamStats();
  const { teams, loading: teamsLoading } = useTeams();

  const statCards = [
    {
      title: 'Total Members',
      value: stats?.total_members || 0,
      subtitle: `${stats?.active_members || 0} active, ${stats?.invited_members || 0} invited`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Online Now',
      value: stats?.online_now || 0,
      subtitle: 'Currently available',
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Avg First Response',
      value: `${stats?.avg_first_response_minutes || 0}m`,
      subtitle: 'Last 7 days',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      title: 'Open Conversations',
      value: stats?.open_conversations || 0,
      subtitle: 'Across all teams',
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'SLA Breaches',
      value: stats?.sla_breaches_today || 0,
      subtitle: 'Today',
      icon: AlertTriangle,
      color: stats?.sla_breaches_today ? 'text-red-600' : 'text-green-600',
      bg: stats?.sla_breaches_today ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  const quickActions = [
    { label: 'Invite Member', icon: UserPlus, href: '/team/members', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Create Role', icon: Shield, href: '/team/roles', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Create Team', icon: UsersRound, href: '/team/groups', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Configure Routing', icon: Route, href: '/team/routing', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  const navLinks = [
    { label: 'Members', description: 'Manage team members and their access', icon: Users, href: '/team/members' },
    { label: 'Roles & Permissions', description: 'Configure roles and access control', icon: Shield, href: '/team/roles' },
    { label: 'Teams (Groups)', description: 'Organize members into teams', icon: UsersRound, href: '/team/groups' },
    { label: 'Routing & Assignment', description: 'Set up conversation routing rules', icon: Route, href: '/team/routing' },
    { label: 'Working Hours & SLA', description: 'Configure business hours and SLA targets', icon: Clock, href: '/team/sla' },
    { label: 'Activity & Audit Logs', description: 'View security and activity logs', icon: FileText, href: '/team/audit' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Overview</h1>
            <p className="text-muted-foreground">Manage your team, roles, and routing</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common team management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Button key={action.label} asChild className={action.color}>
                  <Link to={action.href}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teams Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teams</CardTitle>
              <CardDescription>Your team groups</CardDescription>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8">
                  <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-3">No teams created yet</p>
                  <Button asChild>
                    <Link to="/team/groups">Create Team</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.slice(0, 5).map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.member_count || 0} members
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{team.default_routing_strategy}</Badge>
                    </div>
                  ))}
                  {teams.length > 5 && (
                    <Button variant="ghost" asChild className="w-full">
                      <Link to="/team/groups">View all {teams.length} teams</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Settings</CardTitle>
              <CardDescription>Configure your team module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamOverview;
