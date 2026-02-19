import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  ChevronLeft, Search, BarChart3, Download, Eye,
  CheckCircle2, Clock, AlertCircle, FileText, Tag, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  processed: { label: 'Processed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: BarChart3 },
};

interface Submission {
  id: string;
  data_json: Record<string, any>;
  lead_score: number;
  tags: string[];
  status: string;
  submitted_at: string;
  contact_id: string | null;
}

export default function AutoFormSubmissions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formName, setFormName] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        // Load form
        const { data: form } = await (supabase as any).from('forms').select('*').eq('id', id).single();
        setFormName(form?.name || '');

        // Load field labels from active version
        if (form?.active_version_id) {
          const { data: version } = await (supabase as any).from('form_versions').select('schema_json').eq('id', form.active_version_id).single();
          if (version?.schema_json?.fields) {
            const labels: Record<string, string> = {};
            version.schema_json.fields.forEach((f: any) => { labels[f.id] = f.label; });
            setFieldLabels(labels);
          }
        }

        // Load submissions
        const { data: subs } = await (supabase as any)
          .from('form_submissions')
          .select('*')
          .eq('form_id', id)
          .order('submitted_at', { ascending: false });
        setSubmissions(subs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filtered = submissions.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch = !searchQuery || JSON.stringify(s.data_json).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = submissions.filter(s => s.status === 'completed' || s.status === 'processed').length;

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const allKeys = new Set<string>();
    filtered.forEach(s => Object.keys(s.data_json).forEach(k => allKeys.add(k)));
    const keys = Array.from(allKeys);
    const header = ['submitted_at', 'status', 'lead_score', 'tags', ...keys].join(',');
    const rows = filtered.map(s => [
      s.submitted_at,
      s.status,
      s.lead_score,
      `"${(s.tags || []).join('; ')}"`,
      ...keys.map(k => `"${String(s.data_json[k] || '').replace(/"/g, '""')}"`),
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formName}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b bg-card">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/auto-forms/${id}/builder`)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">{formName} — Submissions</h1>
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1" disabled={filtered.length === 0}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: submissions.length, icon: FileText },
              { label: 'Completed', value: completedCount, icon: CheckCircle2 },
              { label: 'Avg Score', value: submissions.length ? Math.round(submissions.reduce((s, sub) => s + (sub.lead_score || 0), 0) / submissions.length) : 0, icon: BarChart3 },
            ].map(s => (
              <Card key={s.label} className="bg-muted/30">
                <CardContent className="p-3 flex items-center gap-2.5">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b bg-muted/30 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search submissions..." className="pl-9 h-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submissions Table */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filtered.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/20 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No Submissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Submissions will appear here when contacts fill out this form.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map(sub => {
                  const status = statusConfig[sub.status] || statusConfig.partial;
                  const StatusIcon = status.icon;
                  const previewKeys = Object.keys(sub.data_json).slice(0, 3);
                  return (
                    <Card
                      key={sub.id}
                      className="transition-all hover:shadow-md cursor-pointer"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium truncate">
                              {sub.data_json.full_name || sub.data_json.name || sub.contact_id?.slice(0, 8) || 'Anonymous'}
                            </span>
                            <Badge className={cn("text-[9px] px-1.5 py-0 border-0", status.color)}>
                              <StatusIcon className="w-3 h-3 mr-0.5" />
                              {status.label}
                            </Badge>
                            {sub.lead_score > 0 && (
                              <Badge variant="outline" className="text-[9px]">
                                Score: {sub.lead_score}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            {previewKeys.map(k => (
                              <span key={k} className="truncate max-w-[120px]">
                                {fieldLabels[k] || k}: {String(sub.data_json[k])}
                              </span>
                            ))}
                          </div>
                          {(sub.tags || []).length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {sub.tags.map(t => (
                                <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">
                                  <Tag className="w-2.5 h-2.5 mr-0.5" />
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(sub.submitted_at), { addSuffix: true })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Submission Detail Drawer */}
      <Sheet open={!!selectedSubmission} onOpenChange={open => !open && setSelectedSubmission(null)}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Submission Details</SheetTitle>
            <SheetDescription>
              {selectedSubmission && format(new Date(selectedSubmission.submitted_at), 'PPpp')}
            </SheetDescription>
          </SheetHeader>
          {selectedSubmission && (
            <ScrollArea className="mt-4 h-[calc(100vh-140px)]">
              <div className="space-y-4 pr-4">
                {/* Status & Score */}
                <div className="flex gap-2">
                  <Badge className={cn("text-xs", statusConfig[selectedSubmission.status]?.color || '')}>
                    {selectedSubmission.status}
                  </Badge>
                  {selectedSubmission.lead_score > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Lead Score: {selectedSubmission.lead_score}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {(selectedSubmission.tags || []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSubmission.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs gap-1">
                          <Tag className="w-3 h-3" />
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Answers */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">Form Answers</p>
                  {Object.entries(selectedSubmission.data_json).map(([key, value]) => (
                    <div key={key} className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {fieldLabels[key] || key}
                      </p>
                      <p className="text-sm">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '—')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
