import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Trash2,
  Info,
  Image,
  Video,
  FileText,
  ExternalLink,
  Phone,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { TemplateCategory, INDUSTRIES, IndustryType } from '@/hooks/useTemplates';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

type HeaderType = 'none' | 'text' | 'image' | 'video' | 'document';
type ButtonType = 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';

interface TemplateButton {
  type: ButtonType;
  text: string;
  url?: string;
  phone_number?: string;
}

export function CreateTemplateModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: CreateTemplateModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<TemplateCategory>(initialData?.category || 'UTILITY');
  const [industry, setIndustry] = useState<IndustryType | ''>(initialData?.industry || '');
  const [language, setLanguage] = useState(initialData?.language || 'en');
  const [headerType, setHeaderType] = useState<HeaderType>('none');
  const [headerText, setHeaderText] = useState('');
  const [body, setBody] = useState(initialData?.body || '');
  const [footer, setFooter] = useState('');
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'de', name: 'German' },
    { code: 'id', name: 'Indonesian' },
  ];

  const addButton = (type: ButtonType) => {
    if (buttons.length >= 3) {
      toast.error('Maximum 3 buttons allowed');
      return;
    }
    setButtons([...buttons, { type, text: '' }]);
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updated = [...buttons];
    (updated[index] as any)[field] = value;
    setButtons(updated);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const insertVariable = (varNum: number) => {
    setBody(body + `{{${varNum}}}`);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Message body is required');
      return;
    }

    setSubmitting(true);

    // Build components array
    const components: any[] = [];

    if (headerType === 'text' && headerText) {
      components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
    } else if (headerType !== 'none') {
      components.push({ type: 'HEADER', format: headerType.toUpperCase() });
    }

    components.push({ type: 'BODY', text: body });

    if (footer) {
      components.push({ type: 'FOOTER', text: footer });
    }

    if (buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: buttons.map((btn) => ({
          type: btn.type,
          text: btn.text,
          ...(btn.url && { url: btn.url }),
          ...(btn.phone_number && { phone_number: btn.phone_number }),
        })),
      });
    }

    try {
      await onSubmit({
        name: name.trim(),
        category,
        language,
        components_json: components,
        industry,
      });
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a WhatsApp message template. Templates require Meta approval before use.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., order_confirmation"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase with underscores only
                </p>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
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

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={industry || 'none'} onValueChange={(v) => setIndustry(v === 'none' ? '' : v as IndustryType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select industry</SelectItem>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.icon} {ind.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language *</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Warning */}
            {category === 'MARKETING' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Marketing templates require explicit user opt-in. Avoid promotional language
                  like "SALE", "FREE", or "OFFER" to improve approval chances.
                </AlertDescription>
              </Alert>
            )}

            {/* Header */}
            <div className="space-y-3">
              <Label>Header (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={headerType === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType('none')}
                >
                  None
                </Button>
                <Button
                  type="button"
                  variant={headerType === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType('text')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Text
                </Button>
                <Button
                  type="button"
                  variant={headerType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType('image')}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={headerType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType('video')}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
              </div>
              {headerType === 'text' && (
                <Input
                  placeholder="Header text (max 60 characters)"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value.slice(0, 60))}
                  maxLength={60}
                />
              )}
              {(headerType === 'image' || headerType === 'video') && (
                <p className="text-xs text-muted-foreground">
                  Media will be uploaded when sending the template
                </p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Message Body *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => insertVariable(num)}
                    >
                      {`{{${num}}}`}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Enter your message here. Use {{1}}, {{2}} for variables."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {body.length}/1024 characters • Variables must match approved structure
              </p>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <Label>Footer (Optional)</Label>
              <Input
                placeholder="Footer text (max 60 characters)"
                value={footer}
                onChange={(e) => setFooter(e.target.value.slice(0, 60))}
                maxLength={60}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Buttons (Optional)</Label>
                <span className="text-xs text-muted-foreground">{buttons.length}/3 buttons</span>
              </div>

              {buttons.map((btn, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {btn.type === 'URL' && <ExternalLink className="h-3 w-3 mr-1" />}
                        {btn.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3 mr-1" />}
                        {btn.type === 'QUICK_REPLY' && <MessageSquare className="h-3 w-3 mr-1" />}
                        {btn.type}
                      </Badge>
                    </div>
                    <Input
                      placeholder="Button text"
                      value={btn.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value)}
                    />
                    {btn.type === 'URL' && (
                      <Input
                        placeholder="https://example.com/{{1}}"
                        value={btn.url || ''}
                        onChange={(e) => updateButton(index, 'url', e.target.value)}
                      />
                    )}
                    {btn.type === 'PHONE_NUMBER' && (
                      <Input
                        placeholder="+1234567890"
                        value={btn.phone_number || ''}
                        onChange={(e) => updateButton(index, 'phone_number', e.target.value)}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeButton(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {buttons.length < 3 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addButton('URL')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    URL Button
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addButton('PHONE_NUMBER')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Phone Button
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addButton('QUICK_REPLY')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Quick Reply
                  </Button>
                </div>
              )}
            </div>

            {/* Guidance */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Tips for approval:</strong>
                <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
                  <li>Avoid promotional words for Utility templates</li>
                  <li>Variables must be in sequence: {`{{1}}, {{2}}, {{3}}`}</li>
                  <li>Header variables count separately from body variables</li>
                  <li>Templates typically take 24-48 hours for approval</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
