import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plug, MoreHorizontal, RotateCcw, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HEALTH_STYLES: Record<string, string> = {
  Connected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Error: 'bg-red-50 text-red-700 border-red-200',
  Disconnected: 'bg-slate-100 text-slate-500 border-slate-200',
};

const MOCK_INTEGRATIONS = [
  { id: '1', name: 'Razorpay', health: 'Connected', last_event: '2 min ago' },
  { id: '2', name: 'HubSpot', health: 'Error', last_event: '1h ago' },
  { id: '3', name: 'Shopify', health: 'Disconnected', last_event: '—' },
  { id: '4', name: 'Zapier', health: 'Connected', last_event: '5 min ago' },
];

interface IntegrationsTabProps {
  isSuperAdmin: boolean;
}

export function IntegrationsTab({ isSuperAdmin }: IntegrationsTabProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <Plug className="h-3.5 w-3.5 text-violet-600" />
          </div>
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Integration</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Last Event</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_INTEGRATIONS.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium text-sm">{i.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[11px] ${HEALTH_STYLES[i.health] || ''}`}>
                    {i.health}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{i.last_event}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => toast({ title: 'Replaying last webhook...' })}>
                        <RotateCcw className="h-3.5 w-3.5 mr-2" /> Replay Last Webhook
                      </DropdownMenuItem>
                      {isSuperAdmin && (
                        <DropdownMenuItem onClick={() => toast({ title: 'Secret rotated' })}>
                          <KeyRound className="h-3.5 w-3.5 mr-2" /> Rotate Secret
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
