import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogs, Blog, BlogBlock, generateSlug, calculateReadTime, getSeoScore } from '@/hooks/useBlogs';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Save, Eye, EyeOff, Loader2, Plus, Trash2, GripVertical,
  Type, AlignLeft, Image as ImageIcon, Quote, Code, List, ListOrdered,
  Minus, MousePointerClick, Upload, CheckCircle, Globe, Search as SearchIcon,
  Clock, Sparkles, FileText, ChevronUp, ChevronDown,
} from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'list', label: 'Bullet List', icon: List },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'cta', label: 'CTA Button', icon: MousePointerClick },
] as const;

const CATEGORIES = ['General', 'WhatsApp API', 'Marketing', 'Automation', 'CRM', 'Case Study', 'Tutorial', 'Product Update'];

function newBlock(type: string): BlogBlock {
  return {
    id: crypto.randomUUID(),
    type: type as BlogBlock['type'],
    content: '',
    ...(type === 'heading' ? { level: 2 } : {}),
    ...(type === 'list' ? { items: [''], ordered: false } : {}),
    ...(type === 'cta' ? { buttonText: 'Get Started', buttonUrl: '/signup' } : {}),
  };
}

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { blogs, updateBlog, publishBlog, unpublishBlog } = useBlogs();
  const { uploadMedia } = useMediaLibrary();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [blocks, setBlocks] = useState<BlogBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [uploading, setUploading] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) { setIsAuthorized(false); return; }
      const { data } = await supabase.from('platform_admins').select('id').eq('user_id', user.id).maybeSingle();
      setIsAuthorized(!!data);
    };
    if (!authLoading) checkAuth();
  }, [user, authLoading]);

  useEffect(() => {
    if (id && blogs.length > 0) {
      const found = blogs.find(b => b.id === id);
      if (found) {
        setBlog(found);
        setBlocks(Array.isArray(found.content) ? found.content : []);
      }
    }
  }, [id, blogs]);

  // Auto-save
  useEffect(() => {
    if (!blog || saved) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => handleSave(false), 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [blog, blocks, saved]);

  const markDirty = () => setSaved(false);

  const handleSave = async (showToast = true) => {
    if (!blog) return;
    setSaving(true);
    const readTime = calculateReadTime(blocks);
    const success = await updateBlog(blog.id, {
      ...blog,
      content: blocks as any,
      read_time: readTime,
    });
    setSaving(false);
    if (success) {
      setSaved(true);
      if (showToast) toast({ title: 'Blog saved' });
    }
  };

  const handlePublish = async () => {
    if (!blog) return;
    await handleSave(false);
    const success = await publishBlog(blog.id);
    if (success) toast({ title: 'Blog published!' });
  };

  const handleUnpublish = async () => {
    if (!blog) return;
    const success = await unpublishBlog(blog.id);
    if (success) toast({ title: 'Blog unpublished' });
  };

  const updateField = (field: keyof Blog, value: any) => {
    if (!blog) return;
    setBlog({ ...blog, [field]: value });
    markDirty();
  };

  const addBlock = (type: string, afterIndex?: number) => {
    const block = newBlock(type);
    const newBlocks = [...blocks];
    const idx = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
    newBlocks.splice(idx, 0, block);
    setBlocks(newBlocks);
    markDirty();
  };

  const updateBlock = (index: number, updates: Partial<BlogBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
    markDirty();
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
    markDirty();
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
    markDirty();
  };

  const handleImageUpload = async (file: File, blockIndex: number) => {
    setUploading(true);
    const item = await uploadMedia(file);
    if (item) {
      updateBlock(blockIndex, { imageUrl: item.file_url, imageAlt: item.alt_text || '' });
    }
    setUploading(false);
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const item = await uploadMedia(file);
    if (item) updateField('featured_image', item.file_url);
    setUploading(false);
  };

  if (authLoading || isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }
  if (!isAuthorized || !blog) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Blog not found or access denied.</p></div>;
  }

  const seoScore = getSeoScore(blog);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/developer/blog-builder')}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-medium text-sm truncate max-w-[200px]">{blog.title || 'Untitled'}</span>
          <Badge variant="outline" className={blog.status === 'published' ? 'text-emerald-600 bg-emerald-500/10' : 'text-amber-600 bg-amber-500/10'}>
            {blog.status}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
            <Clock className="h-3 w-3" />{calculateReadTime(blocks)} min
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{saving ? 'Saving...' : saved ? '✓ Saved' : 'Unsaved changes'}</span>
            <Button variant="outline" size="sm" onClick={() => handleSave(true)} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />Save
            </Button>
            {blog.status === 'published' ? (
              <Button variant="outline" size="sm" onClick={handleUnpublish}><EyeOff className="h-4 w-4 mr-1" />Unpublish</Button>
            ) : (
              <Button size="sm" onClick={handlePublish} className="bg-gradient-to-r from-emerald-600 to-emerald-500">
                <Eye className="h-4 w-4 mr-1" />Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {/* Title */}
            <Input
              value={blog.title}
              onChange={(e) => {
                updateField('title', e.target.value);
                if (!blog.slug || blog.slug === generateSlug(blog.title)) {
                  updateField('slug', generateSlug(e.target.value));
                }
              }}
              placeholder="Blog title..."
              className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
            />
            <p className="text-xs text-muted-foreground">/{blog.slug || 'slug'}</p>

            {/* Blocks */}
            {blocks.map((block, i) => (
              <div key={block.id} className="group relative border border-transparent hover:border-border/50 rounded-xl p-3 transition-colors">
                {/* Block Controls */}
                <div className="absolute -left-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveBlock(i, 'up')} disabled={i === 0}><ChevronUp className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                </div>
                <div className="absolute -right-8 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeBlock(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>

                {/* Block Content */}
                {block.type === 'heading' && (
                  <div className="flex gap-2 items-start">
                    <Select value={String(block.level || 2)} onValueChange={(v) => updateBlock(i, { level: parseInt(v) })}>
                      <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">H1</SelectItem>
                        <SelectItem value="2">H2</SelectItem>
                        <SelectItem value="3">H3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(i, { content: e.target.value })}
                      placeholder="Heading text..."
                      className={`border-none shadow-none px-0 focus-visible:ring-0 bg-transparent ${block.level === 1 ? 'text-2xl font-bold' : block.level === 2 ? 'text-xl font-semibold' : 'text-lg font-medium'}`}
                    />
                  </div>
                )}

                {block.type === 'paragraph' && (
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(i, { content: e.target.value })}
                    placeholder="Write your paragraph..."
                    className="min-h-[80px] border-none shadow-none px-0 focus-visible:ring-0 bg-transparent resize-none"
                  />
                )}

                {block.type === 'image' && (
                  <div className="space-y-2">
                    {block.imageUrl ? (
                      <div className="relative">
                        <img src={block.imageUrl} alt={block.imageAlt || ''} className="w-full rounded-lg max-h-96 object-cover" />
                        <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7" onClick={() => updateBlock(i, { imageUrl: '', imageAlt: '' })}>Remove</Button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Drop image or click to upload</span>
                        <span className="text-xs text-muted-foreground">Recommended: 800×600px, max 200KB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, i); }} />
                      </label>
                    )}
                    <Input value={block.imageAlt || ''} onChange={(e) => updateBlock(i, { imageAlt: e.target.value })} placeholder="Alt text (SEO)" className="text-xs" />
                    <Input value={block.caption || ''} onChange={(e) => updateBlock(i, { caption: e.target.value })} placeholder="Caption (optional)" className="text-xs" />
                  </div>
                )}

                {block.type === 'quote' && (
                  <div className="border-l-4 border-primary/50 pl-4">
                    <Textarea value={block.content} onChange={(e) => updateBlock(i, { content: e.target.value })} placeholder="Quote text..." className="border-none shadow-none px-0 focus-visible:ring-0 bg-transparent italic resize-none" />
                  </div>
                )}

                {block.type === 'code' && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Textarea value={block.content} onChange={(e) => updateBlock(i, { content: e.target.value })} placeholder="Code..." className="font-mono text-sm border-none shadow-none px-0 focus-visible:ring-0 bg-transparent resize-none" />
                  </div>
                )}

                {block.type === 'list' && (
                  <div className="space-y-1">
                    {(block.items || ['']).map((item, li) => (
                      <div key={li} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">{block.ordered ? `${li + 1}.` : '•'}</span>
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newItems = [...(block.items || [''])];
                            newItems[li] = e.target.value;
                            updateBlock(i, { items: newItems });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newItems = [...(block.items || [''])];
                              newItems.splice(li + 1, 0, '');
                              updateBlock(i, { items: newItems });
                            }
                          }}
                          placeholder="List item..."
                          className="border-none shadow-none px-0 focus-visible:ring-0 bg-transparent h-8"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {block.type === 'divider' && <Separator className="my-4" />}

                {block.type === 'cta' && (
                  <div className="space-y-2 bg-muted/30 rounded-lg p-4">
                    <Input value={block.buttonText || ''} onChange={(e) => updateBlock(i, { buttonText: e.target.value })} placeholder="Button text" />
                    <Input value={block.buttonUrl || ''} onChange={(e) => updateBlock(i, { buttonUrl: e.target.value })} placeholder="Button URL" />
                  </div>
                )}
              </div>
            ))}

            {/* Add Block */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
              {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                <Button key={type} variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => addBlock(type)}>
                  <Icon className="h-3 w-3" />{label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm hidden lg:block overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full rounded-none border-b border-border/50 bg-transparent">
              <TabsTrigger value="settings" className="text-xs flex-1">Settings</TabsTrigger>
              <TabsTrigger value="seo" className="text-xs flex-1">SEO</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs flex-1">Preview</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-120px)]">
              <TabsContent value="settings" className="p-4 space-y-4 mt-0">
                {/* Slug */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug</Label>
                  <Input value={blog.slug || ''} onChange={(e) => updateField('slug', e.target.value)} className="text-xs" />
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Excerpt</Label>
                  <Textarea value={blog.excerpt || ''} onChange={(e) => updateField('excerpt', e.target.value)} className="text-xs min-h-[60px]" placeholder="Short description..." />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={blog.category || 'General'} onValueChange={(v) => updateField('category', v)}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Tags (comma separated)</Label>
                  <Input value={(blog.tags || []).join(', ')} onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className="text-xs" />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Author</Label>
                  <Input value={blog.author || ''} onChange={(e) => updateField('author', e.target.value)} className="text-xs" />
                </div>

                {/* Featured Image */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Featured Image</Label>
                  <p className="text-[10px] text-muted-foreground">Recommended: 1200×630px (OG optimized)</p>
                  {blog.featured_image ? (
                    <div className="relative">
                      <img src={blog.featured_image} alt="" className="w-full rounded-lg aspect-video object-cover" />
                      <Button variant="destructive" size="sm" className="absolute top-1 right-1 h-6 text-[10px]" onClick={() => updateField('featured_image', null)}>Remove</Button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">1200×630px</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
                    </label>
                  )}
                  <Input value={blog.image_alt || ''} onChange={(e) => updateField('image_alt', e.target.value)} placeholder="Alt text" className="text-xs" />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="p-4 space-y-4 mt-0">
                {/* SEO Score */}
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">SEO Score</span>
                      <Badge variant="outline" className={`text-xs ${seoScore >= 70 ? 'text-emerald-600 bg-emerald-500/10' : seoScore >= 40 ? 'text-amber-600 bg-amber-500/10' : 'text-red-500 bg-red-500/10'}`}>
                        {seoScore}%
                      </Badge>
                    </div>
                    <Progress value={seoScore} className="h-1.5" />
                  </CardContent>
                </Card>

                <div className="space-y-1.5">
                  <Label className="text-xs">Meta Title <span className="text-muted-foreground">({(blog.seo_title || '').length}/60)</span></Label>
                  <Input value={blog.seo_title || ''} onChange={(e) => updateField('seo_title', e.target.value)} className={`text-xs ${(blog.seo_title || '').length > 60 ? 'border-destructive' : ''}`} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Meta Description <span className="text-muted-foreground">({(blog.seo_description || '').length}/160)</span></Label>
                  <Textarea value={blog.seo_description || ''} onChange={(e) => updateField('seo_description', e.target.value)} className={`text-xs min-h-[60px] ${(blog.seo_description || '').length > 160 ? 'border-destructive' : ''}`} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Keywords</Label>
                  <Input value={blog.seo_keywords || ''} onChange={(e) => updateField('seo_keywords', e.target.value)} className="text-xs" placeholder="keyword1, keyword2" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Canonical URL</Label>
                  <Input value={blog.canonical_url || ''} onChange={(e) => updateField('canonical_url', e.target.value)} className="text-xs" />
                </div>

                <Separator />
                <p className="text-xs font-medium">Open Graph</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">OG Title</Label>
                  <Input value={blog.og_title || ''} onChange={(e) => updateField('og_title', e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">OG Description</Label>
                  <Textarea value={blog.og_description || ''} onChange={(e) => updateField('og_description', e.target.value)} className="text-xs min-h-[50px]" />
                </div>

                <Separator />
                <p className="text-xs font-medium">Twitter Card</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Twitter Title</Label>
                  <Input value={blog.twitter_title || ''} onChange={(e) => updateField('twitter_title', e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Twitter Description</Label>
                  <Textarea value={blog.twitter_description || ''} onChange={(e) => updateField('twitter_description', e.target.value)} className="text-xs min-h-[50px]" />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="p-4 space-y-4 mt-0">
                {/* Google Preview */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs flex items-center gap-1"><SearchIcon className="h-3 w-3" />Google Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="bg-background rounded-lg p-3 space-y-1">
                      <p className="text-blue-600 text-sm font-medium line-clamp-1">{blog.seo_title || blog.title || 'Page Title'}</p>
                      <p className="text-emerald-700 text-xs">aireatro.com/blog/{blog.slug || 'slug'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{blog.seo_description || blog.excerpt || 'Meta description...'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Preview */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" />Social Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="bg-background rounded-lg overflow-hidden border border-border/50">
                      {(blog.og_image || blog.featured_image) && (
                        <img src={blog.og_image || blog.featured_image || ''} alt="" className="w-full aspect-video object-cover" />
                      )}
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground">aireatro.com</p>
                        <p className="text-sm font-medium line-clamp-2">{blog.og_title || blog.title || 'Title'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{blog.og_description || blog.excerpt || 'Description'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blog Preview */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs flex items-center gap-1"><Eye className="h-3 w-3" />Content Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="bg-background rounded-lg p-3 space-y-3 max-h-96 overflow-y-auto">
                      <h1 className="text-lg font-bold">{blog.title}</h1>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{blog.author}</span>•<span>{blog.category}</span>•<span>{calculateReadTime(blocks)} min read</span>
                      </div>
                      {blocks.map((block, i) => (
                        <div key={i}>
                          {block.type === 'heading' && <h2 className={block.level === 1 ? 'text-xl font-bold' : block.level === 2 ? 'text-lg font-semibold' : 'text-base font-medium'}>{block.content}</h2>}
                          {block.type === 'paragraph' && <p className="text-sm text-muted-foreground">{block.content}</p>}
                          {block.type === 'image' && block.imageUrl && <img src={block.imageUrl} alt={block.imageAlt} className="w-full rounded" />}
                          {block.type === 'quote' && <blockquote className="border-l-2 border-primary/50 pl-3 italic text-sm">{block.content}</blockquote>}
                          {block.type === 'divider' && <Separator />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
