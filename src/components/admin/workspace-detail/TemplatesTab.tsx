import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { MessageSquare, ExternalLink, Filter } from 'lucide-react';

const STATUS_MAP: Record<string, 'active' | 'suspended' | 'pending'> = {
  APPROVED: 'active',
  REJECTED: 'suspended',
  PENDING: 'pending',
  IN_APPEAL: 'pending',
};

const MOCK_TEMPLATES = [
  { id: '1', name: 'welcome_message', category: 'MARKETING', status: 'APPROVED', updated_at: new Date().toISOString() },
  { id: '2', name: 'order_confirmation', category: 'UTILITY', status: 'PENDING', updated_at: new Date().toISOString() },
  { id: '3', name: 'promo_summer', category: 'MARKETING', status: 'REJECTED', updated_at: new Date().toISOString() },
];

export function TemplatesTab() {
  const [filter, setFilter] = useState<string>('all');
  const templates = MOCK_TEMPLATES.filter(t => filter === 'all' || t.status === filter);

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          Templates
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border overflow-hidden text-xs">
            {['all', 'PENDING', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                {f === 'all' ? 'All' : f.toLowerCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl text-xs">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Template Module
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-sm font-mono">{t.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px]">{t.category}</Badge>
                </TableCell>
                <TableCell>
                  <AdminStatusBadge status={STATUS_MAP[t.status] || 'pending'} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No templates match the filter</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
