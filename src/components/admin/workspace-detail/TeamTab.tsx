import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UserManagementActions from '@/components/admin/UserManagementActions';
import { Users, UserPlus } from 'lucide-react';

interface TeamTabProps {
  members: any[];
  isSuperAdmin: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700 border-amber-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  agent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  analyst: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function TeamTab({ members, isSuperAdmin }: TeamTabProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-blue-600" />
          </div>
          Team Members ({members.length})
        </CardTitle>
        <Button variant="outline" size="sm" className="rounded-xl text-xs" disabled>
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite User
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {isSuperAdmin && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium text-sm">{m.profiles?.full_name || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.profiles?.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[11px] ${ROLE_COLORS[m.role] || ''}`}>
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                {isSuperAdmin && (
                  <TableCell><UserManagementActions member={m} isSuperAdmin={isSuperAdmin} /></TableCell>
                )}
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground text-sm">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
