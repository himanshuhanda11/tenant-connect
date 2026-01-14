import { Tag, STARTER_TAGS } from '@/types/tag';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tags, Plus, Sparkles, ArrowRight, Zap } from 'lucide-react';

interface EmptyTagsStateProps {
  onCreateTag: () => void;
  onCreateStarterTags: (tags: Partial<Tag>[]) => void;
}

export function EmptyTagsState({ onCreateTag, onCreateStarterTags }: EmptyTagsStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-10">
          {/* Animated Icon */}
          <div className="relative mx-auto w-28 h-28 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-3xl rotate-6" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl -rotate-3" />
            <div className="absolute inset-0 bg-card rounded-3xl shadow-lg flex items-center justify-center">
              <Tags className="h-12 w-12 text-primary" />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-3 -right-3 animate-bounce" style={{ animationDelay: '0s' }}>
              <Badge className="bg-green-500 text-white shadow-lg text-xs px-2 py-0.5">
                🌱 New
              </Badge>
            </div>
            <div className="absolute -bottom-2 -left-4 animate-bounce" style={{ animationDelay: '0.3s' }}>
              <Badge className="bg-orange-500 text-white shadow-lg text-xs px-2 py-0.5">
                🔥 Hot
              </Badge>
            </div>
            <div className="absolute top-1/2 -right-8 animate-bounce" style={{ animationDelay: '0.6s' }}>
              <Badge className="bg-blue-500 text-white shadow-lg text-xs px-2 py-0.5">
                ⭐ VIP
              </Badge>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-3">Create your first tag</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Tags help you organize contacts, segment audiences, and power automated workflows. 
            Start with our suggestions or create custom ones.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Create Custom Tag */}
          <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all" onClick={onCreateTag}>
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Create Custom Tag</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Design a tag that fits your unique business needs
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                Get started
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Use Starter Tags */}
          <Card className="group cursor-pointer hover:shadow-lg hover:border-yellow-500/30 transition-all" onClick={() => onCreateStarterTags(STARTER_TAGS)}>
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Quick Start Pack</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add {STARTER_TAGS.length} essential tags instantly
              </p>
              <div className="flex items-center text-sm text-yellow-600 font-medium">
                Add all tags
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Starter Tags Preview */}
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Included in Quick Start</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_TAGS.map((tag, index) => (
                <Badge
                  key={index}
                  className="text-white text-sm px-3 py-1"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.emoji} {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}