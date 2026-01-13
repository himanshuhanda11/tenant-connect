import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { GUIDE_CATEGORIES, STATIC_GUIDES, getStaticGuidesByCategory } from '@/data/guideContent';

export default function HelpCategory() {
  const { category } = useParams<{ category: string }>();
  
  const categoryData = GUIDE_CATEGORIES.find(c => c.slug === category);
  const guides = category ? getStaticGuidesByCategory(category) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <Button asChild>
              <Link to="/help">Back to Help Center</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/help" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Help Center
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="text-4xl">{categoryData.icon}</div>
              <div>
                <h1 className="text-3xl font-bold">{categoryData.name}</h1>
                <p className="text-muted-foreground">{categoryData.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {guides.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No guides yet</h2>
                <p className="text-muted-foreground">
                  Guides for this category are coming soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {guides.map(guide => (
                  <Link key={guide.slug} to={`/help/${guide.slug}`}>
                    <Card className="hover:border-primary/50 hover:shadow-md transition-all group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="capitalize">
                                {guide.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {guide.readingTime} min
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {guide.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {guide.summary}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Other Categories */}
            <div className="mt-16">
              <h2 className="text-xl font-semibold mb-4">Other Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GUIDE_CATEGORIES.filter(c => c.slug !== category).map(cat => (
                  <Link key={cat.slug} to={`/help/category/${cat.slug}`}>
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{cat.icon}</div>
                        <p className="font-medium text-sm">{cat.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
