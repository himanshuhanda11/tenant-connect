import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TagsSidebar } from '@/components/tags/TagsSidebar';
import { TagsListView } from '@/components/tags/TagsListView';
import { EmptyTagsState } from '@/components/tags/EmptyTagsState';
import { CreateTagModal } from '@/components/tags/CreateTagModal';
import { CreateRuleModal } from '@/components/tags/CreateRuleModal';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { useTags, useTagRules } from '@/hooks/useTags';
import { Tag, TagType, STARTER_TAGS } from '@/types/tag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tags as TagsIcon,
  Plus,
  Zap,
  Search,
  LayoutGrid,
  List,
  Filter,
  SlidersHorizontal,
  ArrowUpDown
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  // Stats
  const activeCount = tags.filter(t => t.status === 'active').length;
  const archivedCount = tags.filter(t => t.status === 'archived').length;
  const rulesCount = rules.length;

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-background">
        {/* Modern Header */}
        <div className="shrink-0 border-b bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                  <TagsIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Organize contacts and automate with intelligent tagging
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCreateRuleOpen(true)} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Create Rule
                </Button>
                <Button size="sm" onClick={() => { setEditingTag(null); setCreateTagOpen(true); }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Tag
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">{activeCount}</span>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-sm font-medium">{archivedCount}</span>
                <span className="text-sm text-muted-foreground">Archived</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-sm font-medium">{rulesCount}</span>
                <span className="text-sm text-muted-foreground">Rules</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Guide */}
        <div className="shrink-0 px-6 pt-4">
          <QuickGuide
            description={quickGuides.tags.description}
            links={quickGuides.tags.links}
          />
        </div>

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
          <div className="flex-1 flex flex-col px-6 pb-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9 h-9 bg-muted/30"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {displayTags.length} tag{displayTags.length !== 1 ? 's' : ''}
                </span>
                
                <div className="h-4 w-px bg-border mx-1" />
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'grid')} className="h-9">
                  <TabsList className="h-9 p-1 bg-muted/50">
                    <TabsTrigger value="list" className="h-7 px-2.5 data-[state=active]:bg-background">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="h-7 px-2.5 data-[state=active]:bg-background">
                      <LayoutGrid className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Tags List or Empty State */}
            <div className="flex-1 overflow-auto">
              {!loading && tags.length === 0 ? (
                <EmptyTagsState
                  onCreateTag={() => setCreateTagOpen(true)}
                  onCreateStarterTags={handleCreateStarterTags}
                />
              ) : displayTags.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-7 w-7 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">No tags found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Try adjusting your search or filter criteria to find what you're looking for
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setFilters({ search: '', type: 'all', status: 'all', group: '' })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <TagsListView
                  tags={displayTags}
                  rules={rules}
                  loading={loading}
                  viewMode={viewMode}
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
            return null;
          }}
          preselectedTagId={preselectedTagId}
        />
      </div>
    </DashboardLayout>
  );
};

export default Tags;