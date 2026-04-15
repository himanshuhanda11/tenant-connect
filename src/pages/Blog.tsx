import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, User, Search, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  featured_image: string | null;
  status: string;
  author: string | null;
  category: string | null;
  read_time: number | null;
  published_at: string | null;
  created_at: string;
}

export default function Blog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, featured_image, status, author, category, read_time, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  const defaultImage = 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&h=400&fit=crop';

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/blog" fallbackTitle="AiReatro Blog — WhatsApp Marketing Tips & API Guides" fallbackDescription="Expert tips on WhatsApp Business API, marketing automation, chatbot strategies, and customer engagement. Stay ahead with actionable guides from AiReatro." />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6" />
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Latest Insights & Tutorials
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">The AiReatro</span>{' '}
              <span className="text-primary">Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Practical guides, tutorials, and best practices for every WhatsApp Business feature
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="h-14 pl-12 pr-4 text-lg bg-white border-2 border-slate-200 shadow-lg rounded-xl focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <section className="py-12 bg-slate-50">
              <div className="container mx-auto px-4">
                <Card
                  className="max-w-5xl mx-auto overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                >
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={featuredPost.featured_image || defaultImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-8 flex flex-col justify-center bg-white">
                      <Badge className="w-fit mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                        Featured • {featuredPost.category || 'General'}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 text-lg line-clamp-3">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {featuredPost.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {featuredPost.author}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(featuredPost.published_at || featuredPost.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.read_time || 5} min read
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* Categories */}
          <section className="py-8 bg-white sticky top-16 z-40 border-b border-slate-100">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-full ${selectedCategory === category ? '' : 'hover:bg-slate-100'}`}
                    onClick={() => setSelectedCategory(category as string)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Posts Grid */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {gridPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image || defaultImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                          {post.category || 'General'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{post.read_time || 5} min read</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                          Read More <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
                </div>
              )}
            </div>
          </section>

          {/* Newsletter */}
          <section className="py-20 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="container mx-auto px-4 relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Weekly WhatsApp Tips
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join 10,000+ marketers getting actionable insights every week.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 px-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                />
                <Button size="lg" className="h-12 bg-white text-primary hover:bg-white/90 font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
