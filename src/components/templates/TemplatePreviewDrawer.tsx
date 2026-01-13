import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Template, IndustryTemplate, TemplateCategory } from '@/hooks/useTemplates';
import { Copy, Send, Globe, CheckCircle, AlertCircle, Info, ExternalLink, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatePreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  template: Template | IndustryTemplate | null;
  isIndustryTemplate?: boolean;
  onUse: () => void;
  onClone?: () => void;
}

const categoryConfig: Record<TemplateCategory, { color: string; icon: string; label: string }> = {
  UTILITY: { color: 'bg-emerald-500/10 text-emerald-600', icon: '🟢', label: 'Utility' },
  MARKETING: { color: 'bg-blue-500/10 text-blue-600', icon: '🔵', label: 'Marketing' },
  AUTHENTICATION: { color: 'bg-purple-500/10 text-purple-600', icon: '🟣', label: 'Authentication' },
};

export function TemplatePreviewDrawer({
  open,
  onClose,
  template,
  isIndustryTemplate,
  onUse,
  onClone,
}: TemplatePreviewDrawerProps) {
  if (!template) return null;

  const category = categoryConfig[template.category];

  // Extract content based on template type
  const getContent = () => {
    if (isIndustryTemplate) {
      const t = template as IndustryTemplate;
      return {
        header: t.header,
        body: t.body,
        footer: t.footer,
        buttons: t.buttons,
        variables: t.variables,
      };
    }
    const t = template as Template;
    const components = t.components_json || [];
    const headerComp = components.find((c: any) => c.type === 'HEADER');
    const bodyComp = components.find((c: any) => c.type === 'BODY');
    const footerComp = components.find((c: any) => c.type === 'FOOTER');
    const buttonsComp = components.find((c: any) => c.type === 'BUTTONS');

    // Extract variables from body
    const bodyText = bodyComp?.text || '';
    const variableMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
    const variables = variableMatches.map((v: string, i: number) => `variable_${i + 1}`);

    return {
      header: headerComp?.text,
      body: bodyText,
      footer: footerComp?.text,
      buttons: buttonsComp?.buttons,
      variables,
    };
  };

  const content = getContent();

  // Highlight variables in text
  const highlightVariables = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\{\{\d+\}\})/g);
    return parts.map((part, i) => {
      if (/\{\{\d+\}\}/.test(part)) {
        return (
          <span key={i} className="bg-primary/20 text-primary px-1 rounded font-medium">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SheetTitle className="text-xl">{template.name}</SheetTitle>
              {isIndustryTemplate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {(template as IndustryTemplate).description}
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className={cn('text-xs', category.color)}>
              {category.icon} {category.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              {template.language.toUpperCase()}
            </Badge>
            {!isIndustryTemplate && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  (template as Template).status === 'APPROVED'
                    ? 'bg-green-500/10 text-green-600'
                    : (template as Template).status === 'PENDING'
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-red-500/10 text-red-600'
                )}
              >
                {(template as Template).status === 'APPROVED' && (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {(template as Template).status}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-6 space-y-6">
            {/* Message Preview */}
            <div>
              <h4 className="text-sm font-medium mb-3">Message Preview</h4>
              <div className="bg-muted/30 rounded-xl p-4 border">
                {/* WhatsApp-style preview */}
                <div className="bg-card rounded-lg shadow-sm p-3 max-w-[85%]">
                  {content.header && (
                    <p className="font-semibold text-sm mb-2">{highlightVariables(content.header)}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{highlightVariables(content.body)}</p>
                  {content.footer && (
                    <p className="text-xs text-muted-foreground mt-2">{content.footer}</p>
                  )}
                </div>

                {/* Buttons */}
                {content.buttons && content.buttons.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {content.buttons.map((btn: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-center gap-2 p-2 bg-card rounded-lg border text-sm text-primary"
                      >
                        {btn.type === 'URL' && <ExternalLink className="h-4 w-4" />}
                        {btn.type === 'PHONE_NUMBER' && <Phone className="h-4 w-4" />}
                        {btn.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Variables */}
            {content.variables && content.variables.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Template Variables</h4>
                <div className="space-y-2">
                  {content.variables.map((variable: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-mono">
                        {`{{${i + 1}}}`}
                      </span>
                      <span className="text-sm text-muted-foreground">{variable}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Rules */}
            <div>
              <h4 className="text-sm font-medium mb-3">Meta Policy</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Category: {category.label}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {template.category === 'MARKETING'
                        ? 'Marketing templates require user opt-in consent'
                        : template.category === 'UTILITY'
                        ? 'Utility templates are for transactional messages'
                        : 'Authentication templates are for OTP/verification'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Opt-in Required</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {template.category === 'MARKETING'
                        ? 'Yes - Explicit marketing consent needed'
                        : 'No - Implied consent for transactional'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Conversation Type</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {template.category === 'MARKETING'
                        ? 'Marketing conversation (24h window opens)'
                        : template.category === 'UTILITY'
                        ? 'Utility conversation'
                        : 'Authentication conversation'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-3">
            {isIndustryTemplate || onClone ? (
              <Button variant="outline" className="flex-1" onClick={onClone}>
                <Copy className="h-4 w-4 mr-2" />
                Clone & Edit
              </Button>
            ) : null}
            <Button
              className="flex-1"
              onClick={onUse}
              disabled={!isIndustryTemplate && (template as Template).status !== 'APPROVED'}
            >
              <Send className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
