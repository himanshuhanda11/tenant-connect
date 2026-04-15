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
  ArrowLeft, Save, Eye, EyeOff, Loader2, Plus, Trash2,
  Type, AlignLeft, Image as ImageIcon, Quote, Code, List,
  Minus, MousePointerClick, Upload, Globe, Search as SearchIcon,
  Clock, FileText, ChevronUp, ChevronDown, Link2, ExternalLink,
  Settings, BarChart3, Share2,
} from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type, color: 'text-blue-500' },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, color: 'text-emerald-500' },
  { type: 'image', label: 'Image', icon: ImageIcon, color: 'text-violet-500' },
  { type: 'link', label: 'Link', icon: Link2, color: 'text-cyan-500' },
  { type: 'quote', label: 'Quote', icon: Quote, color: 'text-amber-500' },
  { type: 'code', label: 'Code', icon: Code, color: 'text-pink-500' },
  { type: 'list', label: 'List', icon: List, color: 'text-orange-500' },
  { type: 'divider', label: 'Divider', icon: Minus, color: 'text-muted-foreground' },
  { type: 'cta', label: 'CTA Button', icon: MousePointerClick, color: 'text-red-500' },
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
    ...(type === 'link' ? { buttonText: 'Click here', buttonUrl: '' } : {}),
  };
}

