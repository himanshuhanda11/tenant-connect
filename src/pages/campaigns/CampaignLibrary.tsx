import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Bookmark, 
  Calendar,
  Copy,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Zap
} from 'lucide-react';
import { CampaignTemplate } from '@/types/campaign';

const MOCK_TEMPLATES: CampaignTemplate[] = [
  {
    id: '1',
    tenant_id: '1',
    name: 'Festival Offer Campaign',
    description: 'Perfect for holiday promotions and seasonal sales',
    category: 'festival',
    industry: 'ecommerce',
    campaign_type: 'broadcast',
    goal: 'promotion',
    use_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    tenant_id: '1',
    name: 'Invoice Reminder',
    description: 'Gentle payment reminder for pending invoices',
    category: 'reminder',
    industry: 'general',
    campaign_type: 'broadcast',
    goal: 'reminder',
    use_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    tenant_id: '1',
    name: 'Course Enrollment Follow-up',
    description: 'Re-engage leads who showed interest in courses',
    category: 'education',
    industry: 'education',
    campaign_type: 'ctwa_followup',
    goal: 'followup',
    use_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    tenant_id: '1',
    name: 'New Product Launch',
    description: 'Announce new products to your customer base',
    category: 'announcement',
    industry: 'ecommerce',
    campaign_type: 'broadcast',
    goal: 'announcement',
    use_count: 234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    tenant_id: '1',
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with timely reminders',
    category: 'retarget',
    industry: 'ecommerce',
    campaign_type: 'retarget',
    goal: 'followup',
    use_count: 178,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    tenant_id: '1',
    name: 'Customer Feedback Request',
    description: 'Collect reviews and feedback from recent customers',
    category: 'engagement',
    industry: 'general',
    campaign_type: 'broadcast',
    goal: 'engagement',
    use_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  festival: <Gift className="h-5 w-5 text-purple-600" />,
  reminder: <Calendar className="h-5 w-5 text-blue-600" />,
  education: <GraduationCap className="h-5 w-5 text-green-600" />,
  announcement: <Megaphone className="h-5 w-5 text-amber-600" />,
  retarget: <TrendingUp className="h-5 w-5 text-red-600" />,
  engagement: <Heart className="h-5 w-5 text-pink-600" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  festival: 'bg-purple-100',
  reminder: 'bg-blue-100',
  education: 'bg-green-100',
  announcement: 'bg-amber-100',
  retarget: 'bg-red-100',
  engagement: 'bg-pink-100',
};

export default function CampaignLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesIndustry = industryFilter === 'all' || template.industry === industryFilter;
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const handleUseTemplate = (templateId: string) => {
    navigate(`/campaigns/create?template=${templateId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-primary" />
                Campaign Library
              </h1>
              <p className="text-muted-foreground">
                Ready-to-use campaign templates for quick deployment
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Save Current as Template
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="retarget">Retargeting</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id} 
              className="group hover:border-primary/50 transition-colors cursor-pointer"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${CATEGORY_COLORS[template.category || 'general']} flex items-center justify-center`}>
                    {CATEGORY_ICONS[template.category || 'general'] || <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{template.use_count}</span>
                  </div>
                </div>
                <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="capitalize">{template.category}</Badge>
                  <Badge variant="secondary" className="capitalize">{template.industry}</Badge>
                  <Badge variant="outline" className="capitalize">{template.goal}</Badge>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  variant="outline"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or create a new template
              </p>
            </CardContent>
          </Card>
        )}

        {/* Create Your Own */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create Your Own Template</h3>
                  <p className="text-muted-foreground">Save successful campaigns as reusable templates</p>
                </div>
              </div>
              <Button onClick={() => navigate('/campaigns/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}