import { useState } from 'react';
import { useAgentPerformance } from '@/hooks/useAgentPerformance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  RefreshCw, Loader2, Activity, Clock, MessageSquare, 
  MousePointerClick, Reply, UserCheck, TrendingUp, Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AgentPerformanceTable() {
  const [days, setDays] = useState(7);
  const { agents, loading, refetch } = useAgentPerformance(days);

  const topPerformer = agents.length > 0 
    ? agents.reduce((best, a) => a.chats_replied > best.chats_replied ? a : best, agents[0])
    : null;

  const totalReplies = agents.reduce((sum, a) => sum + a.chats_replied, 0);
  const totalOpened = agents.reduce((sum, a) => sum + a.chats_opened, 0);
  const totalHours = agents.reduce((sum, a) => sum + a.total_hours_worked, 0);
  const onlineCount = agents.filter(a => a.is_online).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineCount}</p>
                <p className="text-xs text-muted-foreground">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours.toFixed(0)}h</p>
                <p className="text-xs text-muted-foreground">Total Hours ({days}d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Reply className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReplies}</p>
                <p className="text-xs text-muted-foreground">Total Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <MousePointerClick className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOpened}</p>
                <p className="text-xs text-muted-foreground">Chats Opened</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer */}
      {topPerformer && topPerformer.chats_replied > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={topPerformer.avatar_url || ''} />
                <AvatarFallback>{topPerformer.agent_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{topPerformer.agent_name}</p>
                <p className="text-sm text-muted-foreground">
                  Top performer — {topPerformer.chats_replied} replies, {topPerformer.total_hours_worked.toFixed(1)}h worked in {days} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Agent Performance
              </CardTitle>
              <CardDescription>Detailed activity metrics per agent</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Agent Data</h3>
              <p className="text-muted-foreground text-sm">Agent activity will appear here once agents start working.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Hours
                        </TooltipTrigger>
                        <TooltipContent>Total hours worked in period</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" /> Opened
                        </TooltipTrigger>
                        <TooltipContent>Chats opened/clicked</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <Reply className="h-3 w-3" /> Replied
                        </TooltipTrigger>
                        <TooltipContent>Messages sent/replied</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Claimed
                        </TooltipTrigger>
                        <TooltipContent>Leads claimed/picked up</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead>Converted</TableHead>
                    <TableHead>Open Chats</TableHead>
                    <TableHead>Avg Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => {
                    const replyRate = agent.chats_opened > 0 
                      ? Math.round((agent.chats_replied / agent.chats_opened) * 100) 
                      : 0;
                    
                    return (
                      <TableRow key={agent.agent_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={agent.avatar_url || ''} />
                                <AvatarFallback className="text-xs">
                                  {agent.agent_name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span 
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                                  agent.is_online ? 'bg-green-500' : 'bg-muted-foreground/40'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{agent.agent_name}</p>
                              <p className="text-xs text-muted-foreground">{agent.agent_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={agent.is_online ? 'default' : 'secondary'}
                            className={agent.is_online ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {agent.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {agent.last_login_at 
                            ? formatDistanceToNow(new Date(agent.last_login_at), { addSuffix: true })
                            : '—'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="font-mono text-sm font-semibold">
                              {agent.total_hours_worked.toFixed(1)}h
                            </span>
                            <p className="text-xs text-muted-foreground">
                              ~{agent.avg_daily_hours.toFixed(1)}h/day
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{agent.chats_opened}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="font-mono text-sm font-semibold">{agent.chats_replied}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={replyRate} className="h-1.5 w-16" />
                              <span className="text-xs text-muted-foreground">{replyRate}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{agent.conversations_claimed}</TableCell>
                        <TableCell>
                          <Badge variant={agent.conversations_converted > 0 ? 'default' : 'secondary'} className={agent.conversations_converted > 0 ? 'bg-green-600' : ''}>
                            {agent.conversations_converted}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-sm">{agent.current_open_chats}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-mono text-sm ${
                            agent.avg_response_minutes > 30 ? 'text-red-600' : 
                            agent.avg_response_minutes > 10 ? 'text-amber-600' : 
                            'text-green-600'
                          }`}>
                            {agent.avg_response_minutes > 0 ? `${agent.avg_response_minutes.toFixed(0)}m` : '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
