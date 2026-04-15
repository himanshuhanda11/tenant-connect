import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoPages, SeoPageWithMeta } from '@/hooks/useSeoPages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, Edit, Trash2, Globe, Lock, CheckCircle, XCircle,
  ExternalLink, RefreshCw, ArrowLeft, Loader2, FileText, Newspaper,
  TrendingUp, AlertTriangle, Sparkles, Download,
} from 'lucide-react';
import { format } from 'date-fns';
import SeoEditDrawer from './SeoEditDrawer';
import { clearSeoCache } from '@/components/seo/SeoMeta';
import { supabase } from '@/integrations/supabase/client';
import { PUBLIC_PAGE_ROUTES, getBlogSeoEntries } from '@/data/seoRouteRegistry';
import { blogPosts } from '@/data/blogPosts';

// SEO Score calculator
function getSeoScore(meta: any): { score: number; label: string; color: string; icon: typeof CheckCircle } {
  if (!meta) return { score: 0, label: 'Missing', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle };
  
  let filled = 0;
  const fields = ['title', 'description', 'keywords', 'canonical_url', 'og_title', 'og_description', 'og_image', 'twitter_title', 'twitter_description'];
  fields.forEach(f => {
    if (meta[f] && meta[f].trim()) filled++;
  });
  
  const pct = Math.round((filled / fields.length) * 100);
  
  if (pct >= 80) return { score: pct, label: 'Optimized', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle };
  if (pct >= 50) return { score: pct, label: 'Partial', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle };
  return { score: pct, label: 'Needs Work', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle };
}

export default function SeoDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { pages, loading, syncing, fetchPages, createPage, deletePage, syncAllPages } = useSeoPages();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'page' | 'blog'>('all');
  const [editingPage, setEditingPage] = useState<SeoPageWithMeta | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPage, setNewPage] = useState({
    page_name: '',
    page_key: '',
    route_path: '',
    page_type: 'page',
    is_public: true,
  });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) { setIsAuthorized(false); return; }
      const { data: platformAdmin } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsAuthorized(!!platformAdmin);
    };
    if (!authLoading) checkAuth();
  }, [user, authLoading]);

  const filteredPages = useMemo(() => pages.filter(page => {
    const matchesSearch =
      page.page_name.toLowerCase().includes(search.toLowerCase()) ||
      page.route_path.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || page.page_type === typeFilter;
    return matchesSearch && matchesType;
  }), [pages, search, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = pages.length;
    const optimized = pages.filter(p => getSeoScore(p.seo_meta?.[0]).score >= 80).length;
    const partial = pages.filter(p => { const s = getSeoScore(p.seo_meta?.[0]).score; return s >= 50 && s < 80; }).length;
    const missing = pages.filter(p => getSeoScore(p.seo_meta?.[0]).score < 50).length;
    const blogCount = pages.filter(p => p.page_type === 'blog').length;
    return { total, optimized, partial, missing, blogCount };
  }, [pages]);

  const handleCreatePage = async () => {
    if (!newPage.page_name || !newPage.page_key || !newPage.route_path) return;
    setCreating(true);
    const result = await createPage(newPage);
    if (result) {
      setShowCreateDialog(false);
      setNewPage({ page_name: '', page_key: '', route_path: '', page_type: 'page', is_public: true });
    }
    setCreating(false);
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Delete this page and its SEO data?')) return;
    setDeleting(id);
    await deletePage(id);
    setDeleting(null);
  };

  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">Platform admin access required.</p>
            <Button onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4 mr-2" />Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Globe className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SEO Manager</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SEO & Meta Manager</h1>
            <p className="text-muted-foreground mt-1">Control how your pages appear on Google & social media</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => { clearSeoCache(); fetchPages(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allEntries = [...PUBLIC_PAGE_ROUTES, ...getBlogSeoEntries(blogPosts)];
                syncAllPages(allEntries);
              }}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {syncing ? 'Syncing...' : 'Sync All Pages'}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />Add Page
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.optimized}</p>
                  <p className="text-xs text-muted-foreground">Optimized</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.partial}</p>
                  <p className="text-xs text-muted-foreground">Partial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.missing}</p>
                  <p className="text-xs text-muted-foreground">Needs Work</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-4 px-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages by name or route..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all" className="text-xs gap-1">
                    <Globe className="h-3 w-3" />All
                  </TabsTrigger>
                  <TabsTrigger value="page" className="text-xs gap-1">
                    <FileText className="h-3 w-3" />Pages
                  </TabsTrigger>
                  <TabsTrigger value="blog" className="text-xs gap-1">
                    <Newspaper className="h-3 w-3" />Blog
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Pages ({filteredPages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Page</TableHead>
                      <TableHead className="hidden sm:table-cell">Route</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>SEO Score</TableHead>
                      <TableHead className="hidden md:table-cell">Published</TableHead>
                      <TableHead className="hidden lg:table-cell">Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map(page => {
                      const meta = page.seo_meta?.[0];
                      const score = getSeoScore(meta);
                      const ScoreIcon = score.icon;
                      return (
                        <TableRow key={page.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{page.page_name}</div>
                              <div className="text-xs text-muted-foreground sm:hidden">{page.route_path}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs bg-muted/70 px-2 py-0.5 rounded font-mono">{page.route_path}</code>
                              <a href={`https://aireatro.com${page.route_path}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs gap-1 capitalize">
                              {page.page_type === 'blog' ? <Newspaper className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                              {page.page_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 text-xs border ${score.color}`}>
                              <ScoreIcon className="h-3 w-3" />
                              {score.score}% — {score.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {meta?.is_published ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(page.updated_at), 'MMM d, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingPage(page)} className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)} disabled={deleting === page.id} className="h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredPages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Globe className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-muted-foreground">No pages found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />Add New Page
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Page Name</Label>
                <Input placeholder="e.g. About Us" value={newPage.page_name} onChange={(e) => setNewPage({ ...newPage, page_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Page Key</Label>
                <Input placeholder="e.g. about-us" value={newPage.page_key} onChange={(e) => setNewPage({ ...newPage, page_key: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Route Path</Label>
                <Input placeholder="e.g. /about-us" value={newPage.route_path} onChange={(e) => setNewPage({ ...newPage, route_path: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Page Type</Label>
                <Select value={newPage.page_type} onValueChange={(v) => setNewPage({ ...newPage, page_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page"><div className="flex items-center gap-2"><FileText className="h-4 w-4" />Page</div></SelectItem>
                    <SelectItem value="blog"><div className="flex items-center gap-2"><Newspaper className="h-4 w-4" />Blog Post</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="is_public" checked={newPage.is_public} onCheckedChange={(checked) => setNewPage({ ...newPage, is_public: checked })} />
                <Label htmlFor="is_public">Public page (indexable)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreatePage} disabled={creating}>
                {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Drawer */}
        {editingPage && (
          <SeoEditDrawer page={editingPage} open={!!editingPage} onClose={() => setEditingPage(null)} />
        )}
      </main>
    </div>
  );
}
