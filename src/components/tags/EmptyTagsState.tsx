import { Tag, STARTER_TAGS } from '@/types/tag';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tags, Plus, Sparkles } from 'lucide-react';

interface EmptyTagsStateProps {
  onCreateTag: () => void;
  onCreateStarterTags: (tags: Partial<Tag>[]) => void;
}

export function EmptyTagsState({ onCreateTag, onCreateStarterTags }: EmptyTagsStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Illustration */}
        <div className="relative mx-auto w-32 h-32 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Tags className="h-12 w-12 text-primary" />
          </div>
          {/* Floating tags */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Badge className="bg-green-500 text-xs">🌱 New</Badge>
          </div>
          <div className="absolute -bottom-2 -left-4 animate-bounce" style={{ animationDelay: '0.2s' }}>
            <Badge className="bg-orange-500 text-xs">🔥 Hot</Badge>
          </div>
          <div className="absolute top-1/2 -right-8 animate-bounce" style={{ animationDelay: '0.4s' }}>
            <Badge className="bg-blue-500 text-xs">⭐ VIP</Badge>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Create your first tag</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Tags help you organize contacts, segment audiences, and automate workflows. Get started with our suggested tags or create your own.
        </p>

        <div className="flex flex-col gap-4">
          <Button size="lg" onClick={onCreateTag} className="mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>

          <div className="text-sm text-muted-foreground">or</div>

          {/* Starter Tags */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Quick Start with Suggested Tags</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {STARTER_TAGS.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    style={{ backgroundColor: tag.color }}
                    className="text-white"
                  >
                    {tag.emoji} {tag.name}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateStarterTags(STARTER_TAGS)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add All Starter Tags
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
