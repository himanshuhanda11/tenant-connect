import { useState, useEffect } from 'react';
import { SEO } from '@/components/seo';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MessageSquare, 
  Send, 
  Phone, 
  Settings, 
  CheckCircle,
  ArrowRight,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Megaphone,
  LayoutDashboard,
  Inbox,
  Users,
  Tag,
  FileText,
  Zap,
  CreditCard,
  Shield,
  ListFilter,
  Clock,
  Route,
  ScrollText,
  Target,
  BarChart3,
  Link2,
  Workflow,
  Cog,
  ExternalLink,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { GUIDE_CATEGORIES, STATIC_GUIDES, StaticGuide, getStaticGuideBySidebarKey } from '@/data/guideContent';
import { sidebarDescriptions, SidebarItemMeta, getAllSidebarItems } from '@/data/sidebarDescriptions';

// Icon mapping for sidebar items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  contacts: Users,
  tags: Tag,
  'user-attributes': ListFilter,
  'phone-numbers': Phone,
  templates: FileText,
  campaigns: Send,
  automation: Zap,
  'meta-ads-overview': Megaphone,
  'meta-ads-setup': Link2,
  'meta-ads-manager': Target,
  'meta-ads-analytics': BarChart3,
  'meta-ads-attribution': Route,
  'meta-ads-automations': Workflow,
  'meta-ads-settings': Cog,
  'team-overview': Users,
  'team-members': Users,
  'team-roles': Shield,
  'team-groups': Users,
  'team-routing': Route,
  'team-sla': Clock,
  'team-audit': ScrollText,
  team: Users,
  billing: CreditCard,
  settings: Settings,
  help: HelpCircle,
};

const categoryIcons: Record<string, React.ReactNode> = {
  messaging: <MessageSquare className="h-6 w-6" />,
  marketing: <Send className="h-6 w-6" />,
  channels: <Phone className="h-6 w-6" />,
  'meta-ads': <Megaphone className="h-6 w-6" />,
  platform: <Settings className="h-6 w-6" />,
  compliance: <CheckCircle className="h-6 w-6" />,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  core: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  channels: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  growth: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  'meta-ads': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  team: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
  platform: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' },
};

interface FeatureCardProps {
  item: SidebarItemMeta;
  guide?: StaticGuide;
}

function FeatureCard({ item, guide }: FeatureCardProps) {
  const Icon = iconMap[item.key] || HelpCircle;
  const colors = categoryColors[item.category] || categoryColors.platform;
  
  return (
      <SEO title="Help Center - AiReatro" description="Browse guides, tutorials, and documentation for AiReatro WhatsApp API platform. Find answers to common questions and get started quickly." keywords={["help center", "documentation", "WhatsApp API help", "tutorials"]} canonical="/help" />
    <Card className="group h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant="outline" className={`text-xs capitalize ${colors.text} ${colors.border}`}>
            {item.category === 'meta-ads' ? 'Meta Ads' : item.category}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors mt-3">
          {item.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {guide ? (
            <Link 
              to={`/help/${guide.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Read guide
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : item.helpSlug ? (
            <Link 
              to={`/help/${item.helpSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Learn more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Coming soon</span>
          )}
          {guide && (
            <span className="text-xs text-muted-foreground">{guide.readingTime} min read</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StaticGuide[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const allSidebarItems = getAllSidebarItems();

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = STATIC_GUIDES.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const featuredGuides = STATIC_GUIDES.filter(g => 
    ['templates-guide', 'auto-form-rules-guide', 'template-management-advanced', 'inbox-guide', 'meta-ads-guide', 'campaigns-guide'].includes(g.slug)
  ).slice(0, 6);

  const getGuideCountForCategory = (categorySlug: string) => {
    return STATIC_GUIDES.filter(g => g.category === categorySlug).length;
  };

  // Get items filtered by category
  const getItemsByCategory = (category: string) => {
    if (category === 'all') return allSidebarItems;
    return allSidebarItems.filter(item => item.category === category);
  };

  // Category tabs configuration
  const categoryTabs = [
    { id: 'all', label: 'All Features', icon: LayoutDashboard },
    { id: 'core', label: 'Core', icon: Inbox },
    { id: 'channels', label: 'Channels', icon: Phone },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'meta-ads', label: 'Meta Ads', icon: Megaphone },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'platform', label: 'Platform', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6" />
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find guides, tutorials, and quick answers for every feature in AIREATRO. 
              Learn how to get the most out of your WhatsApp Business platform.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides, features, and tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
              />
              
              {/* Search Results Dropdown */}
              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg z-50 max-h-[400px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map(guide => (
                        <Link
                          key={guide.slug}
                          to={`/help/${guide.slug}`}
                          className="block p-3 hover:bg-muted rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">{guide.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {guide.summary}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No guides found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Cards */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Getting Started</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      New to AIREATRO? Learn the basics and set up your workspace.
                    </p>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link to="/help/getting-started">Start Here →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/10 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">Auto-Form Rules</h3>
                      <Badge className="bg-violet-500 text-white text-xs">NEW</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically send WhatsApp forms based on intent.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-violet-600" asChild>
                      <Link to="/help/auto-form-rules-guide">Learn More →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/10 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">AI Template Validation</h3>
                      <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get AI-powered suggestions for Meta approval.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-green-600" asChild>
                      <Link to="/help/template-management-advanced">View Guide →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Features Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Explore All Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive guides for every feature in AIREATRO. Select a category or browse all features below.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="flex-wrap h-auto gap-1 p-1 bg-muted/50">
                {categoryTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {categoryTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getItemsByCategory(tab.id).map(item => {
                    const guide = getStaticGuideBySidebarKey(item.key);
                    return (
                      <FeatureCard 
                        key={item.key} 
                        item={item} 
                        guide={guide}
                      />
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {GUIDE_CATEGORIES.map(category => (
              <Link 
                key={category.slug} 
                to={`/help/category/${category.slug}`}
                className="group"
              >
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all group-hover:scale-[1.02]">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {categoryIcons[category.slug] || <BookOpen className="h-6 w-6" />}
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {getGuideCountForCategory(category.slug)} guides
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Popular Guides</h2>
              <p className="text-muted-foreground">Start with these essential guides</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/help/all">View All Guides</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGuides.map(guide => (
              <Link key={guide.slug} to={`/help/${guide.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all group">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">{guide.category}</Badge>
                      <Badge variant="secondary" className="capitalize">{guide.difficulty}</Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {guide.title}
                    </CardTitle>
                    <CardDescription>{guide.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{guide.readingTime} min read</span>
                      <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                        Read guide <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
