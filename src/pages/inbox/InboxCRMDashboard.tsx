import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInboxCRMStats } from '@/hooks/useInboxCRM';
import { 
  Inbox, CalendarClock, AlertTriangle, CheckCircle2, 
  Users, UserX, TrendingUp, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statCards = [
  { key: 'new_today', label: 'New Today', icon: Inbox, color: 'text-blue-600', bgColor: 'bg-blue-50', link: '/inbox/new-today' },
  { key: 'followup_today', label: 'Follow-up Today', icon: CalendarClock, color: 'text-amber-600', bgColor: 'bg-amber-50', link: '/inbox/followup-today' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', link: '/inbox/overdue' },
  { key: 'converted_month', label: 'Converted This Month', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', link: '/inbox/converted' },
] as const;

export default function InboxCRMDashboard() {
  const { stats, agentPerformance, loading } = useInboxCRMStats();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your team's inbox performance</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <Card 
              key={card.key} 
              className="cursor-pointer hover:shadow-md transition-shadow border-border/50"
              onClick={() => navigate(card.link)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold tracking-tight">
                        {stats?.[card.key] ?? 0}
                      </p>
                    )}
                  </div>
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", card.bgColor)}>
                    <card.icon className={cn("h-6 w-6", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Open</p>
                <p className="text-xl font-bold">{loading ? '...' : stats?.total_open ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <UserX className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unassigned</p>
                <p className="text-xl font-bold">{loading ? '...' : stats?.unassigned ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Agent Performance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="text-center">Converted</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : agentPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      No agent data available
                    </TableCell>
                  </TableRow>
                ) : (
                  agentPerformance.map(agent => (
                    <TableRow key={agent.agent_id}>
                      <TableCell className="font-medium text-sm">{agent.agent_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">{agent.assigned_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">{agent.converted_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">{agent.pending_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {agent.overdue_count > 0 ? (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">{agent.overdue_count}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
