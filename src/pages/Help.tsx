import React, { useState } from 'react';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Video, 
  FileText,
  ArrowRight,
  ChevronRight,
  Inbox,
  Megaphone,
  Bot,
  Users,
  Settings,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: Inbox,
      title: 'Getting Started',
      description: 'Learn the basics of setting up your account',
      articles: 12,
      color: 'bg-blue-500'
    },
    {
      icon: MessageCircle,
      title: 'Inbox & Messaging',
      description: 'Managing conversations and sending messages',
      articles: 18,
      color: 'bg-green-500'
    },
    {
      icon: Megaphone,
      title: 'Campaigns',
      description: 'Creating and managing broadcast campaigns',
      articles: 15,
      color: 'bg-orange-500'
    },
    {
      icon: Bot,
      title: 'Automation',
      description: 'Building automated workflows and chatbots',
      articles: 10,
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Adding team members and managing roles',
      articles: 8,
      color: 'bg-pink-500'
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Configuring your account and preferences',
      articles: 14,
      color: 'bg-slate-500'
    },
    {
      icon: CreditCard,
      title: 'Billing & Plans',
      description: 'Subscription, payments, and invoices',
      articles: 9,
      color: 'bg-emerald-500'
    },
    {
      icon: FileText,
      title: 'API & Integrations',
      description: 'Developer documentation and webhooks',
      articles: 20,
      color: 'bg-indigo-500'
    }
  ];

  const popularArticles = [
    { title: 'How to connect your WhatsApp Business Account', category: 'Getting Started' },
    { title: 'Creating your first message template', category: 'Templates' },
    { title: 'Understanding the 24-hour messaging window', category: 'Messaging' },
    { title: 'Setting up automated responses', category: 'Automation' },
    { title: 'Inviting team members to your workspace', category: 'Team' },
    { title: 'Troubleshooting message delivery issues', category: 'Messaging' },
  ];

  const resources = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Comprehensive guides and tutorials',
      link: '/api-docs'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video walkthroughs',
      link: '/webinars'
    },
    {
      icon: MessageCircle,
      title: 'Community',
      description: 'Join our community forum',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero - Classic Design */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Book className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">How Can We</span>{' '}
              <span className="text-primary">Help You?</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10">
              Search our knowledge base or browse categories below
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for articles..."
                className="h-14 pl-12 pr-4 text-lg bg-card border shadow-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all cursor-pointer border-border/50">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category.articles} articles</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
            {popularArticles.map((article, index) => (
              <Card key={index} className="group hover:shadow-md transition-all cursor-pointer border-border/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{article.category}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            {resources.map((resource, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all cursor-pointer border-border/50 text-center" onClick={() => navigate(resource.link)}>
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <resource.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Our support team is available 24/7 to assist you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-white/90" onClick={() => navigate('/contact')}>
              Contact Support
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10">
              Join Community
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
