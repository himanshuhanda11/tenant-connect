import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Search, Sparkles, BookOpen, Clock, ShieldCheck, ArrowRight, Calendar, User,
  TrendingUp, Eye, Flame, Star, MessageSquare, Bot, Megaphone, Users, Zap,
  GraduationCap, Target, BarChart3, LifeBuoy, Send, Tag, Loader2, ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

const CATEGORY_META: Record<string, { icon: any; color: string }> = {
  'WhatsApp API': { icon: MessageSquare, color: 'from-emerald-500 to-teal-500' },
  'CRM Automation': { icon: Bot, color: 'from-violet-500 to-purple-500' },
  'Lead Generation': { icon: Target, color: 'from-amber-500 to-orange-500' },
  'AI Automation': { icon: Sparkles, color: 'from-fuchsia-500 to-pink-500' },
  'WhatsApp Marketing': { icon: Megaphone, color: 'from-green-500 to-emerald-500' },
  'Business Growth': { icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
  'Meta Ads': { icon: Zap, color: 'from-blue-500 to-indigo-500' },
  'Customer Support': { icon: LifeBuoy, color: 'from-rose-500 to-pink-500' },
  'Tutorials': { icon: GraduationCap, color: 'from-sky-500 to-cyan-500' },
  'Case Studies': { icon: BarChart3, color: 'from-teal-500 to-emerald-500' },
  'General': { icon: BookOpen, color: 'from-primary to-emerald-500' },
};

const SUGGESTED_CATEGORIES = Object.keys(CATEGORY_META).filter((c) => c !== 'General');

const DEFAULT_IMAGE = '/blog-bulk-whatsapp-safe-2026.jpg';

function getCategoryMeta(category?: string | null) {
  if (!category) return CATEGORY_META.General;
  return CATEGORY_META[category] || CATEGORY_META.General;
}

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, featured_image, status, author, category, read_time, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (data) setPosts(data as BlogPost[]);
      setLoading(false);
    })();
  }, []);

  const allCategoryNames = useMemo(() => {
    const fromPosts = Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]));
    return Array.from(new Set([...fromPosts, ...SUGGESTED_CATEGORIES]));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.excerpt || '').toLowerCase().includes(q) ||
        (post.category || '').toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const featured = filteredPosts[0];
  const trending = filteredPosts.slice(1, 4);
  const grid = filteredPosts.slice(1);
  const totalReadTime = posts.reduce((s, p) => s + (p.read_time || 5), 0);

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <SeoMeta
        route="/blog"
        fallbackTitle="AiReatro Blog — WhatsApp API, CRM, AI & Growth Insights"
        fallbackDescription="Premium playbooks, guides and case studies on WhatsApp Business API, CRM automation, AI workflows, lead generation, Meta Ads and customer engagement."
      />
      <Navbar />

      {/* Decorative orbs (page-wide) */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 overflow-hidden pointer-events-none h-[1400px]">
        <div className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute top-[10%] -right-24 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-[55%] left-1/3 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2.8s' }} />
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            maskImage: 'radial-gradient(ellipse at top, black 25%, transparent 70%)',
          }}
        />
      </div>

      {/* Hero */}
      <header className="relative pt-12 pb-8 md:pt-20 md:pb-14">
        <div className="container mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-6" />
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              WhatsApp Growth Library
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] animate-fade-in">
              Insights, Guides &{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                WhatsApp Growth
              </span>{' '}
              Strategies
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in">
              Learn how businesses scale faster using WhatsApp API, automation, CRM tools, AI
              workflows, and customer engagement strategies.
            </p>

            {/* Search */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="group relative">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/40 via-emerald-400/30 to-teal-500/40 opacity-60 group-focus-within:opacity-100 blur transition" />
                <div className="relative flex items-center rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
                  <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search articles, topics, guides…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 pr-28 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl"
                  />
                  <kbd className="hidden sm:inline-flex absolute right-4 items-center gap-1 px-2 py-1 rounded-md border border-border/60 bg-muted/60 text-[10px] font-mono text-muted-foreground">
                    ⌘ K
                  </kbd>
                </div>
              </div>

              {/* Trending pills */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" /> Trending:
                </span>
                {['WhatsApp API', 'AI Automation', 'Meta Ads', 'CRM'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSearchQuery(t)}
                    className="text-xs px-3 py-1 rounded-full border border-border/60 bg-card/60 backdrop-blur-md text-foreground hover:border-primary/50 hover:text-primary transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[
                { icon: Users, kpi: '2,000+', label: 'Businesses' },
                { icon: ShieldCheck, kpi: 'Official', label: 'WhatsApp API Experts' },
                { icon: BookOpen, kpi: `${posts.length || 0}+`, label: 'Growth Guides' },
              ].map((b, i) => (
                <div
                  key={b.label}
                  className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform mx-auto">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{b.kpi}</div>
                  <div className="text-[11px] text-muted-foreground">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky category bar */}
      <section className="sticky top-16 z-30 border-y border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <CategoryChip
              label="All"
              active={selectedCategory === 'All'}
              onClick={() => setSelectedCategory('All')}
              icon={Star}
              gradient="from-primary to-emerald-500"
            />
            {allCategoryNames.map((cat) => {
              const meta = getCategoryMeta(cat);
              return (
                <CategoryChip
                  key={cat}
                  label={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  icon={meta.icon}
                  gradient={meta.color}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-border/60 bg-card/60 overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-6 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      ) : (
        <>
          {/* Featured + trending */}
          {featured && (
            <section className="py-12 md:py-16">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-8">
                  {/* Featured card */}
                  <article
                    onClick={() => featured.slug && navigate(`/blog/${featured.slug}`)}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={featured.featured_image || DEFAULT_IMAGE}
                        alt={featured.title}
                        loading="eager"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                        {featured.category && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-foreground text-[11px] font-semibold border border-border/60">
                            {featured.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 -mt-2">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mt-3 text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        {featured.author && (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground text-xs font-bold flex items-center justify-center">
                              {featured.author[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">{featured.author}</span>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{format(new Date(featured.published_at || featured.created_at), 'MMM d, yyyy')}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featured.read_time || 5} min read</span>
                        <span className="ml-auto inline-flex items-center gap-1.5 text-primary font-semibold group-hover:gap-2.5 transition-all">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </article>

                  {/* Trending sidebar */}
                  <aside className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                        <Flame className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Trending Now</h3>
                    </div>
                    {trending.length > 0 ? (
                      trending.map((post, i) => {
                        const meta = getCategoryMeta(post.category);
                        return (
                          <article
                            key={post.id}
                            onClick={() => post.slug && navigate(`/blog/${post.slug}`)}
                            className="group cursor-pointer rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-4 hover:border-primary/40 hover:shadow-lg transition-all flex gap-3"
                          >
                            <div className="relative shrink-0">
                              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', meta.color)}>
                                <span className="text-xs font-bold">0{i + 1}</span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              {post.category && (
                                <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                                  {post.category}
                                </div>
                              )}
                              <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                {post.title}
                              </h4>
                              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {post.read_time || 5} min
                                <span className="opacity-40">•</span>
                                <Eye className="h-3 w-3" />
                                {((i + 2) * 1.2).toFixed(1)}k
                              </div>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground p-4 rounded-2xl border border-dashed border-border/60">
                        More trending articles coming soon.
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            </section>
          )}

          {/* Grid */}
          <section className="pb-16 md:pb-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                      {selectedCategory === 'All' ? 'Latest Articles' : selectedCategory}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'} ·{' '}
                      {totalReadTime} min total read
                    </p>
                  </div>
                </div>

                {grid.length === 0 && filteredPosts.length <= 1 ? (
                  <div className="text-center py-16 rounded-3xl border border-dashed border-border/60 bg-card/40">
                    <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No articles found</h3>
                    <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grid.map((post, i) => (
                      <ArticleCard key={post.id} post={post} delay={i * 60} onClick={() => post.slug && navigate(`/blog/${post.slug}`)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="pb-16 md:pb-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 backdrop-blur-md p-8 md:p-12 shadow-xl">
                <div aria-hidden className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div aria-hidden className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="relative grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 text-[11px] font-bold uppercase tracking-wider mb-4">
                      <Send className="h-3 w-3" /> Newsletter
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                      Weekly WhatsApp & AI growth tips
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Join 10,000+ founders and operators getting actionable playbooks every week.
                      No spam — unsubscribe anytime.
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => { e.preventDefault(); }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-12 bg-background/80 border-border/60 rounded-xl"
                    />
                    <Button type="submit" className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-emerald-500 shadow-lg shadow-primary/30 font-semibold">
                      Subscribe <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="pb-20 md:pb-28">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] border border-border/60 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#04201a] via-[#062b22] to-[#062c24]" />
                <div aria-hidden className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl animate-pulse" />
                <div aria-hidden className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-primary/40 blur-3xl animate-pulse" style={{ animationDelay: '1.6s' }} />
                <div aria-hidden className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                <div className="relative p-8 sm:p-12 md:p-16 text-center text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">Free Forever Platform</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                    Ready to grow your business on WhatsApp?
                  </h2>
                  <p className="mt-4 max-w-2xl mx-auto text-white/70 text-base md:text-lg">
                    Start using the official WhatsApp API with automation, CRM tools, team inbox,
                    and AI-powered workflows.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      size="lg"
                      onClick={() => navigate('/signup')}
                      className="h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-400 via-primary to-teal-500 text-[#03150f] font-bold shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] hover:scale-[1.02] transition-transform"
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" /> Start Free
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/contact')}
                      className="h-12 px-7 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      Contact Us
                    </Button>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> No credit card required</span>
                    <span className="opacity-30">•</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-emerald-400" /> Setup in &lt; 10 min</span>
                    <span className="opacity-30">•</span>
                    <span className="inline-flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> Official WhatsApp API</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function CategoryChip({
  label, active, onClick, icon: Icon, gradient,
}: { label: string; active: boolean; onClick: () => void; icon: any; gradient: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap',
        active
          ? 'text-primary-foreground shadow-lg shadow-primary/30'
          : 'text-foreground bg-card/60 border border-border/60 backdrop-blur-md hover:border-primary/40 hover:text-primary'
      )}
    >
      {active && <span className={cn('absolute inset-0 rounded-full bg-gradient-to-r', gradient)} />}
      <Icon className={cn('relative h-3.5 w-3.5', active ? 'text-primary-foreground' : 'text-primary')} />
      <span className="relative">{label}</span>
    </button>
  );
}

function ArticleCard({ post, delay, onClick }: { post: BlogPost; delay: number; onClick: () => void }) {
  const meta = getCategoryMeta(post.category);
  const Icon = meta.icon;
  return (
    <article
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-md shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 animate-fade-in flex flex-col"
    >
      {/* Animated border glow */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/30 via-transparent to-emerald-500/30 blur" />

      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={post.featured_image || DEFAULT_IMAGE}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md bg-gradient-to-r', meta.color)}>
            <Icon className="h-3 w-3" />
            {post.category || 'General'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-md px-2 py-1 text-[10.5px] font-semibold text-foreground border border-border/60">
            <Clock className="h-3 w-3" />
            {post.read_time || 5} min
          </span>
        </div>
      </div>

      <div className="relative flex flex-col flex-1 p-5 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0">
              {(post.author?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{post.author || 'AiReatro Team'}</div>
              <div className="text-[10.5px] text-muted-foreground">
                {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Read <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
