import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Phone, MoreHorizontal, RefreshCw, Link2, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WhatsAppTabProps {
  phones: any[];
  isSuperAdmin: boolean;
}

const QUALITY_COLORS: Record<string, string> = {
  GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  YELLOW: 'bg-amber-50 text-amber-700 border-amber-200',
  RED: 'bg-red-50 text-red-700 border-red-200',
};

export function WhatsAppTab({ phones, isSuperAdmin }: WhatsAppTabProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          Phone Numbers ({phones.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phones.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-sm">{p.display_name || '—'}</TableCell>
                <TableCell className="font-mono text-sm">{p.phone_e164}</TableCell>
                <TableCell>
                  <AdminStatusBadge status={p.status === 'connected' ? 'connected' : 'pending'} />
                </TableCell>
                <TableCell>
                  {p.quality_rating ? (
                    <Badge variant="outline" className={`text-[11px] ${QUALITY_COLORS[p.quality_rating] || ''}`}>
                      {p.quality_rating}
                    </Badge>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.last_message_at ? new Date(p.last_message_at).toLocaleString() : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => toast({ title: 'Rechecking status...' })}>
                        <RefreshCw className="h-3.5 w-3.5 mr-2" /> Recheck Status
                      </DropdownMenuItem>
                      {isSuperAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => toast({ title: 'Reconnect flow started' })}>
                            <Link2 className="h-3.5 w-3.5 mr-2" /> Reconnect Flow
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: 'Marked as verified' })}>
                            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Mark as Verified
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {phones.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                  No phone numbers connected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
