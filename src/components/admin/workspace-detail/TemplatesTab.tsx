import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const STATUS_MAP: Record<string, 'active' | 'suspended' | 'pending'> = {
  APPROVED: 'active',
  REJECTED: 'suspended',
  PENDING: 'pending',
  IN_APPEAL: 'pending',
};

interface Props { workspaceId?: string; templates?: any[] }

export function TemplatesTab({ workspaceId, templates: templatesProp }: Props = {}) {
  const [filter, setFilter] = useState<string>('all');

  const { data: fetched = [], isLoading } = useQuery({
    queryKey: ['admin-templates', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from('templates')
        .select('id, name, category, status, language, updated_at')
        .eq('tenant_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!workspaceId && !templatesProp,
  });

  const templates = templatesProp ?? fetched;

  const filtered = templates.filter((t: any) => filter === 'all' || t.status === filter);

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          Templates ({templates.length})
        </CardTitle>
        <div className="flex rounded-xl border overflow-hidden text-xs">
          {['all', 'APPROVED', 'PENDING', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {f === 'all' ? 'All' : f.toLowerCase()}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {templates.length === 0 ? 'No templates for this workspace' : 'No templates match the filter'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-sm font-mono">{t.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">{t.category}</Badge></TableCell>
                  <TableCell className="text-xs">{t.language}</TableCell>
                  <TableCell><AdminStatusBadge status={STATUS_MAP[t.status] || 'pending'} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
