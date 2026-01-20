import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoPages, SeoPageWithMeta } from '@/hooks/useSeoPages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Lock,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import SeoEditDrawer from './SeoEditDrawer';
import { clearSeoCache } from '@/components/seo/SeoMeta';
import { supabase } from '@/integrations/supabase/client';

export default function SeoDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { pages, loading, fetchPages, createPage, deletePage } = useSeoPages();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const [search, setSearch] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [editingPage, setEditingPage] = useState<SeoPageWithMeta | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPage, setNewPage] = useState({
    page_name: '',
    page_key: '',
    route_path: '',
    is_public: true,
  });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check if user is admin/owner
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      // Check if user has admin/owner role in any tenant
      const { data: members } = await supabase
        .from('tenant_members')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin']);

      setIsAuthorized(members && members.length > 0);
    };

    if (!authLoading) {
      checkAuth();
    }
  }, [user, authLoading]);

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.page_name.toLowerCase().includes(search.toLowerCase()) ||
      page.route_path.toLowerCase().includes(search.toLowerCase()) ||
      page.page_key.toLowerCase().includes(search.toLowerCase());
    const matchesPublic = !showPublicOnly || page.is_public;
    return matchesSearch && matchesPublic;
  });

  const handleCreatePage = async () => {
    if (!newPage.page_name || !newPage.page_key || !newPage.route_path) return;
    
    setCreating(true);
    const result = await createPage(newPage);
    if (result) {
      setShowCreateDialog(false);
      setNewPage({ page_name: '', page_key: '', route_path: '', is_public: true });
    }
    setCreating(false);
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page and its SEO data?')) return;
    setDeleting(id);
    await deletePage(id);
    setDeleting(null);
  };

  const handleRefreshCache = () => {
    clearSeoCache();
    fetchPages();
  };

  // Loading state
  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              This page is only accessible to administrators and owners.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-semibold text-foreground">Developer Tools</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Developer SEO Dashboard</h1>
            <p className="text-muted-foreground">
              Manage SEO metadata for all pages
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshCache}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="public-filter"
                  checked={showPublicOnly}
                  onCheckedChange={setShowPublicOnly}
                />
                <Label htmlFor="public-filter">Public pages only</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Pages ({filteredPages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map(page => {
                      const meta = page.seo_meta?.[0];
                      return (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{page.page_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {page.page_key}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {page.route_path}
                              </code>
                              <a
                                href={`https://aireatro.com${page.route_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            {page.is_public ? (
                              <Badge variant="outline" className="gap-1">
                                <Globe className="h-3 w-3" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Lock className="h-3 w-3" />
                                Private
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {meta?.is_published ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(page.updated_at), 'MMM d, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingPage(page)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePage(page.id)}
                                disabled={deleting === page.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredPages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
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

        {/* Create Page Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page_name">Page Name</Label>
                <Input
                  id="page_name"
                  placeholder="e.g. About Us"
                  value={newPage.page_name}
                  onChange={(e) => setNewPage({ ...newPage, page_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page_key">Page Key</Label>
                <Input
                  id="page_key"
                  placeholder="e.g. about-us"
                  value={newPage.page_key}
                  onChange={(e) => setNewPage({ ...newPage, page_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route_path">Route Path</Label>
                <Input
                  id="route_path"
                  placeholder="e.g. /about-us"
                  value={newPage.route_path}
                  onChange={(e) => setNewPage({ ...newPage, route_path: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_public"
                  checked={newPage.is_public}
                  onCheckedChange={(checked) => setNewPage({ ...newPage, is_public: checked })}
                />
                <Label htmlFor="is_public">Public page (indexable)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePage} disabled={creating}>
                {creating ? 'Creating...' : 'Create Page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Drawer */}
        {editingPage && (
          <SeoEditDrawer
            page={editingPage}
            open={!!editingPage}
            onClose={() => setEditingPage(null)}
          />
        )}
        </div>
      </main>
    </div>
  );
}
