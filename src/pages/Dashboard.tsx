import React from 'react';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';

const stats = [
  {
    title: 'Total Conversations',
    value: '0',
    change: '+0%',
    icon: MessageSquare,
    description: 'This month',
  },
  {
    title: 'Active Users',
    value: '0',
    change: '+0%',
    icon: Users,
    description: 'Team members',
  },
  {
    title: 'Response Rate',
    value: '0%',
    change: '+0%',
    icon: TrendingUp,
    description: 'Average',
  },
  {
    title: 'Avg Response Time',
    value: '0m',
    change: '-0%',
    icon: Clock,
    description: 'This week',
  },
];

export default function Dashboard() {
  const { currentTenant, currentRole } = useTenant();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to {currentTenant?.name}. Here's your overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card hover:shadow-soft transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary">{stat.change}</span> {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Connect WhatsApp Business
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Invite Team Members
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your workspace
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No recent activity</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Activity from your team will appear here once you start using the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="shadow-card border-primary/20 bg-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              Getting Started
            </CardTitle>
            <CardDescription>
              Complete these steps to set up your WhatsApp Business integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-sm">Connect Account</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Link your WhatsApp Business account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-sm">Invite Team</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add agents to handle conversations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-sm">Start Messaging</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Begin engaging with customers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
