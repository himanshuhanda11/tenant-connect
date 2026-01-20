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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Share2, 
  Code, 
  Eye,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SeoEditDrawerProps {
  page: SeoPageWithMeta;
  open: boolean;
  onClose: () => void;
}

const defaultMeta: Partial<SeoMetaRecord> & { schema_jsonld: Json | null } = {
  title: '',
  description: '',
  keywords: '',
  canonical_url: '',
  robots: 'index,follow',
  og_title: '',
  og_description: '',
  og_image: '',
  og_type: 'website',
  twitter_card: 'summary_large_image',
  twitter_title: '',
  twitter_description: '',
  twitter_image: '',
  schema_jsonld: null,
  is_published: true,
};

export default function SeoEditDrawer({ page, open, onClose }: SeoEditDrawerProps) {
  const { updateMeta, fetchPages } = useSeoPages();
  const { toast } = useToast();
  
  const existingMeta = page.seo_meta?.[0];
  const [form, setForm] = useState<Partial<SeoMetaRecord>>({
    ...defaultMeta,
    ...existingMeta,
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingMeta) {
      setForm({ ...defaultMeta, ...existingMeta });
    }
  }, [existingMeta]);

  const handleChange = (field: keyof SeoMetaRecord, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleJsonChange = (value: string) => {
    try {
      if (value.trim() === '') {
        setForm(prev => ({ ...prev, schema_jsonld: null }));
        setJsonError(null);
        return;
      }
      const parsed = JSON.parse(value);
      setForm(prev => ({ ...prev, schema_jsonld: parsed }));
      setJsonError(null);
    } catch (e) {
      setJsonError('Invalid JSON');
    }
  };

  const handleSave = async (publish: boolean = true) => {
    if (!existingMeta?.id) {
      toast({
        title: 'Error',
        description: 'No meta record found',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const success = await updateMeta({
      id: existingMeta.id,
      ...form,
      is_published: publish,
    });

    if (success) {
      clearSeoCache(page.route_path);
      await fetchPages();
      onClose();
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (existingMeta) {
      setForm({ ...defaultMeta, ...existingMeta });
    }
  };

  // Preview helpers
  const previewTitle = form.title || `${page.page_name} - AiReatro`;
  const previewDescription = form.description || 'No description set';
  const previewUrl = `https://aireatro.com${page.route_path}`;

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Edit SEO: {page.page_name}
            <Badge variant={page.is_public ? 'outline' : 'secondary'}>
              {page.is_public ? 'Public' : 'Private'}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs">
                <Share2 className="h-3 w-3 mr-1" />
                Social
              </TabsTrigger>
              <TabsTrigger value="schema" className="text-xs">
                <Code className="h-3 w-3 mr-1" />
                Schema
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Basic SEO */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Page Title"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {(form.title?.length || 0)}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Meta Description</Label>
                <Textarea
                  id="description"
                  value={form.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description for search results"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {(form.description?.length || 0)}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={form.keywords || ''}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  value={form.canonical_url || ''}
                  onChange={(e) => handleChange('canonical_url', e.target.value)}
                  placeholder="https://aireatro.com/page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots">Robots</Label>
                <Input
                  id="robots"
                  value={form.robots || ''}
                  onChange={(e) => handleChange('robots', e.target.value)}
                  placeholder="index,follow"
                />
              </div>
            </TabsContent>

            {/* Social / Open Graph */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Open Graph</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="og_title">OG Title</Label>
                    <Input
                      id="og_title"
                      value={form.og_title || ''}
                      onChange={(e) => handleChange('og_title', e.target.value)}
                      placeholder="Leave empty to use page title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="og_description">OG Description</Label>
                    <Textarea
                      id="og_description"
                      value={form.og_description || ''}
                      onChange={(e) => handleChange('og_description', e.target.value)}
                      placeholder="Leave empty to use meta description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="og_image">OG Image URL</Label>
                    <Input
                      id="og_image"
                      value={form.og_image || ''}
                      onChange={(e) => handleChange('og_image', e.target.value)}
                      placeholder="https://aireatro.com/og-image.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="og_type">OG Type</Label>
                    <Input
                      id="og_type"
                      value={form.og_type || 'website'}
                      onChange={(e) => handleChange('og_type', e.target.value)}
                      placeholder="website"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Twitter Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="twitter_card">Card Type</Label>
                    <Input
                      id="twitter_card"
                      value={form.twitter_card || 'summary_large_image'}
                      onChange={(e) => handleChange('twitter_card', e.target.value)}
                      placeholder="summary_large_image"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_title">Twitter Title</Label>
                    <Input
                      id="twitter_title"
                      value={form.twitter_title || ''}
                      onChange={(e) => handleChange('twitter_title', e.target.value)}
                      placeholder="Leave empty to use OG title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_description">Twitter Description</Label>
                    <Textarea
                      id="twitter_description"
                      value={form.twitter_description || ''}
                      onChange={(e) => handleChange('twitter_description', e.target.value)}
                      placeholder="Leave empty to use OG description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_image">Twitter Image URL</Label>
                    <Input
                      id="twitter_image"
                      value={form.twitter_image || ''}
                      onChange={(e) => handleChange('twitter_image', e.target.value)}
                      placeholder="Leave empty to use OG image"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* JSON-LD Schema */}
            <TabsContent value="schema" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>JSON-LD Schema</Label>
                <Textarea
                  value={form.schema_jsonld ? JSON.stringify(form.schema_jsonld, null, 2) : ''}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage"}'
                  rows={12}
                  className="font-mono text-xs"
                />
                {jsonError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {jsonError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter valid JSON-LD structured data for this page.
                </p>
              </div>
            </TabsContent>

            {/* Preview */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              {/* Google Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Google Search Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                      {previewTitle}
                    </div>
                    <div className="text-green-700 text-sm truncate">
                      {previewUrl}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {previewDescription}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OG Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Social Share Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg border overflow-hidden max-w-sm">
                    {form.og_image && (
                      <div className="h-40 bg-muted flex items-center justify-center">
                        <img
                          src={form.og_image}
                          alt="OG Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-xs text-muted-foreground uppercase">
                        aireatro.com
                      </div>
                      <div className="font-semibold text-sm truncate">
                        {form.og_title || previewTitle}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {form.og_description || previewDescription}
                      </div>
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
              <Switch
                id="is_published"
                checked={form.is_published}
                onCheckedChange={(checked) => handleChange('is_published', checked)}
              />
              <Label htmlFor="is_published" className="text-sm">
                Published
              </Label>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={() => handleSave(form.is_published!)} disabled={saving || !!jsonError}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
