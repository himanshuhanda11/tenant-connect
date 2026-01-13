import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { GUIDE_CATEGORIES } from '@/data/guideContent';

interface Guide {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  category_id: string | null;
  sidebar_key: string | null;
  difficulty: string | null;
  reading_time_minutes: number | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
}

const SIDEBAR_KEYS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'tags', label: 'Tags' },
  { key: 'user-attributes', label: 'User Attributes' },
  { key: 'phone-numbers', label: 'Phone Numbers' },
  { key: 'templates', label: 'Templates' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'automation', label: 'Automation' },
  { key: 'team', label: 'Team' },
  { key: 'billing', label: 'Billing' },
  { key: 'settings', label: 'Settings' },
];

export function GuideManager() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<Partial<Guide> | null>(null);
  const { currentTenant, currentRole } = useTenant();

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';

  useEffect(() => {
    fetchGuides();
    fetchCategories();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('title');

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
      toast.error('Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNewGuide = () => {
    setCurrentGuide({
      title: '',
      slug: '',
      summary: '',
      content: '',
      difficulty: 'beginner',
      reading_time_minutes: 5,
      is_published: false,
      is_featured: false,
    });
    setIsEditing(true);
  };

  const handleEditGuide = (guide: Guide) => {
    setCurrentGuide(guide);
    setIsEditing(true);
  };

  const handleSaveGuide = async () => {
    if (!currentGuide?.title || !currentGuide?.slug || !currentGuide?.content) {
      toast.error('Title, slug, and content are required');
      return;
    }

    try {
      if (currentGuide.id) {
        // Update existing guide
        const { error } = await supabase
          .from('guides')
          .update({
            title: currentGuide.title,
            slug: currentGuide.slug,
            summary: currentGuide.summary,
            content: currentGuide.content,
            category_id: currentGuide.category_id,
            sidebar_key: currentGuide.sidebar_key,
            difficulty: currentGuide.difficulty,
            reading_time_minutes: currentGuide.reading_time_minutes,
            is_published: currentGuide.is_published,
            is_featured: currentGuide.is_featured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentGuide.id);

        if (error) throw error;
        toast.success('Guide updated successfully');
      } else {
        // Create new guide
        const { error } = await supabase
          .from('guides')
          .insert({
            title: currentGuide.title,
            slug: currentGuide.slug,
            summary: currentGuide.summary || '',
            content: currentGuide.content,
            category_id: currentGuide.category_id,
            sidebar_key: currentGuide.sidebar_key,
            difficulty: currentGuide.difficulty || 'beginner',
            reading_time_minutes: currentGuide.reading_time_minutes || 5,
            is_published: currentGuide.is_published || false,
            is_featured: currentGuide.is_featured || false,
          });

        if (error) throw error;
        toast.success('Guide created successfully');
      }

      setIsEditing(false);
      setCurrentGuide(null);
      fetchGuides();
    } catch (error) {
      console.error('Error saving guide:', error);
      toast.error('Failed to save guide');
    }
  };

  const handleDeleteGuide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Guide deleted');
      fetchGuides();
    } catch (error) {
      console.error('Error deleting guide:', error);
      toast.error('Failed to delete guide');
    }
  };

  const handleTogglePublish = async (guide: Guide) => {
    try {
      const { error } = await supabase
        .from('guides')
        .update({ is_published: !guide.is_published })
        .eq('id', guide.id);

      if (error) throw error;
      toast.success(guide.is_published ? 'Guide unpublished' : 'Guide published');
      fetchGuides();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update guide');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">You don't have permission to manage guides.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Guide Manager</h2>
          <p className="text-muted-foreground">Create and manage help center guides</p>
        </div>
        <Button onClick={handleNewGuide} className="gap-2">
          <Plus className="h-4 w-4" />
          New Guide
        </Button>
      </div>

      {/* Guide List */}
      <div className="grid gap-4">
        {guides.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <p className="text-muted-foreground mb-4">No guides created yet</p>
              <Button onClick={handleNewGuide} variant="outline">
                Create Your First Guide
              </Button>
            </CardContent>
          </Card>
        ) : (
          guides.map((guide) => (
            <Card key={guide.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{guide.title}</h3>
                      <Badge variant={guide.is_published ? 'default' : 'secondary'}>
                        {guide.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      {guide.is_featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {guide.summary || 'No summary'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>/{guide.slug}</span>
                      {guide.sidebar_key && (
                        <span>Sidebar: {guide.sidebar_key}</span>
                      )}
                      <span>{guide.reading_time_minutes || 5} min read</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(guide)}
                    >
                      {guide.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGuide(guide)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGuide(guide.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentGuide?.id ? 'Edit Guide' : 'New Guide'}
            </DialogTitle>
            <DialogDescription>
              Create or edit a help center guide
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={currentGuide?.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCurrentGuide({
                        ...currentGuide,
                        title,
                        slug: currentGuide?.id ? currentGuide.slug : generateSlug(title),
                      });
                    }}
                    placeholder="Guide title"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={currentGuide?.slug || ''}
                    onChange={(e) => setCurrentGuide({ ...currentGuide, slug: e.target.value })}
                    placeholder="guide-url-slug"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={currentGuide?.summary || ''}
                    onChange={(e) => setCurrentGuide({ ...currentGuide, summary: e.target.value })}
                    placeholder="Brief description of this guide"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                      value={currentGuide?.category_id || ''}
                      onValueChange={(value) => setCurrentGuide({ ...currentGuide, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Sidebar Link</Label>
                    <Select
                      value={currentGuide?.sidebar_key || ''}
                      onValueChange={(value) => setCurrentGuide({ ...currentGuide, sidebar_key: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Link to sidebar item" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIDEBAR_KEYS.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Content (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={currentGuide?.content || ''}
                  onChange={(e) => setCurrentGuide({ ...currentGuide, content: e.target.value })}
                  placeholder="Write your guide content here..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={currentGuide?.difficulty || 'beginner'}
                    onValueChange={(value) => setCurrentGuide({ ...currentGuide, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="readingTime">Reading Time (minutes)</Label>
                  <Input
                    id="readingTime"
                    type="number"
                    min={1}
                    max={60}
                    value={currentGuide?.reading_time_minutes || 5}
                    onChange={(e) => setCurrentGuide({ ...currentGuide, reading_time_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <Label>Published</Label>
                  <p className="text-sm text-muted-foreground">Make this guide visible to users</p>
                </div>
                <Switch
                  checked={currentGuide?.is_published || false}
                  onCheckedChange={(checked) => setCurrentGuide({ ...currentGuide, is_published: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show in featured guides section</p>
                </div>
                <Switch
                  checked={currentGuide?.is_featured || false}
                  onCheckedChange={(checked) => setCurrentGuide({ ...currentGuide, is_featured: checked })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGuide} className="gap-2">
              <Save className="h-4 w-4" />
              Save Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
