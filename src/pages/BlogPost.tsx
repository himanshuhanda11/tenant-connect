import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
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
// Keep static fallback
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

/** Render markdown-like text: **bold**, *italic*, [text](url) */
function renderRichText(text: string) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'heading':
      if (block.level === 1) return <h1 className="text-3xl font-bold text-slate-900 mt-10 mb-4">{block.content}</h1>;
      if (block.level === 3) return <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{block.content}</h3>;
      return <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">{block.content}</h2>;

    case 'paragraph':
      return <p className="text-slate-700 leading-relaxed mb-6 text-[17px]">{renderRichText(block.content)}</p>;

    case 'image':
      return block.imageUrl ? (
        <figure className="my-8">
          <img src={block.imageUrl} alt={block.imageAlt || ''} className="w-full rounded-xl shadow-md" />
          {block.caption && <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">{block.caption}</figcaption>}
        </figure>
      ) : null;

    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary/50 pl-6 py-2 my-6 bg-primary/5 rounded-r-lg italic text-slate-700 text-lg">
          {renderRichText(block.content)}
        </blockquote>
      );

    case 'code':
      return (
        <div className="my-6 rounded-xl overflow-hidden">
          {block.language && <div className="bg-slate-800 text-slate-400 text-xs px-4 py-2">{block.language}</div>}
          <pre className="bg-slate-900 text-slate-100 p-4 overflow-x-auto text-sm font-mono"><code>{block.content}</code></pre>
        </div>
      );

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`my-4 space-y-2 pl-6 ${block.ordered ? 'list-decimal' : 'list-disc'} text-slate-700 text-[17px]`}>
          {(block.items || []).map((item, i) => (
            <li key={i} className="leading-relaxed">{renderRichText(item)}</li>
          ))}
        </ListTag>
      );

    case 'link':
      return block.buttonUrl ? (
        <div className="my-4">
          <a href={block.buttonUrl} className="text-primary underline underline-offset-2 font-medium inline-flex items-center gap-1 hover:text-primary/80 text-[17px]" target="_blank" rel="noopener noreferrer">
            {block.buttonText || block.buttonUrl}
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : null;

    case 'divider':
      return <Separator className="my-8" />;

    case 'cta':
      return (
        <div className="my-10 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-100 text-center">
          <Link to={block.buttonUrl || '/signup'} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            {block.buttonText || 'Get Started'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      );

    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dbPost, setDbPost] = useState<DBBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDb, setRelatedDb] = useState<any[]>([]);

  // Try database first
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

        // Fetch related
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

  // Static fallback
  const staticPost = getBlogPost(slug || '');
  const staticRelated = staticPost ? getRelatedPosts(staticPost.slug, staticPost.category) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  // If DB post found, render it
  if (dbPost) {
    const shareUrl = `https://aireatro.com/blog/${dbPost.slug}`;
    return (
      <div className="min-h-screen bg-background">
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
        <section className="relative pt-8 pb-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                <span>/</span>
                <span>{dbPost.category}</span>
              </div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">{dbPost.category}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">{dbPost.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                {dbPost.author && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <span>{dbPost.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(dbPost.published_at || dbPost.created_at), 'MMM d, yyyy')}</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{dbPost.read_time || 5} min read</div>
              </div>
              {dbPost.featured_image && (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
                  <img src={dbPost.featured_image} alt={dbPost.image_alt || dbPost.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <article>
                {dbPost.content.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </article>

              {/* Share */}
              <div className="border-t border-slate-200 pt-8 mt-12">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2"><Share2 className="w-5 h-5 text-muted-foreground" /><span className="font-medium">Share this article</span></div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(dbPost.title)}`, '_blank')}><Twitter className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}><Linkedin className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}><Facebook className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Card className="mt-12 border-0 bg-gradient-to-br from-primary/10 to-emerald-100">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to transform your WhatsApp messaging?</h3>
                  <p className="text-slate-600 mb-6">Start your free trial today and see the difference AiReatro makes.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-4 h-4 ml-2" /></Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>Contact Us</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedDb.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedDb.map((rp: any) => (
                    <Card key={rp.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate(`/blog/${rp.slug}`)}>
                      {rp.featured_image && (
                        <div className="aspect-video overflow-hidden">
                          <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <Badge className="mb-2 bg-primary/10 text-primary text-xs">{rp.category}</Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-8 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4"><div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/blog')}><ArrowLeft className="w-4 h-4 mr-2" />Back to All Articles</Button>
          </div></div>
        </section>
        <Footer />
      </div>
    );
  }

  // Static fallback for old hardcoded posts
  if (staticPost) {
    const relPosts = getRelatedPosts(staticPost.slug, staticPost.category);
    const shareUrl = `https://aireatro.com/blog/${staticPost.slug}`;
    return (
      <div className="min-h-screen bg-background">
        <SeoMeta route={`/blog/${staticPost.slug}`} fallbackTitle={staticPost.title} fallbackDescription={staticPost.excerpt} />
        <SEO title={staticPost.title} description={staticPost.excerpt} keywords={[staticPost.category, 'WhatsApp API', 'AiReatro']} canonical={`/blog/${staticPost.slug}`} ogType="article" ogImage={staticPost.image} />
        <Navbar />
        <section className="relative pt-8 pb-12 bg-white">
          <div className="container mx-auto px-4"><div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link><span>/</span><span>{staticPost.category}</span>
            </div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">{staticPost.category}</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">{staticPost.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><span>{staticPost.author}</span></div>
              <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{staticPost.date}</div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{staticPost.readTime}</div>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
              <img src={staticPost.image} alt={staticPost.title} className="w-full h-full object-cover" />
            </div>
          </div></div>
        </section>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4"><div className="max-w-3xl mx-auto">
            <article className="prose prose-lg prose-slate max-w-none">
              {staticPost.content.split('\n\n').map((p, i) => <p key={i} className="text-slate-700 leading-relaxed mb-6">{p}</p>)}
            </article>
            <div className="border-t border-slate-200 pt-8 mt-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2"><Share2 className="w-5 h-5 text-muted-foreground" /><span className="font-medium">Share this article</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(staticPost.title)}`, '_blank')}><Twitter className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}><Linkedin className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}><Facebook className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            <Card className="mt-12 border-0 bg-gradient-to-br from-primary/10 to-emerald-100">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to transform your WhatsApp messaging?</h3>
                <p className="text-slate-600 mb-6">Start your free trial today and see the difference AiReatro makes.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-4 h-4 ml-2" /></Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>Contact Us</Button>
                </div>
              </CardContent>
            </Card>
          </div></div>
        </section>
        {relPosts.length > 0 && (
          <section className="py-16 bg-slate-50"><div className="container mx-auto px-4"><div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relPosts.map((rp) => (
                <Card key={rp.slug} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate(`/blog/${rp.slug}`)}>
                  <div className="aspect-video overflow-hidden"><img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <CardContent className="p-5"><Badge className="mb-2 bg-primary/10 text-primary text-xs">{rp.category}</Badge><h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3></CardContent>
                </Card>
              ))}
            </div>
          </div></div></section>
        )}
        <section className="py-8 bg-white border-t border-slate-100"><div className="container mx-auto px-4"><div className="max-w-4xl mx-auto"><Button variant="ghost" onClick={() => navigate('/blog')}><ArrowLeft className="w-4 h-4 mr-2" />Back to All Articles</Button></div></div></section>
        <Footer />
      </div>
    );
  }

  // Not found
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/blog')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Button>
      </div>
      <Footer />
    </div>
  );
}
