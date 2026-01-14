import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Clock,
  Target,
  Crown,
  Award,
} from 'lucide-react';

interface AgentStats {
  openChats: number;
  resolvedToday: number;
  avgResponseTime: string;
  csat: number;
  pendingTasks: number;
  streak: number;
}

interface ManagerStats {
  teamSize: number;
  onlineAgents: number;
  avgTeamResponseTime: string;
  slaCompliance: number;
  escalations: number;
  topPerformer: { name: string; score: number };
}

interface AdminStats {
  monthlyRevenue: number;
  revenueChange: number;
  totalConversations: number;
  attributionBreakdown: { source: string; value: number; percentage: number }[];
  usageCosts: number;
  planUtilization: number;
}

interface RoleBasedDashboardProps {
  role: 'admin' | 'manager' | 'agent';
  adminStats?: AdminStats;
  managerStats?: ManagerStats;
  agentStats?: AgentStats;
  loading?: boolean;
}

export function RoleBasedDashboard({ 
  role, 
  adminStats, 
  managerStats, 
  agentStats,
  loading 
}: RoleBasedDashboardProps) {
  const navigate = useNavigate();

  if (role === 'admin' && adminStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue Attribution
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ₹{(adminStats.monthlyRevenue / 100000).toFixed(1)}L
              </span>
              <span className={`text-sm flex items-center ${
                adminStats.revenueChange >= 0 ? 'text-emerald-500' : 'text-destructive'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  adminStats.revenueChange < 0 ? 'rotate-180' : ''
                }`} />
                {Math.abs(adminStats.revenueChange)}%
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {adminStats.attributionBreakdown.map((item) => (
                <div key={item.source} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.source}</span>
                      <span className="font-medium">₹{(item.value / 1000).toFixed(0)}K</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage & Costs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats.planUtilization}%
            </div>
            <p className="text-xs text-muted-foreground mb-4">of plan utilized</p>
            <Progress value={adminStats.planUtilization} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Meta costs: ₹{(adminStats.usageCosts / 1000).toFixed(0)}K</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                View breakdown
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats.totalConversations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mb-4">this billing cycle</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/inbox')}
            >
              View Inbox
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === 'manager' && managerStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Team Overview */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Performance
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Manager
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">
                  {managerStats.onlineAgents}/{managerStats.teamSize}
                </div>
                <p className="text-xs text-muted-foreground">agents online</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-500">
                  {managerStats.slaCompliance}%
                </div>
                <p className="text-xs text-muted-foreground">SLA compliance</p>
              </div>
            </div>
            
            {/* Top Performer */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Top Performer Today</div>
                  <div className="text-xs text-muted-foreground">
                    {managerStats.topPerformer.name} • Score: {managerStats.topPerformer.score}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {managerStats.avgTeamResponseTime}
            </div>
            <p className="text-xs text-muted-foreground mb-4">team average</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/team/overview')}
            >
              View Team
            </Button>
          </CardContent>
        </Card>

        {/* Escalations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              managerStats.escalations > 0 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {managerStats.escalations}
            </div>
            <p className="text-xs text-muted-foreground mb-4">pending review</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/inbox?escalated=true')}
              disabled={managerStats.escalations === 0}
            >
              Review Escalations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === 'agent' && agentStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* My Open Chats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Open Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.openChats}</div>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs mt-2"
              onClick={() => navigate('/inbox?view=mine')}
            >
              View inbox →
            </Button>
          </CardContent>
        </Card>

        {/* Resolved Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {agentStats.resolvedToday}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Great work! 🎉
            </p>
          </CardContent>
        </Card>

        {/* Avg Response */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Within SLA ✓
            </p>
          </CardContent>
        </Card>

        {/* CSAT */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My CSAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.csat}%</div>
            <Progress value={agentStats.csat} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-background border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              🔥 Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {agentStats.streak} days
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
