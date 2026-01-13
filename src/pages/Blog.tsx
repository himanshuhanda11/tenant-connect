import React from 'react';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Blog() {
  const navigate = useNavigate();

  const featuredPost = {
    title: 'The Complete Guide to WhatsApp Business API in 2025',
    excerpt: 'Everything you need to know about getting started with WhatsApp Business API, from setup to scaling your messaging operations.',
    category: 'Guide',
    date: 'Jan 10, 2025',
    readTime: '12 min read',
    author: 'Rahul Sharma'
  };

  const posts = [
    {
      title: '10 WhatsApp Marketing Strategies That Actually Work',
      excerpt: 'Discover proven strategies to boost engagement and conversions with WhatsApp marketing.',
      category: 'Marketing',
      date: 'Jan 8, 2025',
      readTime: '8 min read'
    },
    {
      title: 'How to Create Effective WhatsApp Message Templates',
      excerpt: 'Learn the art of crafting templates that get approved and drive results.',
      category: 'Templates',
      date: 'Jan 5, 2025',
      readTime: '6 min read'
    },
    {
      title: 'WhatsApp Automation: A Beginner\'s Guide',
      excerpt: 'Start automating your WhatsApp conversations with this step-by-step guide.',
      category: 'Automation',
      date: 'Jan 3, 2025',
      readTime: '10 min read'
    },
    {
      title: 'Understanding the WhatsApp 24-Hour Window',
      excerpt: 'Everything you need to know about WhatsApp\'s messaging policies and how to work within them.',
      category: 'Compliance',
      date: 'Dec 28, 2024',
      readTime: '5 min read'
    },
    {
      title: 'Case Study: How TechFlow Increased Sales by 40%',
      excerpt: 'Learn how TechFlow used smeksh to transform their customer communication.',
      category: 'Case Study',
      date: 'Dec 22, 2024',
      readTime: '7 min read'
    },
    {
      title: 'WhatsApp vs SMS: Which is Better for Business?',
      excerpt: 'A comprehensive comparison of WhatsApp and SMS for business communication.',
      category: 'Comparison',
      date: 'Dec 18, 2024',
      readTime: '9 min read'
    }
  ];

  const categories = ['All', 'Guide', 'Marketing', 'Templates', 'Automation', 'Case Study'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-orange-900/30 to-slate-900" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The smeksh{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-xl text-white/70">
              Insights, tips, and best practices for WhatsApp Business messaging
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto overflow-hidden border-border/50 hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <div className="text-6xl">📱</div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {posts.map((post, index) => (
              <Card key={index} className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <div className="text-4xl">📝</div>
                </div>
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
                    {post.category}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Load More Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get the latest WhatsApp marketing tips and platform updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-lg border-0 bg-white/10 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30"
            />
            <Button size="lg" className="h-12 bg-white text-orange-600 hover:bg-white/90">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
