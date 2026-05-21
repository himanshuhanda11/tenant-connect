import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  QrCode,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Power,
  TrendingUp,
  Users,
  Scan,
  Sparkles,
} from 'lucide-react';
import { useQrCampaigns, useQrAnalytics, type QrCampaign } from '@/hooks/useQrCampaigns';

function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export default function QrGeneratorList() {
  const navigate = useNavigate();
  const { list, update, remove } = useQrCampaigns();
  const { data: scans = [] } = useQrAnalytics();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const campaigns = list.data || [];
  const filtered = campaigns.filter((c) => c.campaign_name.toLowerCase().includes(search.toLowerCase()));

  const stats = useMemo(() => {
    const totalScans = campaigns.reduce((s, c) => s + (c.scan_count || 0), 0);
    const totalLeads = campaigns.reduce((s, c) => s + (c.lead_count || 0), 0);
    const conv = totalScans > 0 ? Math.round((totalLeads / totalScans) * 100) : 0;
    const best = [...campaigns].sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))[0];
    return { totalScans, totalLeads, conv, best };
  }, [campaigns]);

  const handleCopyLink = (c: QrCampaign) => {
    navigator.clipboard.writeText(c.qr_link);
    toast.success('Link copied');
  };

  const handleToggleStatus = async (c: QrCampaign) => {
    const status = c.status === 'active' ? 'inactive' : 'active';
    await update.mutateAsync({ id: c.id, status });
    toast.success(`QR ${status === 'active' ? 'activated' : 'deactivated'}`);
  };

  const handleDuplicate = async (c: QrCampaign) => {
    const { id, created_at, updated_at, scan_count, lead_count, slug, ...rest } = c as any;
    const newSlug = `${slug}-copy-${Math.random().toString(36).slice(2, 5)}`;
    const base = import.meta.env.VITE_SUPABASE_URL;
    await (await import('@/hooks/useQrCampaigns')).useQrCampaigns;
    // simpler — call create via list mutator
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('qr_campaigns' as any).insert({
      ...rest,
      slug: newSlug,
      qr_link: `${base}/functions/v1/qr-redirect/${newSlug}`,
      campaign_name: `${c.campaign_name} (copy)`,
      user_id: u.user!.id,
      scan_count: 0,
      lead_count: 0,
    } as any);
    list.refetch();
    toast.success('Duplicated');
  };

  const handleDownload = (c: QrCampaign) => {
    if (!c.qr_image_url) return toast.error('No image saved');
    const a = document.createElement('a');
    a.href = c.qr_image_url;
    a.download = `${c.campaign_name}.png`;
    a.click();
  };

  const handleExportCsv = () => {
    const rows = [
      ['Campaign', 'Slug', 'WhatsApp', 'Scans', 'Leads', 'Status', 'Created'],
      ...campaigns.map((c) => [
        c.campaign_name,
        c.slug,
        c.whatsapp_number,
        String(c.scan_count),
        String(c.lead_count),
        c.status,
        c.created_at,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              WhatsApp QR Code Generator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate trackable WhatsApp QR codes to capture leads instantly.
            </p>
          </div>
          <div className="flex gap-2">
            {campaigns.length > 0 && (
              <Button variant="outline" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            )}
            <Button
              onClick={() => navigate('/tools/qr-generator/create')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Create QR
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Scan} label="Total Scans" value={stats.totalScans} accent="from-emerald-500 to-teal-500" />
          <StatCard icon={Users} label="Leads Captured" value={stats.totalLeads} accent="from-blue-500 to-cyan-500" />
          <StatCard icon={TrendingUp} label="Conversion" value={`${stats.conv}%`} accent="from-violet-500 to-purple-500" />
          <StatCard icon={Sparkles} label="Best Campaign" value={stats.best?.campaign_name?.slice(0, 14) || '—'} accent="from-amber-500 to-orange-500" />
        </div>

        {/* Search */}
        {campaigns.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search QR campaigns…" className="pl-9" />
          </div>
        )}

        {/* List / Empty */}
        {list.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-4 p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
              <QrCode className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold">No QR codes yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Generate your first WhatsApp QR code and start capturing leads instantly.
            </p>
            <Button
              onClick={() => navigate('/tools/qr-generator/create')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first QR
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="group relative overflow-hidden p-5 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-1">
                    {c.qr_image_url ? (
                      <img src={c.qr_image_url} alt="QR" className="h-full w-full object-contain" />
                    ) : (
                      <QrCode className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-base font-semibold">{c.campaign_name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/tools/qr-generator/${c.id}`)}>
                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(c.qr_link, '_blank')}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(c)}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(c)}>
                            <Download className="mr-2 h-3.5 w-3.5" /> Download PNG
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(c)}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(c)}>
                            <Power className="mr-2 h-3.5 w-3.5" /> {c.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(c.id)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge
                      variant={c.status === 'active' ? 'default' : 'secondary'}
                      className={c.status === 'active' ? 'mt-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20' : 'mt-1'}
                    >
                      {c.status}
                    </Badge>
                    <p className="mt-2 truncate text-xs text-muted-foreground">{c.whatsapp_number}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/50 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Scans</p>
                    <p className="text-lg font-bold text-emerald-500">{c.scan_count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Leads</p>
                    <p className="text-lg font-bold">{c.lead_count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent scans */}
        {scans.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-base font-semibold">Recent scans</h3>
            <div className="space-y-2">
              {scans.slice(0, 10).map((s: any) => {
                const c = campaigns.find((x) => x.id === s.qr_campaign_id);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <Scan className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="truncate font-medium">{c?.campaign_name || 'Unknown'}</span>
                      <Badge variant="outline" className="text-[10px]">{s.device_type}</Badge>
                      <Badge variant="outline" className="text-[10px]">{s.browser}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this QR campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              The trackable link will stop working immediately and all scan data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return;
                await remove.mutateAsync(deleteId);
                setDeleteId(null);
                toast.success('Deleted');
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
