import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Phone, Search, Loader2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface PhoneRecord {
  id: string;
  workspace_id: string;
  workspace_name: string;
  phone_e164: string;
  status: string;
  quality_rating: string | null;
  messaging_limit: number | null;
  provider: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPhoneNumbers() {
  const { role } = useOutletContext<{ role: string }>();
  const { get, loading } = useAdminApi();
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPhones = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.set('search', search);
      const data = await get(`phone-numbers?${params}`);
      setPhones(data.phones || []);
      setTotal(data.total || 0);
    } catch {}
  }, [page, search]);

  useEffect(() => { loadPhones(); }, [loadPhones]);

  const totalPages = Math.ceil(total / 25);

  const qualityColor = (q: string | null) => {
    if (!q) return '';
    const map: Record<string, string> = {
      GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      YELLOW: 'bg-amber-50 text-amber-700 border-amber-200',
      RED: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[q] || '';
  };

  const statusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    if (status === 'suspended') return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
    return <Clock className="h-3.5 w-3.5 text-amber-500" />;
  };

  // Stats
  const activeCount = phones.filter(p => p.status === 'active').length;
  const pendingCount = phones.filter(p => p.status === 'pending').length;
  const redQuality = phones.filter(p => p.quality_rating === 'RED').length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Phone Numbers</h1>
        <Badge variant="outline" className="text-xs">{total} total</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{redQuality}</div>
              <div className="text-xs text-muted-foreground">Red Quality</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by number or workspace..."
          className="pl-9 h-9 rounded-xl bg-card"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Connected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phones.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm font-medium">{p.phone_e164}</TableCell>
                    <TableCell className="text-sm">{p.workspace_name || p.workspace_id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(p.status)}
                        <span className="text-xs capitalize">{p.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.quality_rating ? (
                        <Badge variant="outline" className={`text-[11px] ${qualityColor(p.quality_rating)}`}>
                          {p.quality_rating}
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{p.provider}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {phones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No phone numbers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
