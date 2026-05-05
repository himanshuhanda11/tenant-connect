import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Send,
  Zap,
  Users,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Segment, SegmentFilters } from '@/types/segment';
import { CreateSegmentModal } from '@/components/contacts/CreateSegmentModal';


const FILTER_LABELS: Record<string, string> = {
  leadStatus: 'Status',
  priority: 'Priority',
  mauStatus: 'Activity',
  country: 'Country',
  tags: 'Tags',
  source: 'Source',
};

// Render order for predictable, scannable summaries
const FILTER_ORDER = ['leadStatus', 'priority', 'mauStatus', 'source', 'country', 'tags'] as const;

interface FilterSummaryPart {
  key: string;
  label: string;
  display: string;
  count: number;
}

function getFilterParts(filters: SegmentFilters): FilterSummaryPart[] {
  if (!filters) return [];
  const seen = new Set<string>();
  const ordered: string[] = [
    ...FILTER_ORDER.filter((k) => k in filters),
    ...Object.keys(filters).filter((k) => !FILTER_ORDER.includes(k as typeof FILTER_ORDER[number])),
  ];
  const parts: FilterSummaryPart[] = [];
  ordered.forEach((key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const value = (filters as Record<string, unknown>)[key];
    if (!Array.isArray(value) || value.length === 0) return;
    const shown = value.slice(0, 2).join(', ');
    const extra = value.length > 2 ? ` +${value.length - 2}` : '';
    parts.push({
      key,
      label: FILTER_LABELS[key] || key,
      display: `${shown}${extra}`,
      count: value.length,
    });
  });
  return parts;
}

function summarizeFilters(filters: SegmentFilters): string {
  const parts = getFilterParts(filters);
  if (parts.length === 0) return 'All contacts — no filters applied';
  return parts.map((p) => `${p.label}: ${p.display}`).join(' · ');
}

export default function ContactSegments() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleUseInCampaign = (segment: Segment) =>
    navigate(`/campaigns/create?segment=${segment.id}`);
  const handleUseInAutomation = (segment: Segment) =>
    navigate(`/flows/builder?segment=${segment.id}`);
  const handleEditSegment = (segment: Segment) => {
    toast.info(`Edit "${segment.name}" — coming soon`);
  };

  const fetchSegments = useCallback(async () => {
    if (!currentTenant?.id) return;

    setLoading(true);
    try {
      // For now, using mock data since segments table doesn't exist yet
      // In production, this would fetch from the database
      const mockSegments: Segment[] = [
        {
          id: '1',
          tenant_id: currentTenant.id,
          name: 'High Value Leads',
          description: 'Qualified leads with high priority',
          filters: { leadStatus: ['qualified'], priority: ['high', 'urgent'] },
          contact_count: 145,
          is_smart: true,
          created_by: null,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          tenant_id: currentTenant.id,
          name: 'Inactive Customers',
          description: 'Customers who haven\'t engaged in 30 days',
          filters: { mauStatus: ['inactive'] },
          contact_count: 89,
          is_smart: true,
          created_by: null,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          tenant_id: currentTenant.id,
          name: 'UAE Customers',
          description: 'Contacts from United Arab Emirates',
          filters: { country: ['AE'] },
          contact_count: 234,
          is_smart: false,
          created_by: null,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setSegments(mockSegments);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSegment = async (name: string, description: string, filters: SegmentFilters) => {
    toast.success(`Segment "${name}" created`);
    fetchSegments();
  };

  const handleDeleteSegment = async (segmentId: string) => {
    toast.success('Segment deleted');
    setSegments(segments.filter((s) => s.id !== segmentId));
  };

  const handleDuplicateSegment = async (segment: Segment) => {
    toast.success(`Segment "${segment.name}" duplicated`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FolderOpen className="h-5 w-5" />
                  Segments
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {segments.length} saved filter{segments.length !== 1 ? 's' : ''} — reuse across campaigns and automations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search segments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button size="sm" onClick={() => setShowCreateModal(true)} className="shrink-0">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {loading ? (
              <>
                {/* Mobile skeletons */}
                <div className="space-y-3 md:hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-8 w-14 rounded-md" />
                      </div>
                      <div className="flex gap-1.5">
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-12 w-full rounded-md" />
                      <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-border/60">
                        {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-9 w-full" />)}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop skeleton table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Rules</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(4)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="flex items-center gap-2"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-40" /></div></TableCell>
                          <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : filteredSegments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">
                  {searchQuery ? 'No matching segments' : 'No segments yet'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {searchQuery
                    ? `Nothing matches "${searchQuery}". Try a different search.`
                    : 'Create segments to save and reuse contact filters'}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                ) : (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Segment
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {filteredSegments.map((segment) => {
                    const parts = getFilterParts(segment.filters);
                    return (
                      <div
                        key={segment.id}
                        className="rounded-xl border border-border/60 bg-card p-4 shadow-sm active:scale-[0.99] transition-transform"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <FolderOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm truncate">{segment.name}</p>
                              {segment.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {segment.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 text-xs px-3 shrink-0"
                            onClick={() => handleUseInCampaign(segment)}
                          >
                            <Send className="h-3 w-3 mr-1.5" />
                            Use
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Users className="h-3 w-3" />
                            {segment.contact_count.toLocaleString()} contacts
                          </Badge>
                          <Badge variant={segment.is_smart ? 'default' : 'outline'} className="text-[10px] gap-1">
                            {segment.is_smart && <Zap className="h-3 w-3" />}
                            {segment.is_smart ? 'Smart' : 'Static'}
                          </Badge>
                        </div>

                        <div className="mt-2.5 rounded-md bg-muted/40 px-2.5 py-1.5">
                          {parts.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">
                              All contacts — no filters applied
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {parts.map((p) => (
                                <span
                                  key={p.key}
                                  className="inline-flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] border border-border/40"
                                >
                                  <span className="font-medium text-foreground/70">{p.label}:</span>
                                  <span className="text-muted-foreground">{p.display}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-border/60">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-0 text-[11px] flex-col gap-0.5"
                            onClick={() => handleUseInAutomation(segment)}
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Flow
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-0 text-[11px] flex-col gap-0.5"
                            onClick={() => handleEditSegment(segment)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-0 text-[11px] flex-col gap-0.5"
                            onClick={() => handleDuplicateSegment(segment)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-0 text-[11px] flex-col gap-0.5 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSegment(segment.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>

                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                          Updated {formatDistanceToNow(new Date(segment.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Rules</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSegments.map((segment) => (
                        <TableRow key={segment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-muted-foreground" />
                              <div className="min-w-0">
                                <div className="font-medium">{segment.name}</div>
                                {segment.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-xs">
                                    {segment.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-sm truncate">
                            {summarizeFilters(segment.filters)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {segment.contact_count.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={segment.is_smart ? 'default' : 'outline'}>
                              {segment.is_smart ? 'Smart' : 'Static'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(segment.updated_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUseInCampaign(segment)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Use in Campaign
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUseInAutomation(segment)}>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Use in Automation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSegment(segment)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Segment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateSegment(segment)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSegment(segment.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateSegmentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSegment}
        filters={{}}
        availableTags={[]}
      />
    </DashboardLayout>
  );
}
