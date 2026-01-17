import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, User, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';

// Blog post images - using gradient backgrounds with icons for visual appeal
const blogImages = {
  inbox: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&h=400&fit=crop',
  automation: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
  templates: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop',
  campaigns: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  contacts: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
  analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
  integrations: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
  team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  api: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop',
  security: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
  forms: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
  flows: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  metaAds: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
  billing: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
  phone: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
};

export default function Blog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const featuredPost = {
    title: 'How to Set Up a Unified Inbox for Multi-Agent WhatsApp Support',
    excerpt: 'Learn how to centralize all your WhatsApp conversations, assign agents, track SLAs, and never miss a customer message again. A complete guide to inbox management.',
    category: 'Inbox',
    date: 'Jan 15, 2025',
    readTime: '10 min read',
    author: 'Rahul Sharma',
    image: blogImages.inbox,
    slug: 'unified-inbox-setup-guide'
  };

  const posts = [
    {
      title: 'WhatsApp Automation 101: Build Your First Chatbot Without Code',
      excerpt: 'Step-by-step tutorial on creating automated responses, welcome flows, and lead qualification bots using our visual automation builder.',
      category: 'Automation',
      date: 'Jan 14, 2025',
      readTime: '12 min read',
      image: blogImages.automation,
      slug: 'whatsapp-automation-chatbot-guide'
    },
    {
      title: 'How to Create WhatsApp Message Templates That Get Approved Fast',
      excerpt: 'Avoid common rejection reasons and learn the exact format, language, and structure Meta looks for in template submissions.',
      category: 'Templates',
      date: 'Jan 12, 2025',
      readTime: '8 min read',
      image: blogImages.templates,
      slug: 'whatsapp-template-approval-tips'
    },
    {
      title: 'Running Your First WhatsApp Broadcast Campaign: A Complete Playbook',
      excerpt: 'From audience segmentation to scheduling, throttling, and tracking—everything you need to run high-converting campaigns.',
      category: 'Campaigns',
      date: 'Jan 10, 2025',
      readTime: '15 min read',
      image: blogImages.campaigns,
      slug: 'whatsapp-broadcast-campaign-guide'
    },
    {
      title: 'Contact Management & Segmentation: Turn Chaos into Conversion',
      excerpt: 'How to organize your contacts with tags, segments, and custom attributes to send the right message to the right person.',
      category: 'Contacts',
      date: 'Jan 8, 2025',
      readTime: '9 min read',
      image: blogImages.contacts,
      slug: 'contact-segmentation-strategy'
    },
    {
      title: 'WhatsApp Analytics Deep Dive: Metrics That Actually Matter',
      excerpt: 'Stop guessing. Learn which KPIs to track, how to read delivery reports, and how to measure true campaign ROI.',
      category: 'Analytics',
      date: 'Jan 6, 2025',
      readTime: '11 min read',
      image: blogImages.analytics,
      slug: 'whatsapp-analytics-kpi-guide'
    },
    {
      title: 'Connecting Your CRM to WhatsApp: Integration Best Practices',
      excerpt: 'Sync contacts, trigger messages from events, and keep your sales pipeline updated with real-time WhatsApp data.',
      category: 'Integrations',
      date: 'Jan 4, 2025',
      readTime: '10 min read',
      image: blogImages.integrations,
      slug: 'crm-whatsapp-integration-guide'
    },
    {
      title: 'Team Roles & Permissions: Secure Access Control for Growing Teams',
      excerpt: 'Set up role-based access, manage agent permissions, and maintain security as your team scales.',
      category: 'Team',
      date: 'Jan 2, 2025',
      readTime: '7 min read',
      image: blogImages.team,
      slug: 'team-roles-permissions-setup'
    },
    {
      title: "WhatsApp Business API vs Regular WhatsApp: What's the Difference?",
      excerpt: 'A clear comparison of features, limitations, pricing, and use cases to help you choose the right solution.',
      category: 'API',
      date: 'Dec 30, 2024',
      readTime: '8 min read',
      image: blogImages.api,
      slug: 'whatsapp-business-api-comparison'
    },
    {
      title: 'WhatsApp Data Security & Compliance: GDPR, Opt-in, and Privacy',
      excerpt: 'Ensure your messaging operations are compliant with global regulations and WhatsApp policies.',
      category: 'Security',
      date: 'Dec 28, 2024',
      readTime: '9 min read',
      image: blogImages.security,
      slug: 'whatsapp-gdpr-compliance-guide'
    },
    {
      title: 'WhatsApp Forms: Collect Data Natively Without External Links',
      excerpt: 'How to use in-chat forms for lead capture, surveys, and order collection—all within the WhatsApp conversation.',
      category: 'Forms',
      date: 'Dec 26, 2024',
      readTime: '8 min read',
      image: blogImages.forms,
      slug: 'whatsapp-forms-data-collection'
    },
    {
      title: 'Flow Builder Advanced Tips: Conditional Logic & Branching',
      excerpt: 'Master the visual flow builder with advanced techniques for personalized customer journeys.',
      category: 'Flows',
      date: 'Dec 24, 2024',
      readTime: '12 min read',
      image: blogImages.flows,
      slug: 'flow-builder-advanced-tips'
    },
    {
      title: 'Meta Ads + WhatsApp Attribution: Track Leads from Click to Conversion',
      excerpt: 'Connect your ad campaigns to WhatsApp conversations and finally see which ads drive real results.',
      category: 'Meta Ads',
      date: 'Dec 22, 2024',
      readTime: '10 min read',
      image: blogImages.metaAds,
      slug: 'meta-ads-whatsapp-attribution'
    },
    {
      title: 'Understanding WhatsApp Pricing: Conversation Categories Explained',
      excerpt: "Marketing, utility, service, authentication—know what you're paying for and how to optimize costs.",
      category: 'Billing',
      date: 'Dec 20, 2024',
      readTime: '6 min read',
      image: blogImages.billing,
      slug: 'whatsapp-pricing-categories-explained'
    },
    {
      title: 'Managing Multiple WhatsApp Numbers: Best Practices for Enterprises',
      excerpt: 'How to handle multiple phone numbers across departments, regions, or brands in one platform.',
      category: 'Phone Numbers',
      date: 'Dec 18, 2024',
      readTime: '7 min read',
      image: blogImages.phone,
      slug: 'multiple-whatsapp-numbers-management'
    }
  ];

  const categories = ['All', 'Inbox', 'Automation', 'Templates', 'Campaigns', 'Contacts', 'Analytics', 'Integrations', 'Team', 'API', 'Security', 'Forms', 'Flows', 'Meta Ads'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog | WhatsApp Business Tips & Guides | AiReatro"
        description="Learn how to master WhatsApp Business API with tutorials on automation, templates, campaigns, analytics, and more. Practical guides for every feature."
        canonical="https://aireatro.com/blog"
        keywords={["WhatsApp Business API blog", "WhatsApp automation tutorials", "WhatsApp marketing guides", "chatbot guides", "messaging best practices"]}
      />
      <Navbar />

      {/* Hero - White Background */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
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

            {/* Search Bar */}
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

      {/* Featured Post */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <Card 
            className="max-w-5xl mx-auto overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group"
            onClick={() => navigate(`/blog/${featuredPost.slug}`)}
          >
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-8 flex flex-col justify-center bg-white">
                <Badge className="w-fit mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  Featured • {featuredPost.category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">{featuredPost.excerpt}</p>
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
      <section className="py-8 bg-white sticky top-16 z-40 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-full ${selectedCategory === category ? '' : 'hover:bg-slate-100'}`}
                onClick={() => setSelectedCategory(category)}
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
            {filteredPosts.map((post, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {post.date}
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

      <Footer />
    </div>
  );
}