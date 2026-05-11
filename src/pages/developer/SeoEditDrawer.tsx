import { useState, useEffect } from 'react';
import { SeoPageWithMeta, SeoMetaRecord, useSeoPages } from '@/hooks/useSeoPages';
import { Json } from '@/integrations/supabase/types';
import { clearSeoCache } from '@/components/seo/SeoMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, Share2, Code, Eye, Save, RotateCcw, AlertCircle, Sparkles, Loader2, CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SeoEditDrawerProps {
  page: SeoPageWithMeta;
  open: boolean;
  onClose: () => void;
}

const defaultMeta: Partial<SeoMetaRecord> & { schema_jsonld: Json | null } = {
  title: '', description: '', keywords: '', canonical_url: '',
  robots: 'index,follow', og_title: '', og_description: '', og_image: '',
  og_type: 'website', twitter_card: 'summary_large_image', twitter_title: '',
  twitter_description: '', twitter_image: '', schema_jsonld: null, is_published: true,
};

export default function SeoEditDrawer({ page, open, onClose }: SeoEditDrawerProps) {
  const { updateMeta, fetchPages, generateAiSeo } = useSeoPages();
  const { toast } = useToast();

  const existingMeta = page.seo_meta?.[0];
  const [form, setForm] = useState<Partial<SeoMetaRecord>>({ ...defaultMeta, ...existingMeta });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (existingMeta) setForm({ ...defaultMeta, ...existingMeta });
  }, [existingMeta]);

  const handleChange = (field: keyof SeoMetaRecord, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleJsonChange = (value: string) => {
    try {
      if (value.trim() === '') { setForm(prev => ({ ...prev, schema_jsonld: null })); setJsonError(null); return; }
      const parsed = JSON.parse(value);
      setForm(prev => ({ ...prev, schema_jsonld: parsed }));
      setJsonError(null);
    } catch { setJsonError('Invalid JSON'); }
  };

  const handleSave = async (publish: boolean = true) => {
    if (!existingMeta?.id) { toast({ title: 'Error', description: 'No meta record found', variant: 'destructive' }); return; }
    setSaving(true);
    const success = await updateMeta({ id: existingMeta.id, ...form, is_published: publish });
    if (success) { clearSeoCache(page.route_path); await fetchPages(); onClose(); }
    setSaving(false);
  };

  const handleAiGenerate = async () => {
    setGenerating(true);
    const result = await generateAiSeo(page.page_name, page.route_path, page.page_type, form.title || undefined, form.description || undefined);
    if (result) {
      setForm(prev => ({
        ...prev,
        title: result.title,
        description: result.description,
        keywords: result.keywords,
        og_title: result.og_title,
        og_description: result.og_description,
      }));
      toast({ title: 'AI SEO Generated', description: 'Review the suggestions and save when ready.' });
    }
    setGenerating(false);
  };

  const handleReset = () => { if (existingMeta) setForm({ ...defaultMeta, ...existingMeta }); };

  const previewTitle = form.title || `${page.page_name} - AiReatro`;
  const previewDescription = form.description || 'No description set';
  const previewUrl = `https://aireatro.com${page.route_path}`;

  // SEO score
  const fields = ['title', 'description', 'keywords', 'canonical_url', 'og_title', 'og_description', 'og_image', 'twitter_title', 'twitter_description'];
  const filled = fields.filter(f => form[f as keyof typeof form] && String(form[f as keyof typeof form]).trim()).length;
  const scorePercent = Math.round((filled / fields.length) * 100);

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            Edit SEO: {page.page_name}
            <Badge variant={page.is_public ? 'outline' : 'secondary'} className="text-xs capitalize">{page.page_type}</Badge>
          </SheetTitle>
          {/* Score bar */}
          <div className="flex items-center gap-3 pt-2">
            <Progress value={scorePercent} className="h-2 flex-1" />
            <span className={`text-sm font-semibold ${scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
              {scorePercent}%
            </span>
          </div>
        </SheetHeader>

        {/* AI Generate Button */}
        <div className="mt-3">
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all"
            onClick={handleAiGenerate}
            disabled={generating}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating with AI...</>
            ) : (
              <><Sparkles className="h-4 w-4 text-primary" />Auto-Generate SEO with AI</>
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="text-xs gap-1"><Search className="h-3 w-3" />Basic</TabsTrigger>
              <TabsTrigger value="social" className="text-xs gap-1"><Share2 className="h-3 w-3" />Social</TabsTrigger>
              <TabsTrigger value="schema" className="text-xs gap-1"><Code className="h-3 w-3" />Schema</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1"><Eye className="h-3 w-3" />Preview</TabsTrigger>
            </TabsList>

            {/* Basic SEO */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <span className={`text-xs ${(form.title?.length || 0) > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {form.title?.length || 0}/60
                  </span>
                </div>
                <Input id="title" value={form.title || ''} onChange={(e) => handleChange('title', e.target.value)} placeholder="Page Title" />
                {(form.title?.length || 0) > 60 && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Title too long — may be truncated in search results</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Meta Description</Label>
                  <span className={`text-xs ${(form.description?.length || 0) > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {form.description?.length || 0}/160
                  </span>
                </div>
                <Textarea id="description" value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Brief description for search results" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input id="keywords" value={form.keywords || ''} onChange={(e) => handleChange('keywords', e.target.value)} placeholder="keyword1, keyword2, keyword3" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input id="canonical_url" value={form.canonical_url || ''} onChange={(e) => handleChange('canonical_url', e.target.value)} placeholder="https://aireatro.com/page" />
              </div>

              <div className="space-y-2">
                <Label>Robots</Label>
                <Select value={form.robots || 'index,follow'} onValueChange={(v) => handleChange('robots', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">index, follow</SelectItem>
                    <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                    <SelectItem value="index,nofollow">index, nofollow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Social */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Open Graph</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>OG Title</Label>
                    <Input value={form.og_title || ''} onChange={(e) => handleChange('og_title', e.target.value)} placeholder="Leave empty to use page title" />
                  </div>
                  <div className="space-y-2">
                    <Label>OG Description</Label>
                    <Textarea value={form.og_description || ''} onChange={(e) => handleChange('og_description', e.target.value)} placeholder="Leave empty to use meta description" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>OG Image URL</Label>
                    <Input value={form.og_image || ''} onChange={(e) => handleChange('og_image', e.target.value)} placeholder="https://aireatro.com/og-image.png" />
                  </div>
                  <div className="space-y-2">
                    <Label>OG Type</Label>
                    <Select value={form.og_type || 'website'} onValueChange={(v) => handleChange('og_type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">website</SelectItem>
                        <SelectItem value="article">article</SelectItem>
                        <SelectItem value="product">product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Twitter Card</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Card Type</Label>
                    <Select value={form.twitter_card || 'summary_large_image'} onValueChange={(v) => handleChange('twitter_card', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                        <SelectItem value="summary">summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Title</Label>
                    <Input value={form.twitter_title || ''} onChange={(e) => handleChange('twitter_title', e.target.value)} placeholder="Leave empty to use OG title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Description</Label>
                    <Textarea value={form.twitter_description || ''} onChange={(e) => handleChange('twitter_description', e.target.value)} placeholder="Leave empty to use OG description" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Image URL</Label>
                    <Input value={form.twitter_image || ''} onChange={(e) => handleChange('twitter_image', e.target.value)} placeholder="Leave empty to use OG image" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schema */}
            <TabsContent value="schema" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>JSON-LD Schema</Label>
                <Textarea
                  value={form.schema_jsonld ? JSON.stringify(form.schema_jsonld, null, 2) : ''}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage"}'
                  rows={14}
                  className="font-mono text-xs"
                />
                {jsonError && (
                  <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{jsonError}</p>
                )}
              </div>
            </TabsContent>

            {/* Preview */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" />Google Search Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border shadow-sm">
                    <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate font-medium">{previewTitle}</div>
                    <div className="text-green-800 text-sm truncate">{previewUrl}</div>
                    <div className="text-gray-600 text-sm line-clamp-2 mt-0.5">{previewDescription}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Share2 className="h-4 w-4 text-primary" />Social Share Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden max-w-sm">
                    {(form.og_image || '') && (
                      <div className="h-44 bg-muted flex items-center justify-center">
                        <img src={form.og_image || ''} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                    <div className="p-3 space-y-0.5">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">aireatro.com</div>
                      <div className="font-semibold text-sm text-gray-900 truncate">{form.og_title || previewTitle}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{form.og_description || previewDescription}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 flex-1">
              <Switch id="is_published" checked={form.is_published} onCheckedChange={(checked) => handleChange('is_published', checked)} />
              <Label htmlFor="is_published" className="text-sm">Published</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-4 w-4 mr-1" />Reset</Button>
            <Button onClick={() => handleSave(form.is_published!)} disabled={saving || !!jsonError} className="bg-gradient-to-r from-primary to-primary/80">
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-1" />Save</>}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
