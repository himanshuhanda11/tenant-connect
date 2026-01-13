import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Image,
  Video,
  FileText,
  Type,
  Link,
  Phone,
  MessageSquare
} from 'lucide-react';
import { 
  HeaderType, 
  TemplateButton, 
  TemplateCategory,
  TemplateVersion,
  LintValidationResult
} from '@/types/template';
import { WhatsAppPreview } from './WhatsAppPreview';

interface TemplateBuilderProps {
  initialData?: Partial<TemplateVersion> & { name?: string; category?: TemplateCategory; language?: string };
  lintResults: LintValidationResult[];
  onValidate: (version: Partial<TemplateVersion>) => void;
  onSave: (data: TemplateBuilderData) => void;
  saving?: boolean;
  mode?: 'create' | 'edit';
}

export interface TemplateBuilderData {
  name: string;
  language: string;
  category: TemplateCategory;
  header_type: HeaderType;
  header_content?: string;
  body: string;
  footer?: string;
  buttons: TemplateButton[];
  variable_samples: Record<string, string>;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt_BR', name: 'Portuguese (BR)' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
];

export function TemplateBuilder({
  initialData,
  lintResults,
  onValidate,
  onSave,
  saving = false,
  mode = 'create'
}: TemplateBuilderProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [language, setLanguage] = useState(initialData?.language || 'en');
  const [category, setCategory] = useState<TemplateCategory>(initialData?.category || 'UTILITY');
  const [headerType, setHeaderType] = useState<HeaderType>(initialData?.header_type || 'none');
  const [headerContent, setHeaderContent] = useState(initialData?.header_content || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [footer, setFooter] = useState(initialData?.footer || '');
  const [buttons, setButtons] = useState<TemplateButton[]>(
    (initialData?.buttons as TemplateButton[]) || []
  );
  const [variableSamples, setVariableSamples] = useState<Record<string, string>>(
    (initialData?.variable_samples as Record<string, string>) || {}
  );

  // Extract variables from body
  const extractedVariables = body.match(/\{\{(\d+)\}\}/g) || [];
  const variableNumbers = [...new Set(extractedVariables.map(v => v.replace(/[{}]/g, '')))];

  // Validate on changes
  useEffect(() => {
    const version: Partial<TemplateVersion> = {
      header_type: headerType,
      header_content: headerContent || undefined,
      body,
      footer: footer || undefined,
      buttons,
      variable_samples: variableSamples
    };
    onValidate(version);
  }, [headerType, headerContent, body, footer, buttons, variableSamples, onValidate]);

  const handleAddButton = () => {
    if (buttons.length >= 3) return;
    setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index: number, updates: Partial<TemplateButton>) => {
    setButtons(buttons.map((btn, i) => (i === index ? { ...btn, ...updates } : btn)));
  };

  const handleInsertVariable = () => {
    const nextVar = variableNumbers.length > 0 
      ? Math.max(...variableNumbers.map(Number)) + 1 
      : 1;
    setBody(body + `{{${nextVar}}}`);
  };

  const handleSave = () => {
    onSave({
      name,
      language,
      category,
      header_type: headerType,
      header_content: headerContent || undefined,
      body,
      footer: footer || undefined,
      buttons,
      variable_samples: variableSamples
    });
  };

  const errors = lintResults.filter(r => r.severity === 'error');
  const warnings = lintResults.filter(r => r.severity === 'warning');
  const infos = lintResults.filter(r => r.severity === 'info');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Builder Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., order_confirmation"
                disabled={mode === 'edit'}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language *</Label>
                <Select value={language} onValueChange={setLanguage} disabled={mode === 'edit'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={category} 
                  onValueChange={(v) => setCategory(v as TemplateCategory)}
                  disabled={mode === 'edit'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTILITY">🟢 Utility</SelectItem>
                    <SelectItem value="MARKETING">🔵 Marketing</SelectItem>
                    <SelectItem value="AUTHENTICATION">🟣 Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {category === 'UTILITY' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Utility templates should contain transactional content. Avoid promotional language.
                </AlertDescription>
              </Alert>
            )}

            {category === 'AUTHENTICATION' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Authentication templates must include a verification code (OTP) as {'{{1}}'}.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Header (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[
                { type: 'none', icon: null, label: 'None' },
                { type: 'text', icon: Type, label: 'Text' },
                { type: 'image', icon: Image, label: 'Image' },
                { type: 'video', icon: Video, label: 'Video' },
                { type: 'document', icon: FileText, label: 'Document' },
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={headerType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType(type as HeaderType)}
                  className="flex gap-1"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </Button>
              ))}
            </div>

            {headerType === 'text' && (
              <div className="space-y-2">
                <Label>Header Text</Label>
                <Input
                  value={headerContent}
                  onChange={(e) => setHeaderContent(e.target.value)}
                  placeholder="Header text (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{headerContent.length}/60</p>
              </div>
            )}

            {(headerType === 'image' || headerType === 'video' || headerType === 'document') && (
              <div className="space-y-2">
                <Label>Media URL</Label>
                <Input
                  value={headerContent}
                  onChange={(e) => setHeaderContent(e.target.value)}
                  placeholder={`Enter ${headerType} URL (will be replaced at send time)`}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{1}}'} as placeholder for dynamic media
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Body *</CardTitle>
              <Button variant="outline" size="sm" onClick={handleInsertVariable}>
                <Plus className="h-4 w-4 mr-1" />
                Add Variable
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your message body. Use {{1}}, {{2}}, etc. for variables."
                rows={6}
                maxLength={1024}
              />
              <p className="text-xs text-muted-foreground">{body.length}/1024</p>
            </div>

            {variableNumbers.length > 0 && (
              <div className="space-y-3">
                <Label>Variable Samples</Label>
                <p className="text-xs text-muted-foreground">
                  Provide example values for each variable to help with Meta review
                </p>
                {variableNumbers.map((varNum) => (
                  <div key={varNum} className="flex items-center gap-2">
                    <Badge variant="secondary" className="min-w-[50px] justify-center">
                      {`{{${varNum}}}`}
                    </Badge>
                    <Input
                      value={variableSamples[varNum] || ''}
                      onChange={(e) => setVariableSamples({
                        ...variableSamples,
                        [varNum]: e.target.value
                      })}
                      placeholder={`Sample value for {{${varNum}}}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Footer (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="Footer text (max 60 characters)"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{footer.length}/60</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Buttons (Optional)</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddButton}
                disabled={buttons.length >= 3}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Button
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {buttons.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No buttons added. Click "Add Button" to add up to 3 buttons.
              </p>
            )}

            {buttons.map((button, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Button {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveButton(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={button.type}
                    onValueChange={(v) => handleButtonChange(index, { 
                      type: v as TemplateButton['type'],
                      url: undefined,
                      phone_number: undefined
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUICK_REPLY">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Quick Reply
                        </span>
                      </SelectItem>
                      <SelectItem value="URL">
                        <span className="flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          URL
                        </span>
                      </SelectItem>
                      <SelectItem value="PHONE_NUMBER">
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={button.text}
                    onChange={(e) => handleButtonChange(index, { text: e.target.value })}
                    placeholder="Button text"
                    maxLength={25}
                  />
                </div>

                {button.type === 'URL' && (
                  <Input
                    value={button.url || ''}
                    onChange={(e) => handleButtonChange(index, { url: e.target.value })}
                    placeholder="https://example.com/page"
                  />
                )}

                {button.type === 'PHONE_NUMBER' && (
                  <Input
                    value={button.phone_number || ''}
                    onChange={(e) => handleButtonChange(index, { phone_number: e.target.value })}
                    placeholder="+14155551234"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saving || !name || !body || errors.length > 0}
            size="lg"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Right: Preview & Validation */}
      <div className="space-y-6">
        {/* WhatsApp Preview */}
        <WhatsAppPreview
          headerType={headerType}
          headerContent={headerContent}
          body={body}
          footer={footer}
          buttons={buttons}
          variableSamples={variableSamples}
        />

        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Validation
              {errors.length === 0 && warnings.length === 0 ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All checks passed
                </Badge>
              ) : (
                <>
                  {errors.length > 0 && (
                    <Badge variant="destructive">{errors.length} errors</Badge>
                  )}
                  {warnings.length > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {warnings.length} warnings
                    </Badge>
                  )}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {lintResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No validation issues found. Your template looks good!
                </p>
              ) : (
                <div className="space-y-3">
                  {lintResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.severity === 'error' 
                          ? 'border-destructive/50 bg-destructive/5' 
                          : result.severity === 'warning'
                          ? 'border-yellow-500/50 bg-yellow-50'
                          : 'border-blue-500/50 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(result.severity)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.message}</p>
                          {result.suggestion && (
                            <p className="text-xs text-muted-foreground mt-1">
                              💡 {result.suggestion}
                            </p>
                          )}
                          {result.field && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Field: {result.field}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Approval Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Approval Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Use clear, professional language</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Avoid ALL CAPS and excessive punctuation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Include your business name in the message</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Match template category with content type</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Provide realistic sample values for variables</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
