import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Play,
  Send,
  Zap,
  Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Segment, SegmentFilters } from '@/types/segment';
import { CreateSegmentModal } from '@/components/contacts/CreateSegmentModal';
import { useIsMobile } from '@/hooks/use-mobile';

const FILTER_LABELS: Record<string, string> = {
  leadStatus: 'Status',
  priority: 'Priority',
  mauStatus: 'Activity',
  country: 'Country',
  tags: 'Tags',
  source: 'Source',
};

function summarizeFilters(filters: SegmentFilters): string {
  const parts: string[] = [];
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      parts.push(`${FILTER_LABELS[key] || key}: ${value.slice(0, 2).join(', ')}${value.length > 2 ? ` +${value.length - 2}` : ''}`);
    }
  });
  return parts.join(' · ') || 'No filters';
}

export default function ContactSegments() {
  const { currentTenant } = useTenant();
  const isMobile = useIsMobile();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Segments</h1>
            <p className="text-muted-foreground">
              Create and manage saved contact filters
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Segments</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage saved contact filters
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FolderOpen className="h-5 w-5" />
                  All Segments
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {segments.length} segment{segments.length !== 1 ? 's' : ''} created
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search segments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredSegments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">No segments found</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Create segments to save and reuse contact filters
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Segment
                </Button>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {filteredSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="rounded-xl border border-border/60 bg-card p-4 shadow-sm active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FolderOpen className="h-4.5 w-4.5 text-primary" />
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2 -mt-1 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />View Contacts
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />Use in Campaign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Zap className="h-4 w-4 mr-2" />Use in Automation
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" />Edit Segment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateSegment(segment)}>
                            <Copy className="h-4 w-4 mr-2" />Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSegment(segment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

                    <p className="text-[11px] text-muted-foreground mt-2.5 line-clamp-1">
                      <span className="font-medium text-foreground/70">Rules:</span>{' '}
                      {summarizeFilters(segment.filters)}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(segment.updated_at), { addSuffix: true })}
                      </span>
                      <Button size="sm" variant="outline" className="h-8 text-xs px-3">
                        <Send className="h-3 w-3 mr-1.5" />
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
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
                          <span className="font-medium">{segment.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {segment.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {segment.contact_count}
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
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              View Contacts
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Use in Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Zap className="h-4 w-4 mr-2" />
                              Use in Automation
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
