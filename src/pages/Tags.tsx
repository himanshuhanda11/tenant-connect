import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TagsSidebar } from '@/components/tags/TagsSidebar';
import { TagsListView } from '@/components/tags/TagsListView';
import { EmptyTagsState } from '@/components/tags/EmptyTagsState';
import { CreateTagModal } from '@/components/tags/CreateTagModal';
import { CreateRuleModal } from '@/components/tags/CreateRuleModal';
import { GuideBanner } from '@/components/help/GuideBanner';
import { useTags, useTagRules } from '@/hooks/useTags';
import { Tag, TagType, STARTER_TAGS } from '@/types/tag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tags as TagsIcon,
  Plus,
  Zap,
  Search,
  BookOpen,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const Tags = () => {
  const {
    tags,
    loading,
    filters,
    setFilters,
    createTag,
    updateTag,
    deleteTag,
    archiveTag,
    getTagGroups,
  } = useTags();

  const { rules, toggleRule } = useTagRules();

  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [preselectedTagId, setPreselectedTagId] = useState<string>('');

  const handleCreateTag = async (tagData: Partial<Tag>) => {
    return await createTag(tagData);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setCreateTagOpen(true);
  };

  const handleSaveTag = async (tagData: Partial<Tag>) => {
    if (editingTag) {
      await updateTag(editingTag.id, tagData);
    } else {
      await createTag(tagData);
    }
    setEditingTag(null);
  };

  const handleCreateRule = (tagId: string) => {
    setPreselectedTagId(tagId);
    setCreateRuleOpen(true);
  };

  const handleRestoreTag = async (tagId: string) => {
    await updateTag(tagId, { status: 'active' });
  };

  const handleCreateStarterTags = async (starterTags: Partial<Tag>[]) => {
    for (const tag of starterTags) {
      await createTag({ ...tag, status: 'active', apply_to: 'both' });
    }
  };

  const groups = getTagGroups();

  // Filter tags for display
  const displayTags = tags.filter(tag => {
    if (filters.type !== 'all' && tag.tag_type !== filters.type) return false;
    if (filters.status !== 'all' && tag.status !== filters.status) return false;
    if (filters.group && tag.tag_group !== filters.group) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return tag.name.toLowerCase().includes(searchLower) ||
             tag.description?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TagsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Tags</h1>
                <p className="text-sm text-muted-foreground">
                  Organize contacts and automate with intelligent tagging
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCreateRuleOpen(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
              <Button onClick={() => { setEditingTag(null); setCreateTagOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Guide Banner */}
        {tags.length > 0 && (
          <div className="shrink-0 mx-6 mt-4">
            <GuideBanner
              title="Quick Guide"
              description="Tags help segment your audience for targeted campaigns and automation."
              guideUrl="/help/contacts-tags"
              variant="compact"
              dismissible
            />
          </div>
        )}

        {/* Upgrade Banner - if applicable */}
        {tags.length >= 5 && (
          <div className="shrink-0 mx-6 mt-4">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">
                      Take your experience to the next level — unlock 100 tags with Pro! 🚀
                    </span>
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 mt-4">
          {/* Sidebar */}
          <TagsSidebar
            tags={tags}
            selectedType={filters.type}
            selectedStatus={filters.status}
            onSelectType={(type) => setFilters({ ...filters, type })}
            onSelectStatus={(status) => setFilters({ ...filters, status })}
            groups={groups}
            selectedGroup={filters.group}
            onSelectGroup={(group) => setFilters({ ...filters, group })}
          />

          {/* Content Area */}
          <div className="flex-1 flex flex-col p-6">
            {/* Search & Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tag name, type, group..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {displayTags.length} tag{displayTags.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Tags List or Empty State */}
            {!loading && tags.length === 0 ? (
              <EmptyTagsState
                onCreateTag={() => setCreateTagOpen(true)}
                onCreateStarterTags={handleCreateStarterTags}
              />
            ) : displayTags.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <TagsIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No tags match your filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            ) : (
              <TagsListView
                tags={displayTags}
                rules={rules}
                loading={loading}
                onEditTag={handleEditTag}
                onDeleteTag={deleteTag}
                onArchiveTag={archiveTag}
                onRestoreTag={handleRestoreTag}
                onCreateRule={handleCreateRule}
                onToggleRule={toggleRule}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateTagModal
          open={createTagOpen}
          onClose={() => { setCreateTagOpen(false); setEditingTag(null); }}
          onSubmit={handleSaveTag}
          editTag={editingTag}
        />

        <CreateRuleModal
          open={createRuleOpen}
          onClose={() => { setCreateRuleOpen(false); setPreselectedTagId(''); }}
          onSubmit={async (ruleData) => {
            // This would use the useTagRules hook's createRule
            return null;
          }}
          preselectedTagId={preselectedTagId}
        />
      </div>
    </DashboardLayout>
  );
};

export default Tags;
