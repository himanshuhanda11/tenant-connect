import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  ChevronRight,
  Circle,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { AgentPerformance } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface AgentPerformancePanelProps {
  agents: AgentPerformance[];
  isAdmin: boolean;
  loading?: boolean;
}

export function AgentPerformancePanel({ agents, isAdmin, loading }: AgentPerformancePanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {isAdmin ? 'Team Performance' : 'My Performance'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" className="gap-1">
                <RotateCcw className="w-4 h-4" />
                Rebalance
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/team')}>
              View Team <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No agents configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Open Chats</TableHead>
                  <TableHead className="text-center">Avg Response</TableHead>
                  <TableHead className="text-center">Resolved Today</TableHead>
                  <TableHead className="text-center">SLA Breaches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Circle
                          className={cn(
                            "w-2 h-2 fill-current",
                            agent.isOnline ? "text-green-500" : "text-gray-400"
                          )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {agent.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{agent.openChats}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{formatTime(agent.avgResponseTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{agent.resolvedToday}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {agent.slaBreaches > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {agent.slaBreaches}
                        </Badge>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
