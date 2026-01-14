import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  GitBranch,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  ArrowRight,
  Clock,
  Tag,
  TrendingUp,
  Shield,
  Info,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface AttributionRule {
  id: string;
  name: string;
  priority: number;
  source_type: string;
  attribution_window: '1_day' | '7_days' | '28_days';
  set_source: string;
  set_tags: string[];
  is_active: boolean;
}

const MOCK_RULES: AttributionRule[] = [
  {
    id: '1',
    name: 'Meta Ads Attribution',
    priority: 1,
    source_type: 'meta_ads',
    attribution_window: '7_days',
    set_source: 'Meta Ads',
    set_tags: ['Meta Lead', 'Paid'],
    is_active: true,
  },
  {
    id: '2',
    name: 'QR Code Scans',
    priority: 2,
    source_type: 'qr',
    attribution_window: '1_day',
    set_source: 'QR Code',
    set_tags: ['QR Lead'],
    is_active: true,
  },
  {
    id: '3',
    name: 'Website Widget',
    priority: 3,
    source_type: 'website',
    attribution_window: '7_days',
    set_source: 'Website',
    set_tags: ['Website Lead'],
    is_active: true,
  },
  {
    id: '4',
    name: 'API Integration',
    priority: 4,
    source_type: 'api',
    attribution_window: '28_days',
    set_source: 'API',
    set_tags: ['CRM Lead'],
    is_active: false,
  },
];

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  meta_ads: TrendingUp,
  qr: Tag,
  website: Shield,
  api: GitBranch,
};

const WINDOW_LABELS: Record<string, string> = {
  '1_day': '1 Day',
  '7_days': '7 Days',
  '28_days': '28 Days',
};

export default function MetaAdsAttribution() {
  const [rules, setRules] = useState(MOCK_RULES);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AttributionRule | null>(null);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
    ));
    toast.success('Rule updated');
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success('Rule deleted');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Quick Guide */}
        <QuickGuide {...quickGuides.metaAds} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <GitBranch className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Attribution Rules</h1>
              <p className="text-muted-foreground">
                Configure how leads are attributed to sources
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {/* Explanation */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 border-0 shadow-md">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">How Attribution Works</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                When a new contact messages you, AIREATRO checks attribution rules in priority order. 
                The first matching rule determines the contact's source and applies tags automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Priority Order */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Attribution Priority
            </CardTitle>
            <CardDescription>
              Drag to reorder. Higher priority rules are checked first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {rules
                .filter(r => r.is_active)
                .sort((a, b) => a.priority - b.priority)
                .map((rule, idx, arr) => {
                  const Icon = SOURCE_ICONS[rule.source_type] || GitBranch;
                  return (
                    <div key={rule.id} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{rule.name}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Rules Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Rules</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>Attribution Window</TableHead>
                  <TableHead>Applied Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.sort((a, b) => a.priority - b.priority).map((rule) => {
                  const Icon = SOURCE_ICONS[rule.source_type] || GitBranch;
                  return (
                    <TableRow key={rule.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground cursor-grab">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-xs text-muted-foreground">Priority #{rule.priority}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {rule.source_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{WINDOW_LABELS[rule.attribution_window]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.set_tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingRule(rule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attribution Preview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Attribution Preview</CardTitle>
            <CardDescription>See how a sample lead would be attributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 rounded-xl bg-muted/50 border">
                <p className="text-sm text-muted-foreground mb-1">Incoming Lead</p>
                <p className="font-medium">+971 50 123 4567</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clicked Ad 2 days ago • Campaign: Summer Sale
                </p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-primary" />
              
              <div className="flex-1 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Attribution Result</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Source:</span>
                    <Badge>Meta Ads</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tags:</span>
                    <Badge variant="secondary">Meta Lead</Badge>
                    <Badge variant="secondary">Paid</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Campaign:</span>
                    <span className="text-sm font-medium">Summer Sale</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Attribution Rule</DialogTitle>
            <DialogDescription>
              Define how leads from this source should be attributed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input placeholder="e.g., Meta Ads Attribution" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select defaultValue="meta_ads">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Attribution Window</Label>
                <Select defaultValue="7_days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_day">1 Day</SelectItem>
                    <SelectItem value="7_days">7 Days</SelectItem>
                    <SelectItem value="28_days">28 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Apply Tags</Label>
              <Input placeholder="e.g., Meta Lead, Paid (comma separated)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowCreateDialog(false);
              toast.success('Rule created');
            }}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
