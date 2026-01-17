import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';
import { getBlogPost, getRelatedPosts, blogPosts } from '@/data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = getBlogPost(slug || '');
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category);

  const shareUrl = `https://aireatro.com/blog/${post.slug}`;
  const shareText = post.title;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.title} | AiReatro Blog`}
        description={post.excerpt}
        canonical={`https://aireatro.com/blog/${post.slug}`}
        keywords={[post.category, 'WhatsApp Business', 'AiReatro', 'tutorial', 'guide']}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-8 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span>{post.category}</span>
            </div>

            {/* Title */}
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Article Content */}
            <article className="prose prose-lg prose-slate max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-slate-700 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </article>

            {/* Share */}
            <div className="border-t border-slate-200 pt-8 mt-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Share this article</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')}
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Card className="mt-12 border-0 bg-gradient-to-br from-primary/10 to-emerald-100">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Ready to transform your WhatsApp messaging?
                </h3>
                <p className="text-slate-600 mb-6">
                  Start your free trial today and see the difference AiReatro makes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate('/signup')}>
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                    Talk to Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card 
                    key={relatedPost.slug} 
                    className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-5">
                      <Badge className="mb-2 bg-primary/10 text-primary text-xs">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <section className="py-8 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Articles
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}