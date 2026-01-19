import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, FileText, ArrowRight, Copy, CheckCircle2, Tag, MessageSquare, 
  Megaphone, Bell, ShoppingBag, Calendar, Headphones, Star, Sparkles,
  CreditCard, Truck, Gift, UserPlus, RefreshCw, Shield, Clock, Heart,
  AlertCircle, Package, MapPin, Ticket, Users, Zap, TrendingDown, Key,
  Navigation, ChefHat, Utensils, Briefcase, Award, Stethoscope, Pill,
  ShoppingCart, XCircle, Crown, AlertTriangle, Wallet, ArrowLeftRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';
import { PRE_APPROVED_TEMPLATES, TEMPLATE_CATEGORIES, PreApprovedTemplate } from '@/data/preApprovedTemplates';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, any> = {
  Package, Truck, CheckCircle2, ShoppingCart, RefreshCw, Clock, Bell, Star,
  ArrowLeftRight, Wallet, Zap, UserPlus, Gift, Users, Sparkles, Heart, Crown,
  Calendar, XCircle, AlertCircle, CheckCircle: CheckCircle2, CreditCard,
  AlertTriangle, Ticket, TrendingDown, FileText, Navigation, ChefHat,
  Utensils, Briefcase, Award, Stethoscope, Pill, Shield, Key, MapPin
};

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMetaCategory, setSelectedMetaCategory] = useState<'ALL' | 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('ALL');

  const filteredTemplates = PRE_APPROVED_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesMetaCategory = selectedMetaCategory === 'ALL' || template.metaCategory === selectedMetaCategory;
    return matchesSearch && matchesCategory && matchesMetaCategory;
  });

  const trendingTemplates = PRE_APPROVED_TEMPLATES.filter(t => t.isTrending);
  const newTemplates = PRE_APPROVED_TEMPLATES.filter(t => t.isNew);

  const copyTemplate = (template: PreApprovedTemplate) => {
    navigator.clipboard.writeText(template.body);
    toast.success(`Template "${template.name}" copied to clipboard!`);
  };

  const useTemplate = (template: PreApprovedTemplate) => {
    if (user) {
      // Navigate to templates page with template data pre-filled
      navigate('/templates', {
        state: {
          useLibraryTemplate: {
            name: template.name.toLowerCase().replace(/\s+/g, '_'),
            category: template.metaCategory,
            body: template.body,
            variables: template.variables,
          }
        }
      });
      toast.success(`Opening template builder with "${template.name}"`);
    } else {
      // Redirect to signup for non-authenticated users
      navigate('/signup');
    }
  };

  const getIcon = (iconName: string) => {
    return ICON_MAP[iconName] || FileText;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'All': FileText,
      'E-commerce': ShoppingBag,
      'Marketing': Megaphone,
      'Notifications': Bell,
      'Appointments': Calendar,
      'Support': Headphones,
      'Payments': CreditCard,
      'Authentication': Shield,
      'Logistics': Truck,
      'Food & Delivery': Utensils,
      'HR & Recruitment': Briefcase,
      'Healthcare': Stethoscope
    };
    return iconMap[category] || FileText;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="50+ Pre-Approved WhatsApp Templates | Business Message Library | AiReatro"
        description="Browse 50+ pre-approved WhatsApp message templates for marketing, e-commerce, appointments, support, authentication and more. Copy & use instantly."
        canonical="https://aireatro.com/template-library"
        keywords={["WhatsApp templates", "message templates", "pre-approved templates", "WhatsApp Business templates", "marketing templates", "utility templates"]}
      />
      <Navbar />

      {/* Hero - White Background */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-100/50 to-emerald-100/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              50+ Pre-Approved & Ready to Use
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">WhatsApp Message</span>{' '}
              <span className="text-primary">Template Library</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              50+ professionally crafted templates across 12 categories. Meta-approved, copy-ready, and built for high engagement.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, category, or tag..."
                className="h-14 pl-12 pr-4 text-lg bg-white border-2 border-slate-200 shadow-lg rounded-xl focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">50+</div>
                <div className="text-sm text-slate-600">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-slate-600">Pre-Approved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">12</div>
                <div className="text-sm text-slate-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">3</div>
                <div className="text-sm text-slate-600">Meta Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meta Category Filter */}
      <section className="py-4 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Meta Category:</span>
            <Tabs value={selectedMetaCategory} onValueChange={(v) => setSelectedMetaCategory(v as any)}>
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="UTILITY" className="gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Utility
                </TabsTrigger>
                <TabsTrigger value="MARKETING" className="gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Marketing
                </TabsTrigger>
                <TabsTrigger value="AUTHENTICATION" className="gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Authentication
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Categories - Sticky */}
      <section className="py-6 bg-white sticky top-16 z-40 border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {TEMPLATE_CATEGORIES.map((category, index) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <Button
                  key={index}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-full gap-1.5 ${selectedCategory === category.name ? 'shadow-lg' : ''}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {category.name}
                  <Badge 
                    variant={selectedCategory === category.name ? 'secondary' : 'outline'} 
                    className="ml-1 text-xs px-1.5"
                  >
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending & New Templates */}
      {(trendingTemplates.length > 0 || newTemplates.length > 0) && selectedCategory === 'All' && selectedMetaCategory === 'ALL' && !searchQuery && (
        <section className="py-8 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Trending */}
              {trendingTemplates.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg">Trending Templates</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {trendingTemplates.slice(0, 3).map((template) => {
                      const IconComponent = getIcon(template.icon);
                      return (
                        <Card key={template.id} className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.downloads.toLocaleString()} uses</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => copyTemplate(template)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New */}
              {newTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">New Templates</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {newTemplates.slice(0, 3).map((template) => {
                      const IconComponent = getIcon(template.icon);
                      return (
                        <Card key={template.id} className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.category}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Templates Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
            <div>
              <h2 className="text-xl font-semibold">
                {selectedCategory === 'All' ? 'All Templates' : selectedCategory}
              </h2>
              <p className="text-sm text-muted-foreground">{filteredTemplates.length} templates found</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredTemplates.map((template) => {
              const IconComponent = getIcon(template.icon);
              return (
                <Card key={template.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group bg-white overflow-hidden">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {template.name}
                            </h3>
                            {template.isNew && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">New</Badge>
                            )}
                            {template.isTrending && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-600">
                                <Zap className="w-2.5 h-2.5 mr-0.5" />
                                Hot
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] ${
                                template.metaCategory === 'UTILITY' ? 'border-green-300 text-green-700 bg-green-50' :
                                template.metaCategory === 'MARKETING' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                'border-purple-300 text-purple-700 bg-purple-50'
                              }`}
                            >
                              {template.metaCategory}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Approved
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                    
                    {/* Template Preview */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4 max-h-36 overflow-y-auto border border-slate-100">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {template.body}
                      </pre>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-primary/5 text-primary text-xs rounded-full border border-primary/10">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Variables & Downloads */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {template.variables.length} variables
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {template.downloads.toLocaleString()} uses
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2 h-10"
                        onClick={() => copyTemplate(template)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2 h-10 bg-primary hover:bg-primary/90" 
                        onClick={() => useTemplate(template)}
                      >
                        Use Template
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or category filter.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedMetaCategory('ALL'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Template Best Practices</h2>
              <p className="text-muted-foreground">Follow these tips to maximize your template approval rate and engagement</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Keep It Concise</h3>
                  <p className="text-muted-foreground text-sm">
                    Under 1024 characters ensures full display on all devices.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Personalize</h3>
                  <p className="text-muted-foreground text-sm">
                    Use {"{{1}}"} variables for names to increase engagement.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Clear CTAs</h3>
                  <p className="text-muted-foreground text-sm">
                    Every template should have a clear call-to-action.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Stay Compliant</h3>
                  <p className="text-muted-foreground text-sm">
                    Follow WhatsApp's policies for faster approval.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Templates by Category</h2>
              <p className="text-muted-foreground">Find the perfect template for your use case</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {TEMPLATE_CATEGORIES.filter(c => c.name !== 'All').map((category) => {
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <Card 
                    key={category.name} 
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">{category.count} templates</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Messaging?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Create your account and start using these 50+ templates in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 shadow-lg" 
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 border-white/30 text-white hover:bg-white/10" 
              onClick={() => navigate('/contact')}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
