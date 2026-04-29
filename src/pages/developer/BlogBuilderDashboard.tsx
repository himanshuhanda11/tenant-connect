import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogs, Blog, getSeoScore } from '@/hooks/useBlogs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Plus, Edit, Trash2, ArrowLeft, Loader2, FileText, Eye, EyeOff,
  Globe, CheckCircle, XCircle, AlertTriangle, Image as ImageIcon, Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function BlogBuilderDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { blogs, loading, fetchBlogs, createBlog, deleteBlog } = useBlogs();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) { setIsAuthorized(false); return; }
      const { data } = await supabase.from('platform_admins').select('id').eq('user_id', user.id).maybeSingle();
      setIsAuthorized(!!data);
    };
    if (!authLoading) checkAuth();
  }, [user, authLoading]);

  const filtered = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.slug || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    drafts: blogs.filter(b => b.status === 'draft').length,
  };

  const handleCreate = async () => {
    setCreating(true);
    const blog = await createBlog({ title: 'Untitled Post' });
    setCreating(false);
    if (blog) navigate(`/developer/blog-builder/${blog.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    setDeleting(id);
    await deleteBlog(id);
    setDeleting(null);
  };

  if (authLoading || isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4"><CardContent className="pt-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <Button onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4 mr-2" />Go Home</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Blog Builder</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/developer/media')}><ImageIcon className="h-4 w-4 mr-2" />Media</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/developer/seo')}><Globe className="h-4 w-4 mr-2" />SEO</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Blog Builder</h1>
            <p className="text-muted-foreground mt-1">Create, edit, and publish blog posts</p>
          </div>
          <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
            {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            New Blog Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Eye className="h-5 w-5 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold">{stats.published}</p><p className="text-xs text-muted-foreground">Published</p></div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><EyeOff className="h-5 w-5 text-amber-600" /></div>
              <div><p className="text-2xl font-bold">{stats.drafts}</p><p className="text-xs text-muted-foreground">Drafts</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-4 px-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title or slug..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background/50" />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="draft" className="text-xs">Drafts</TabsTrigger>
                <TabsTrigger value="published" className="text-xs">Published</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Category</TableHead>
                      <TableHead className="hidden md:table-cell">SEO</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(blog => {
                      const seo = getSeoScore(blog);
                      return (
                        <TableRow key={blog.id} className="border-border/30 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/developer/blog-builder/${blog.id}`)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {blog.featured_image ? (
                                <img src={blog.featured_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                              )}
                              <div>
                                <div className="font-medium text-sm">{blog.title || 'Untitled'}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{blog.read_time || 1} min read</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={blog.status === 'published' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}>
                              {blog.status === 'published' ? <CheckCircle className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                              {blog.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs">{blog.category}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={`text-xs ${seo >= 70 ? 'text-emerald-600 bg-emerald-500/10' : seo >= 40 ? 'text-amber-600 bg-amber-500/10' : 'text-red-500 bg-red-500/10'}`}>
                              {seo}%
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">{format(new Date(blog.updated_at), 'MMM d, yyyy')}</span>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/developer/blog-builder/${blog.id}`)} className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(blog.id)} disabled={deleting === blog.id} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-muted-foreground">No blog posts found</p>
                          <Button onClick={handleCreate} variant="outline" size="sm" className="mt-3"><Plus className="h-4 w-4 mr-2" />Create First Post</Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
