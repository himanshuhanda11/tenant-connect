import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Twitter, Linkedin, Facebook,
  Loader2, CheckCircle2, Zap, Shield, MessageSquare, Users, BarChart3, Globe,
  Smartphone, Bot, Bell, Target, TrendingUp, BookOpen, Lightbulb, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import SEO from '@/components/seo/SEO';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { getBlogPost, getRelatedPosts } from '@/data/blogPosts';

interface BlogBlock {
  id: string;
  type: string;
  content: string;
  level?: number;
  items?: string[];
  ordered?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  buttonText?: string;
  buttonUrl?: string;
  language?: string;
}

interface DBBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: BlogBlock[];
  featured_image: string | null;
  image_alt: string | null;
  status: string;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  read_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  schema_jsonld: any;
  published_at: string | null;
  created_at: string;
}

/* ── Icon mapping for headings ── */
const HEADING_ICONS: Record<string, React.ReactNode> = {
  'what is': <MessageSquare className="w-6 h-6" />,
  'why': <Lightbulb className="w-6 h-6" />,
  'how': <Zap className="w-6 h-6" />,
  'pricing': <BarChart3 className="w-6 h-6" />,
  'automation': <Bot className="w-6 h-6" />,
  'crm': <Users className="w-6 h-6" />,
  'use case': <Target className="w-6 h-6" />,
  'rules': <Shield className="w-6 h-6" />,
  'vs': <Globe className="w-6 h-6" />,
  'best practice': <Star className="w-6 h-6" />,
  'future': <TrendingUp className="w-6 h-6" />,
  'conclusion': <BookOpen className="w-6 h-6" />,
  'setup': <Smartphone className="w-6 h-6" />,
  'example': <Lightbulb className="w-6 h-6" />,
  'benefit': <CheckCircle2 className="w-6 h-6" />,
  'feature': <Zap className="w-6 h-6" />,
  'tip': <Bell className="w-6 h-6" />,
  'industry': <Globe className="w-6 h-6" />,
  'common mistake': <Shield className="w-6 h-6" />,
  'faq': <MessageSquare className="w-6 h-6" />,
};

