import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Copy, Star, Globe } from 'lucide-react';
import { Template, IndustryTemplate, TemplateCategory, TemplateStatus } from '@/hooks/useTemplates';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: Template | IndustryTemplate;
  onPreview: () => void;
  onUse: () => void;
  isIndustryTemplate?: boolean;
}

const categoryConfig: Record<TemplateCategory, { color: string; icon: string; label: string }> = {
  UTILITY: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: '🟢', label: 'Utility' },
  MARKETING: { color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: '🔵', label: 'Marketing' },
  AUTHENTICATION: { color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: '🟣', label: 'Authentication' },
};

const statusConfig: Record<TemplateStatus, { color: string; label: string }> = {
  APPROVED: { color: 'bg-green-500/10 text-green-600 border-green-200', label: 'Approved' },
  PENDING: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', label: 'Pending' },
  REJECTED: { color: 'bg-red-500/10 text-red-600 border-red-200', label: 'Rejected' },
  PAUSED: { color: 'bg-orange-500/10 text-orange-600 border-orange-200', label: 'Paused' },
  DISABLED: { color: 'bg-gray-500/10 text-gray-600 border-gray-200', label: 'Disabled' },
};

export function TemplateCard({ template, onPreview, onUse, isIndustryTemplate }: TemplateCardProps) {
  const category = categoryConfig[template.category];
  const status = !isIndustryTemplate ? statusConfig[(template as Template).status] : null;

  // Get preview text
  const getPreviewText = () => {
    if (isIndustryTemplate) {
      return (template as IndustryTemplate).body.substring(0, 100) + '...';
    }
    const t = template as Template;
    const bodyComponent = t.components_json?.find?.((c: any) => c.type === 'BODY');
    return bodyComponent?.text?.substring(0, 100) + '...' || 'No preview available';
  };

  return (
    <Card className="group hover:shadow-soft transition-all duration-200 border-border/50 hover:border-primary/30">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            {isIndustryTemplate && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {(template as IndustryTemplate).description}
              </p>
            )}
          </div>
          {(template as Template).is_recommended && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-xs font-medium">Recommended</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className={cn('text-xs', category.color)}>
            {category.icon} {category.label}
          </Badge>
          {status && (
            <Badge variant="outline" className={cn('text-xs', status.color)}>
              {status.label}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs bg-muted/50">
            <Globe className="h-3 w-3 mr-1" />
            {template.language.toUpperCase()}
          </Badge>
        </div>

        {/* Preview */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4 min-h-[60px]">
          <p className="text-xs text-muted-foreground line-clamp-3 font-mono">
            {getPreviewText()}
          </p>
        </div>

        {/* Quality indicator for approved templates */}
        {!isIndustryTemplate && (template as Template).quality_rating && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Quality:</span>
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                (template as Template).quality_rating === 'GREEN' && 'bg-green-500',
                (template as Template).quality_rating === 'YELLOW' && 'bg-yellow-500',
                (template as Template).quality_rating === 'RED' && 'bg-red-500'
              )}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={onUse}
            className="flex-1"
            disabled={!isIndustryTemplate && (template as Template).status !== 'APPROVED'}
          >
            {isIndustryTemplate ? (
              <>
                <Copy className="h-4 w-4 mr-1.5" />
                Use Template
              </>
            ) : (
              'Use Template'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
