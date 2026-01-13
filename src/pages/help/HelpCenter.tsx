import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Megaphone
} from 'lucide-react';
import { GUIDE_CATEGORIES, STATIC_GUIDES, StaticGuide } from '@/data/guideContent';

const categoryIcons: Record<string, React.ReactNode> = {
  messaging: <MessageSquare className="h-6 w-6" />,
  marketing: <Send className="h-6 w-6" />,
  channels: <Phone className="h-6 w-6" />,
  'meta-ads': <Megaphone className="h-6 w-6" />,
  platform: <Settings className="h-6 w-6" />,
  compliance: <CheckCircle className="h-6 w-6" />,
};

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StaticGuide[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
    ['templates-guide', 'inbox-guide', 'meta-ads-guide', 'campaigns-guide'].includes(g.slug)
  ).slice(0, 4);

  const getGuideCountForCategory = (categorySlug: string) => {
    return STATIC_GUIDES.filter(g => g.category === categorySlug).length;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
              <Badge variant="outline" className="text-sm">Help Center</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find guides, tutorials, and answers to get the most out of SMEKSH
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides, articles, and tutorials..."
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

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
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

      {/* Featured Guides */}
      <section className="py-16 bg-muted/30">
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

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Getting Started</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        New to SMEKSH? Learn the basics in 5 minutes.
                      </p>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link to="/help/getting-started">Start Here →</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Contact Support</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Can't find what you're looking for? We're here to help.
                      </p>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link to="/contact">Get Support →</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