function BlockTypeLabel({ type }: { type: string }) {
  const bt = BLOCK_TYPES.find(b => b.type === type);
  if (!bt) return null;
  const Icon = bt.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${bt.color}`}>
      <Icon className="h-3 w-3" />{bt.label}
    </span>
  );
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
  const [activeTab, setActiveTab] = useState('settings');
  const [uploading, setUploading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
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
    setShowAddMenu(false);
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
    if (item) updateBlock(blockIndex, { imageUrl: item.file_url, imageAlt: item.alt_text || '' });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex flex-col">
      {/* Premium Top Bar */}
      <header className="border-b border-border/40 bg-background/90 backdrop-blur-2xl sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/developer/blog-builder')} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Back</span>
          </Button>
          <div className="h-5 w-px bg-border/50" />

          {/* Title + Status */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate max-w-[180px] lg:max-w-[300px]">{blog.title || 'Untitled'}</span>
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] px-2 py-0.5 ${blog.status === 'published'
                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
                : 'text-amber-600 bg-amber-500/10 border-amber-500/30'
              }`}
            >
              {blog.status === 'published' ? '● Published' : '○ Draft'}
            </Badge>
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />{calculateReadTime(blocks)} min
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
              saving ? 'text-amber-500 bg-amber-500/10' : saved ? 'text-emerald-500 bg-emerald-500/10' : 'text-orange-500 bg-orange-500/10'
            }`}>
              {saving ? '⟳ Saving...' : saved ? '✓ Saved' : '● Unsaved'}
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSave(true)} disabled={saving} className="h-8 text-xs gap-1">
              <Save className="h-3.5 w-3.5" />Save
            </Button>
            {blog.status === 'published' ? (
              <Button variant="outline" size="sm" onClick={handleUnpublish} className="h-8 text-xs gap-1">
                <EyeOff className="h-3.5 w-3.5" />Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={handlePublish} className="h-8 text-xs gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20">
                <Eye className="h-3.5 w-3.5" />Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-2">
            {/* Title Input */}
            <div className="space-y-1">
              <Input
                value={blog.title}
                onChange={(e) => {
                  updateField('title', e.target.value);
                  if (!blog.slug || blog.slug === generateSlug(blog.title)) {
                    updateField('slug', generateSlug(e.target.value));
                  }
                }}
                placeholder="Blog title..."
                className="text-3xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/30"
              />
              <p className="text-xs text-muted-foreground/60 font-mono">aireatro.com/blog/{blog.slug || 'your-post-slug'}</p>
            </div>

            <Separator className="!my-6 opacity-30" />

            {/* Content Blocks */}
            <div className="space-y-3">
              {blocks.map((block, i) => (
                <div
                  key={block.id}
                  className="group relative rounded-xl border border-border/30 bg-card/40 hover:bg-card/70 hover:border-border/60 transition-all duration-200 hover:shadow-sm"
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
                    <BlockTypeLabel type={block.type} />
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveBlock(i, 'up')} disabled={i === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <div className="w-px h-4 bg-border/40 mx-1" />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/10" onClick={() => removeBlock(i)}>
                        <Trash2 className="h-3 w-3 text-destructive/70" />
                      </Button>
                    </div>
                  </div>

                  {/* Block Body */}
                  <div className="px-4 py-3">
                    {block.type === 'heading' && (
                      <div className="flex gap-3 items-start">
                        <Select value={String(block.level || 2)} onValueChange={(v) => updateBlock(i, { level: parseInt(v) })}>
                          <SelectTrigger className="w-20 h-9 text-xs border-border/40 bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
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
                          className={`flex-1 border-none shadow-none px-0 focus-visible:ring-0 bg-transparent ${
                            block.level === 1 ? 'text-2xl font-bold' : block.level === 2 ? 'text-xl font-semibold' : 'text-lg font-medium'
                          }`}
                        />
                      </div>
                    )}

                    {block.type === 'paragraph' && (
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateBlock(i, { content: e.target.value })}
                        placeholder="Write your paragraph... (supports inline links in preview)"
                        className="min-h-[100px] border-none shadow-none px-0 focus-visible:ring-0 bg-transparent resize-none text-[15px] leading-relaxed"
                      />
                    )}

                    {block.type === 'link' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Link Text</Label>
                          <Input
                            value={block.buttonText || ''}
                            onChange={(e) => updateBlock(i, { buttonText: e.target.value })}
                            placeholder="e.g. Read our guide on WhatsApp API"
                            className="border-border/40 bg-muted/20"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">URL</Label>
                          <div className="relative">
                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              value={block.buttonUrl || ''}
                              onChange={(e) => updateBlock(i, { buttonUrl: e.target.value })}
                              placeholder="https://example.com or /page"
                              className="pl-9 border-border/40 bg-muted/20"
                            />
                          </div>
                        </div>
                        {block.buttonUrl && (
                          <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
                            <Link2 className="h-3.5 w-3.5" />
                            <a href={block.buttonUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 truncate">
                              {block.buttonText || block.buttonUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-3">
                        {block.imageUrl ? (
                          <div className="relative group/img">
                            <img src={block.imageUrl} alt={block.imageAlt || ''} className="w-full rounded-lg max-h-96 object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button variant="destructive" size="sm" onClick={() => updateBlock(i, { imageUrl: '', imageAlt: '' })}>
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-border/40 rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-violet-500" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium text-foreground">Drop image or click to upload</span>
                              <span className="block text-xs text-muted-foreground mt-1">Recommended: 800×600px · Max 200KB</span>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, i); }} />
                          </label>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Alt Text (SEO)</Label>
                            <Input value={block.imageAlt || ''} onChange={(e) => updateBlock(i, { imageAlt: e.target.value })} placeholder="Describe the image" className="text-xs border-border/40 bg-muted/20" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Caption</Label>
                            <Input value={block.caption || ''} onChange={(e) => updateBlock(i, { caption: e.target.value })} placeholder="Optional caption" className="text-xs border-border/40 bg-muted/20" />
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <div className="border-l-4 border-amber-500/50 pl-4 bg-amber-500/5 rounded-r-lg py-2">
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlock(i, { content: e.target.value })}
                          placeholder="Enter your quote..."
                          className="border-none shadow-none px-0 focus-visible:ring-0 bg-transparent italic resize-none text-[15px]"
                        />
                      </div>
                    )}

                    {block.type === 'code' && (
                      <div className="bg-[hsl(var(--muted))] rounded-lg p-4 font-mono">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                          </div>
                          <Input
                            value={block.language || ''}
                            onChange={(e) => updateBlock(i, { language: e.target.value })}
                            placeholder="language"
                            className="h-5 w-24 text-[10px] border-none bg-transparent p-0 focus-visible:ring-0 text-muted-foreground"
                          />
                        </div>
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlock(i, { content: e.target.value })}
                          placeholder="// your code here..."
                          className="font-mono text-sm border-none shadow-none px-0 focus-visible:ring-0 bg-transparent resize-none min-h-[80px]"
                        />
                      </div>
                    )}

                    {block.type === 'list' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant={!block.ordered ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => updateBlock(i, { ordered: false })}
                          >
                            • Bullet
                          </Button>
                          <Button
                            variant={block.ordered ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => updateBlock(i, { ordered: true })}
                          >
                            1. Numbered
                          </Button>
                        </div>
                        {(block.items || ['']).map((item, li) => (
                          <div key={li} className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-5 text-right shrink-0">
                              {block.ordered ? `${li + 1}.` : '•'}
                            </span>
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
                                if (e.key === 'Backspace' && !item && (block.items || []).length > 1) {
                                  e.preventDefault();
                                  const newItems = [...(block.items || [''])];
                                  newItems.splice(li, 1);
                                  updateBlock(i, { items: newItems });
                                }
                              }}
                              placeholder="List item..."
                              className="border-none shadow-none px-0 focus-visible:ring-0 bg-transparent h-8"
                            />
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground h-7 mt-1"
                          onClick={() => updateBlock(i, { items: [...(block.items || []), ''] })}
                        >
                          <Plus className="h-3 w-3 mr-1" />Add item
                        </Button>
                      </div>
                    )}

                    {block.type === 'divider' && (
                      <div className="py-2">
                        <Separator className="opacity-50" />
                      </div>
                    )}

                    {block.type === 'cta' && (
                      <div className="space-y-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Button Text</Label>
                          <Input value={block.buttonText || ''} onChange={(e) => updateBlock(i, { buttonText: e.target.value })} placeholder="Button text" className="border-border/40 bg-background/50" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Button URL</Label>
                          <Input value={block.buttonUrl || ''} onChange={(e) => updateBlock(i, { buttonUrl: e.target.value })} placeholder="https://... or /page" className="border-border/40 bg-background/50" />
                        </div>
                        <div className="pt-1">
                          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20">
                            {block.buttonText || 'Button Preview'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Block Section */}
            <div className="pt-6">
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed border-2 border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary gap-2"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  <Plus className="h-4 w-4" />
                  Add Content Block
                </Button>

                {showAddMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-xl p-3 z-10 grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
                      <button
                        key={type}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-muted/50 transition-colors text-center"
                        onClick={() => addBlock(type)}
                      >
                        <div className={`w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Premium */}
        <div className="w-[340px] border-l border-border/40 bg-card/20 backdrop-blur-sm hidden lg:flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b border-border/40 bg-transparent h-11 p-0 gap-0">
              <TabsTrigger value="settings" className="flex-1 rounded-none h-full text-xs gap-1.5 data-[state=active]:bg-muted/30 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Settings className="h-3.5 w-3.5" />Settings
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex-1 rounded-none h-full text-xs gap-1.5 data-[state=active]:bg-muted/30 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary">
                <BarChart3 className="h-3.5 w-3.5" />SEO
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 rounded-none h-full text-xs gap-1.5 data-[state=active]:bg-muted/30 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Share2 className="h-3.5 w-3.5" />Preview
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0">
                <div className="p-4 space-y-5">
                  <SidebarSection title="URL Slug" icon={Link2}>
                    <Input value={blog.slug || ''} onChange={(e) => updateField('slug', e.target.value)} className="text-sm border-border/40 bg-muted/20" />
                  </SidebarSection>

                  <SidebarSection title="Excerpt" icon={AlignLeft}>
                    <Textarea value={blog.excerpt || ''} onChange={(e) => updateField('excerpt', e.target.value)} className="text-sm min-h-[80px] border-border/40 bg-muted/20" placeholder="Short summary for previews..." />
                  </SidebarSection>

                  <SidebarSection title="Category" icon={FileText}>
                    <Select value={blog.category || 'General'} onValueChange={(v) => updateField('category', v)}>
                      <SelectTrigger className="text-sm border-border/40 bg-muted/20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </SidebarSection>

                  <SidebarSection title="Tags">
                    <Input value={(blog.tags || []).join(', ')} onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className="text-sm border-border/40 bg-muted/20" placeholder="tag1, tag2, tag3" />
                    {(blog.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(blog.tags || []).map((t, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </SidebarSection>

                  <SidebarSection title="Author">
                    <Input value={blog.author || ''} onChange={(e) => updateField('author', e.target.value)} className="text-sm border-border/40 bg-muted/20" />
                  </SidebarSection>

                  <SidebarSection title="Featured Image" icon={ImageIcon}>
                    <p className="text-[11px] text-muted-foreground mb-2">Recommended: 1200×630px (OG optimized)</p>
                    {blog.featured_image ? (
                      <div className="relative group/fi">
                        <img src={blog.featured_image} alt="" className="w-full rounded-lg aspect-video object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/fi:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button variant="destructive" size="sm" className="text-xs" onClick={() => updateField('featured_image', null)}>Remove</Button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-border/40 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">1200×630px</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
                      </label>
                    )}
                    <Input value={blog.image_alt || ''} onChange={(e) => updateField('image_alt', e.target.value)} placeholder="Alt text for featured image" className="text-sm mt-2 border-border/40 bg-muted/20" />
                  </SidebarSection>
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="mt-0">
                <div className="p-4 space-y-5">
                  {/* SEO Score Card */}
                  <Card className="border-border/40 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">SEO Score</span>
                        <div className={`text-2xl font-bold ${seoScore >= 70 ? 'text-emerald-500' : seoScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {seoScore}%
                        </div>
                      </div>
                      <Progress value={seoScore} className="h-2" />
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {seoScore >= 70 ? '✨ Great! Your SEO is well optimized.' : seoScore >= 40 ? '⚠ Good start. Fill in more fields to improve.' : '🔴 Needs work. Complete SEO fields below.'}
                      </p>
                    </CardContent>
                  </Card>

                  <SidebarSection title="Meta Title">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs text-muted-foreground">Title Tag</Label>
                      <span className={`text-[10px] font-mono ${(blog.seo_title || '').length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {(blog.seo_title || '').length}/60
                      </span>
                    </div>
                    <Input value={blog.seo_title || ''} onChange={(e) => updateField('seo_title', e.target.value)} className={`text-sm border-border/40 bg-muted/20 ${(blog.seo_title || '').length > 60 ? 'border-red-500/50' : ''}`} />
                  </SidebarSection>

                  <SidebarSection title="Meta Description">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <span className={`text-[10px] font-mono ${(blog.seo_description || '').length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {(blog.seo_description || '').length}/160
                      </span>
                    </div>
                    <Textarea value={blog.seo_description || ''} onChange={(e) => updateField('seo_description', e.target.value)} className={`text-sm min-h-[80px] border-border/40 bg-muted/20 ${(blog.seo_description || '').length > 160 ? 'border-red-500/50' : ''}`} />
                  </SidebarSection>

                  <SidebarSection title="Keywords">
                    <Input value={blog.seo_keywords || ''} onChange={(e) => updateField('seo_keywords', e.target.value)} className="text-sm border-border/40 bg-muted/20" placeholder="keyword1, keyword2" />
                  </SidebarSection>

                  <SidebarSection title="Canonical URL">
                    <Input value={blog.canonical_url || ''} onChange={(e) => updateField('canonical_url', e.target.value)} className="text-sm border-border/40 bg-muted/20" />
                  </SidebarSection>

                  <Separator className="opacity-30" />

                  <SidebarSection title="Open Graph" icon={Globe}>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">OG Title</Label>
                        <Input value={blog.og_title || ''} onChange={(e) => updateField('og_title', e.target.value)} className="text-sm border-border/40 bg-muted/20" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">OG Description</Label>
                        <Textarea value={blog.og_description || ''} onChange={(e) => updateField('og_description', e.target.value)} className="text-sm min-h-[60px] border-border/40 bg-muted/20" />
                      </div>
                    </div>
                  </SidebarSection>

                  <Separator className="opacity-30" />

                  <SidebarSection title="Twitter Card" icon={Share2}>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Twitter Title</Label>
                        <Input value={blog.twitter_title || ''} onChange={(e) => updateField('twitter_title', e.target.value)} className="text-sm border-border/40 bg-muted/20" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Twitter Description</Label>
                        <Textarea value={blog.twitter_description || ''} onChange={(e) => updateField('twitter_description', e.target.value)} className="text-sm min-h-[60px] border-border/40 bg-muted/20" />
                      </div>
                    </div>
                  </SidebarSection>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="mt-0">
                <div className="p-4 space-y-4">
                  {/* Google Preview */}
                  <Card className="border-border/40 overflow-hidden">
                    <CardHeader className="pb-2 pt-3 px-4 bg-muted/20">
                      <CardTitle className="text-xs flex items-center gap-1.5"><SearchIcon className="h-3.5 w-3.5 text-blue-500" />Google Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-3">
                      <div className="space-y-1">
                        <p className="text-blue-600 text-sm font-medium line-clamp-1 hover:underline cursor-pointer">{blog.seo_title || blog.title || 'Page Title'}</p>
                        <p className="text-emerald-700 text-xs font-mono">aireatro.com/blog/{blog.slug || 'slug'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{blog.seo_description || blog.excerpt || 'Add a meta description to improve your search appearance...'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Preview */}
                  <Card className="border-border/40 overflow-hidden">
                    <CardHeader className="pb-2 pt-3 px-4 bg-muted/20">
                      <CardTitle className="text-xs flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-500" />Social Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-3">
                      <div className="rounded-lg overflow-hidden border border-border/40">
                        {(blog.og_image || blog.featured_image) ? (
                          <img src={blog.og_image || blog.featured_image || ''} alt="" className="w-full aspect-video object-cover" />
                        ) : (
                          <div className="w-full aspect-video bg-muted/30 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="p-3 bg-muted/10">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">aireatro.com</p>
                          <p className="text-sm font-semibold line-clamp-2 mt-0.5">{blog.og_title || blog.title || 'Title'}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{blog.og_description || blog.excerpt || 'Description'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Preview */}
                  <Card className="border-border/40 overflow-hidden">
                    <CardHeader className="pb-2 pt-3 px-4 bg-muted/20">
                      <CardTitle className="text-xs flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-emerald-500" />Content Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-3">
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        <h1 className="text-lg font-bold leading-tight">{blog.title}</h1>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pb-2 border-b border-border/30">
                          <span>{blog.author}</span>•<span>{blog.category}</span>•<span>{calculateReadTime(blocks)} min read</span>
                        </div>
                        {blocks.map((block, i) => (
                          <div key={i}>
                            {block.type === 'heading' && (
                              <h2 className={`${block.level === 1 ? 'text-xl font-bold' : block.level === 2 ? 'text-lg font-semibold' : 'text-base font-medium'} mt-2`}>
                                {block.content}
                              </h2>
                            )}
                            {block.type === 'paragraph' && <p className="text-sm text-muted-foreground leading-relaxed">{block.content}</p>}
                            {block.type === 'link' && block.buttonUrl && (
                              <a href={block.buttonUrl} className="text-sm text-primary underline underline-offset-2 inline-flex items-center gap-1">
                                {block.buttonText || block.buttonUrl}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {block.type === 'image' && block.imageUrl && (
                              <div>
                                <img src={block.imageUrl} alt={block.imageAlt} className="w-full rounded-lg" />
                                {block.caption && <p className="text-[11px] text-muted-foreground text-center mt-1 italic">{block.caption}</p>}
                              </div>
                            )}
                            {block.type === 'quote' && <blockquote className="border-l-2 border-primary/40 pl-3 italic text-sm text-muted-foreground">{block.content}</blockquote>}
                            {block.type === 'code' && (
                              <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">{block.content}</pre>
                            )}
                            {block.type === 'list' && (
                              <ul className={`text-sm text-muted-foreground space-y-0.5 ${block.ordered ? 'list-decimal' : 'list-disc'} pl-5`}>
                                {(block.items || []).map((item, li) => <li key={li}>{item}</li>)}
                              </ul>
                            )}
                            {block.type === 'cta' && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                                {block.buttonText || 'Button'}
                              </div>
                            )}
                            {block.type === 'divider' && <Separator />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/* Sidebar Section Component */
function SidebarSection({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <h4 className="text-xs font-semibold text-foreground tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}