function getHeadingIcon(text: string) {
  const lower = text.toLowerCase();
  for (const [key, icon] of Object.entries(HEADING_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <ArrowRight className="w-6 h-6" />;
}

/** Render markdown-like text: **bold**, *italic*, [text](url) */
function renderRichText(text: string) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-primary font-medium underline underline-offset-2 hover:text-primary/80 transition-colors">$1</a>'
    )
    .replace(/\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Detect if content looks like a markdown table */
function isTable(content: string) {
  const lines = content.trim().split('\n');
  return lines.length >= 3 && lines[1]?.includes('---');
}

function renderTable(content: string) {
  const lines = content.trim().split('\n').filter(l => !l.match(/^\|[\s-|]+\|$/));
  const rows = lines.map(line =>
    line.split('|').map(c => c.trim()).filter(Boolean)
  );
  if (rows.length < 2) return null;
  const [header, ...body] = rows;
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-primary/10 to-primary/5">
            {header.map((cell, i) => (
              <th key={i} className="px-5 py-3.5 text-left font-semibold text-slate-900 border-b border-slate-200">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-5 py-3 text-slate-700 border-b border-slate-100">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockRenderer({ block, index }: { block: BlogBlock; index: number }) {
  switch (block.type) {
    case 'heading':
      if (block.level === 1) return <h1 className="text-3xl font-bold text-slate-900 mt-10 mb-4">{block.content}</h1>;
      if (block.level === 3) return (
        <div className="flex items-center gap-2.5 mt-8 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {getHeadingIcon(block.content)}
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{block.content}</h3>
        </div>
      );
      return (
        <div className="flex items-center gap-3 mt-14 mb-5 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
            {getHeadingIcon(block.content)}
          </div>
          <h2 className="text-2xl md:text-[1.65rem] font-bold text-slate-900 leading-tight">{block.content}</h2>
        </div>
      );

    case 'paragraph':
      if (isTable(block.content)) return renderTable(block.content);
      return <p className="text-slate-600 leading-[1.85] mb-6 text-[17px]">{renderRichText(block.content)}</p>;

    case 'image':
      return block.imageUrl ? (
        <figure className="my-8">
          <img src={block.imageUrl} alt={block.imageAlt || ''} className="w-full rounded-xl shadow-md" loading="lazy" />
          {block.caption && <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">{block.caption}</figcaption>}
        </figure>
      ) : null;

    case 'quote':
      return (
        <blockquote className="relative border-l-4 border-primary pl-6 py-4 my-8 bg-gradient-to-r from-primary/5 to-transparent rounded-r-xl">
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">"</div>
          <p className="italic text-slate-700 text-lg leading-relaxed">{renderRichText(block.content)}</p>
        </blockquote>
      );

    case 'code':
      return (
        <div className="my-6 rounded-xl overflow-hidden shadow-md">
          {block.language && <div className="bg-slate-800 text-slate-400 text-xs px-4 py-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span>{block.language}</div>}
          <pre className="bg-slate-900 text-slate-100 p-5 overflow-x-auto text-sm font-mono leading-relaxed"><code>{block.content}</code></pre>
        </div>
      );

    case 'list':
      if (block.ordered) {
        return (
          <div className="my-6 space-y-3">
            {(block.items || []).map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <div className="pt-1.5 text-slate-600 text-[17px] leading-relaxed flex-1">{renderRichText(item)}</div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="my-6 space-y-3">
          {(block.items || []).map((item, i) => (
            <div key={i} className="flex gap-3 items-start group">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="text-slate-600 text-[17px] leading-relaxed flex-1">{renderRichText(item)}</div>
            </div>
          ))}
        </div>
      );

    case 'link':
      return block.buttonUrl ? (
        <div className="my-4">
          <a href={block.buttonUrl} className="text-primary underline underline-offset-2 font-medium inline-flex items-center gap-1.5 hover:text-primary/80 text-[17px] transition-colors" target="_blank" rel="noopener noreferrer">
            {block.buttonText || block.buttonUrl}
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : null;

    case 'divider':
      return (
        <div className="my-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200"></div>
          <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          <div className="w-2 h-2 rounded-full bg-primary/50"></div>
          <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200"></div>
        </div>
      );

    case 'cta':
      return (
        <div className="my-12 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-50 to-primary/5 border border-primary/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb,34,197,94),0.08),transparent_50%)]"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{block.buttonText || 'Get Started with Aireatro'}</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Zero monthly fees. Start in under 10 minutes. Scale with confidence.</p>
            <Link to={block.buttonUrl || '/signup'} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl transition-all">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/* ── Table of Contents ── */
function TableOfContents({ blocks }: { blocks: BlogBlock[] }) {
  const headings = blocks.filter(b => b.type === 'heading' && b.level === 2);
  if (headings.length < 3) return null;
  return (
    <div className="my-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-slate-900 text-lg">In This Article</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {headings.map((h, i) => (
          <div key={h.id} className="flex items-center gap-2.5 py-1.5 text-sm text-slate-600 hover:text-primary transition-colors cursor-default">
            <span className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">{i + 1}</span>
            <span className="line-clamp-1">{h.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reading Progress Bar ── */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-100"><div className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-150" style={{ width: `${progress}%` }}></div></div>;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dbPost, setDbPost] = useState<DBBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDb, setRelatedDb] = useState<any[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug || '')
        .eq('status', 'published')
        .maybeSingle();

      if (!error && data) {
        const content = Array.isArray(data.content) ? data.content : [];
        setDbPost({ ...data, content } as any);

        const { data: related } = await supabase
          .from('blogs')
          .select('id, title, slug, featured_image, category')
          .eq('status', 'published')
          .neq('slug', slug || '')
          .limit(3);
        if (related) setRelatedDb(related);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const staticPost = getBlogPost(slug || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (dbPost) {
    const shareUrl = `https://aireatro.com/blog/${dbPost.slug}`;
    return (
      <div className="min-h-screen bg-white">
        <ReadingProgress />
        <SeoMeta route={`/blog/${dbPost.slug}`} fallbackTitle={dbPost.seo_title || dbPost.title} fallbackDescription={dbPost.seo_description || dbPost.excerpt || ''} />
        <SEO
          title={dbPost.seo_title || dbPost.title}
          description={dbPost.seo_description || dbPost.excerpt || ''}
          keywords={dbPost.seo_keywords ? dbPost.seo_keywords.split(',').map(k => k.trim()) : []}
          canonical={`/blog/${dbPost.slug}`}
          ogType="article"
          ogImage={dbPost.og_image || dbPost.featured_image || undefined}
        />
        {dbPost.schema_jsonld && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dbPost.schema_jsonld) }} />
        )}
        <Navbar />

        {/* Hero */}
        <section className="relative pt-8 pb-12 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/blog" className="hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Blog</Link>
                <span className="text-slate-300">/</span>
                <span>{dbPost.category}</span>
              </div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0 px-3 py-1">{dbPost.category}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 mb-6 leading-[1.2] tracking-tight">{dbPost.title}</h1>
              {dbPost.excerpt && <p className="text-lg text-slate-500 mb-6 leading-relaxed max-w-2xl">{dbPost.excerpt}</p>}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                {dbPost.author && (
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <div><span className="font-medium text-slate-700">{dbPost.author}</span></div>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Calendar className="w-3.5 h-3.5" />{format(new Date(dbPost.published_at || dbPost.created_at), 'MMM d, yyyy')}</div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Clock className="w-3.5 h-3.5" />{dbPost.read_time || 5} min read</div>
              </div>
              {dbPost.featured_image && (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 mb-10 ring-1 ring-slate-200/50">
                  <img src={dbPost.featured_image} alt={dbPost.image_alt || dbPost.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-4 md:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <TableOfContents blocks={dbPost.content} />
              <article>
                {dbPost.content.map((block, idx) => (
                  <BlockRenderer key={block.id} block={block} index={idx} />
                ))}
              </article>

              {/* Tags */}
              {dbPost.tags && dbPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-100">
                  {dbPost.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">#{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="bg-slate-50 rounded-2xl p-6 mt-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-700">Share this article</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(dbPost.title)}`, '_blank')}><Twitter className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="rounded-xl hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}><Linkedin className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="rounded-xl hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}><Facebook className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Card className="mt-12 border-0 bg-gradient-to-br from-primary/10 via-emerald-50 to-primary/5 shadow-lg shadow-primary/5">
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to transform your WhatsApp messaging?</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">Start your free trial today and see the difference Aireatro makes.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" className="rounded-xl shadow-md shadow-primary/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-4 h-4 ml-2" /></Button>
                    <Button size="lg" variant="outline" className="rounded-xl" onClick={() => navigate('/contact')}>Contact Us</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedDb.length > 0 && (
          <section className="py-16 bg-slate-50/50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedDb.map((rp: any) => (
                    <Card key={rp.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group rounded-2xl" onClick={() => navigate(`/blog/${rp.slug}`)}>
                      {rp.featured_image && (
                        <div className="aspect-video overflow-hidden">
                          <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <Badge className="mb-2 bg-primary/10 text-primary text-xs border-0">{rp.category}</Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-6 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4"><div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="rounded-xl" onClick={() => navigate('/blog')}><ArrowLeft className="w-4 h-4 mr-2" />Back to All Articles</Button>
          </div></div>
        </section>
        <Footer />
      </div>
    );
  }

  // Static fallback
  if (staticPost) {
    const relPosts = getRelatedPosts(staticPost.slug, staticPost.category);
    const shareUrl = `https://aireatro.com/blog/${staticPost.slug}`;
    return (
      <div className="min-h-screen bg-background">
        <ReadingProgress />
        <SeoMeta route={`/blog/${staticPost.slug}`} fallbackTitle={staticPost.title} fallbackDescription={staticPost.excerpt} />
        <SEO title={staticPost.title} description={staticPost.excerpt} keywords={[staticPost.category, 'WhatsApp API', 'AiReatro']} canonical={`/blog/${staticPost.slug}`} ogType="article" ogImage={staticPost.image} />
        <Navbar />
        <section className="relative pt-8 pb-12 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container mx-auto px-4"><div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/blog" className="hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Blog</Link><span className="text-slate-300">/</span><span>{staticPost.category}</span>
            </div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">{staticPost.category}</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 mb-6 leading-[1.2] tracking-tight">{staticPost.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><span className="font-medium text-slate-700">{staticPost.author}</span></div>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Calendar className="w-3.5 h-3.5" />{staticPost.date}</div>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Clock className="w-3.5 h-3.5" />{staticPost.readTime}</div>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 mb-10 ring-1 ring-slate-200/50">
              <img src={staticPost.image} alt={staticPost.title} className="w-full h-full object-cover" />
            </div>
          </div></div>
        </section>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4"><div className="max-w-3xl mx-auto">
            <article className="prose prose-lg prose-slate max-w-none">
              {staticPost.content.split('\n\n').map((p, i) => <p key={i} className="text-slate-600 leading-[1.85] mb-6">{p}</p>)}
            </article>
            <div className="bg-slate-50 rounded-2xl p-6 mt-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2.5"><Share2 className="w-5 h-5 text-slate-400" /><span className="font-semibold text-slate-700">Share this article</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(staticPost.title)}`, '_blank')}><Twitter className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="rounded-xl" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}><Linkedin className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="rounded-xl" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}><Facebook className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            <Card className="mt-12 border-0 bg-gradient-to-br from-primary/10 via-emerald-50 to-primary/5 shadow-lg shadow-primary/5">
              <CardContent className="p-8 md:p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to transform your WhatsApp messaging?</h3>
                <p className="text-slate-500 mb-6">Start your free trial today and see the difference Aireatro makes.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="rounded-xl shadow-md shadow-primary/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-4 h-4 ml-2" /></Button>
                  <Button size="lg" variant="outline" className="rounded-xl" onClick={() => navigate('/contact')}>Contact Us</Button>
                </div>
              </CardContent>
            </Card>
          </div></div>
        </section>
        {relPosts.length > 0 && (
          <section className="py-16 bg-slate-50/50"><div className="container mx-auto px-4"><div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relPosts.map((rp) => (
                <Card key={rp.slug} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group rounded-2xl" onClick={() => navigate(`/blog/${rp.slug}`)}>
                  <div className="aspect-video overflow-hidden"><img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <CardContent className="p-5"><Badge className="mb-2 bg-primary/10 text-primary text-xs border-0">{rp.category}</Badge><h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3></CardContent>
                </Card>
              ))}
            </div>
          </div></div></section>
        )}
        <section className="py-6 bg-white border-t border-slate-100"><div className="container mx-auto px-4"><div className="max-w-4xl mx-auto"><Button variant="ghost" className="rounded-xl" onClick={() => navigate('/blog')}><ArrowLeft className="w-4 h-4 mr-2" />Back to All Articles</Button></div></div></section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
        <Button className="rounded-xl" onClick={() => navigate('/blog')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Button>
      </div>
      <Footer />
    </div>
  );
}
