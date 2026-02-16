import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  List,
  Code
} from 'lucide-react';
import { getStaticGuide, STATIC_GUIDES, GUIDE_CATEGORIES } from '@/data/guideContent';

const sectionIcons: Record<string, React.ReactNode> = {
  what_is: <HelpCircle className="h-5 w-5" />,
  when_to_use: <List className="h-5 w-5" />,
  how_it_works: <BookOpen className="h-5 w-5" />,
  common_mistakes: <XCircle className="h-5 w-5" />,
  tips: <Lightbulb className="h-5 w-5" />,
  steps: <CheckCircle className="h-5 w-5" />,
  example: <Code className="h-5 w-5" />,
};

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const guide = slug ? getStaticGuide(slug) : undefined;
  const category = guide ? GUIDE_CATEGORIES.find(c => c.slug === guide.category) : undefined;
  
  // Find related guides
  const relatedGuides = guide?.relatedSlugs?.map(s => getStaticGuide(s)).filter(Boolean) || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Guide Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The guide you're looking for doesn't exist or has been moved.
            </p>
            <Button asChild>
              <Link to="/help">Back to Help Center</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderContent = (content: string) => {
    // Simple markdown-like parsing
    return content.split('\n').map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Check for list items
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: line.replace(/^[•-]\s*/, '') }} />
        );
      }
      
      // Check for numbered items
      const numMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
        );
      }
      
      // Check for error/success markers
      if (line.startsWith('❌')) {
        return (
          <div key={i} className="flex items-start gap-2 text-destructive">
            <XCircle className="h-4 w-4 mt-1 shrink-0" />
            <span>{line.replace('❌', '').trim()}</span>
          </div>
        );
      }
      if (line.startsWith('✅')) {
        return (
          <div key={i} className="flex items-start gap-2 text-green-600">
            <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
            <span>{line.replace('✅', '').trim()}</span>
          </div>
        );
      }
      
      return line ? <p key={i} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={i} />;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-4" />
          <div className="max-w-4xl mx-auto">
            <Link 
              to={`/help/category/${guide.category}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {category?.name || 'Category'}
            </Link>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="capitalize">{guide.category}</Badge>
              <Badge variant="secondary" className="capitalize">{guide.difficulty}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {guide.readingTime} min read
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{guide.title}</h1>
            <p className="text-lg text-muted-foreground">{guide.summary}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {guide.sections.map((section, index) => (
                  <div key={index} id={section.type}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {sectionIcons[section.type] || <BookOpen className="h-5 w-5" />}
                      </div>
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    <Card>
                      <CardContent className="p-6 prose prose-sm max-w-none">
                        <div className="space-y-2">
                          {renderContent(section.content)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {/* Examples */}
                {guide.examples && guide.examples.length > 0 && (
                  <div id="examples">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Code className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-semibold">Examples</h2>
                    </div>
                    <div className="space-y-4">
                      {guide.examples.map((example, index) => (
                        <Card key={index} className={example.isGood ? 'border-green-500/50' : 'border-destructive/50'}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              {example.isGood ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <CardTitle className="text-base">{example.title}</CardTitle>
                            </div>
                            {example.description && (
                              <p className="text-sm text-muted-foreground">{example.description}</p>
                            )}
                          </CardHeader>
                          <CardContent>
                            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                              {example.code}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Guides */}
                {relatedGuides.length > 0 && (
                  <div className="pt-8">
                    <Separator className="mb-8" />
                    <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedGuides.map(related => related && (
                        <Link key={related.slug} to={`/help/${related.slug}`}>
                          <Card className="h-full hover:border-primary/50 transition-colors group">
                            <CardContent className="p-4">
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {related.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {related.summary}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Table of Contents */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">On this page</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <nav className="space-y-1">
                        {guide.sections.map((section, index) => (
                          <a
                            key={index}
                            href={`#${section.type}`}
                            className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                          >
                            {section.title}
                          </a>
                        ))}
                        {guide.examples && guide.examples.length > 0 && (
                          <a
                            href="#examples"
                            className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                          >
                            Examples
                          </a>
                        )}
                      </nav>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-3">Need more help?</h4>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/contact">Contact Support</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
