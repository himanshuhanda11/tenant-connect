import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Power, PowerOff, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGreetingTemplates } from '@/hooks/useGreetingTemplates';
import { cn } from '@/lib/utils';

export function WhatsAppGreetingSettings() {
  const {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    seedDefaults,
  } = useGreetingTemplates();

  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [seeded, setSeeded] = useState(false);

  // Auto-seed defaults when visiting for the first time with no templates
  useEffect(() => {
    if (!isLoading && templates.length === 0 && !seeded) {
      setSeeded(true);
      seedDefaults.mutate();
    }
  }, [isLoading, templates.length]);

  const handleAdd = () => {
    if (!newMessage.trim()) return;
    addTemplate.mutate(newMessage.trim());
    setNewMessage('');
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;
    updateTemplate.mutate({ id: editingId, message_text: editText.trim() });
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          WhatsApp Greeting Messages
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the pre-filled greeting messages sent when agents click "Open in WhatsApp". Use <code className="bg-muted px-1 rounded text-xs">{'{{name}}'}</code> for customer name, <code className="bg-muted px-1 rounded text-xs">{'{{biz}}'}</code> for your business profile name, and <code className="bg-muted px-1 rounded text-xs">{'{{agent_name}}'}</code> for the agent's profile name.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          A random active greeting is selected each time an agent clicks "Open in WhatsApp". The business name is automatically pulled from your WhatsApp verified profile.
        </AlertDescription>
      </Alert>

      {/* Add new template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add New Greeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Hi {{name}}! 👋 Welcome to {{biz}}. How can we help you today?`}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {newMessage.length}/500 characters
            </p>
            <Button onClick={handleAdd} disabled={!newMessage.trim() || addTemplate.isPending} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Greeting Templates
                <Badge variant="secondary" className="ml-2">{templates.length}</Badge>
              </CardTitle>
              <CardDescription>
                {templates.filter(t => t.is_active).length} active · {templates.filter(t => !t.is_active).length} disabled
              </CardDescription>
            </div>
            {templates.length === 0 && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => seedDefaults.mutate()}
                disabled={seedDefaults.isPending}
                className="gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                Load Defaults
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No greeting templates yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first template above or load the defaults.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template, idx) => (
                <React.Fragment key={template.id}>
                  {idx > 0 && <Separator />}
                  <div className={cn(
                    "group rounded-lg p-3 transition-colors",
                    !template.is_active && "opacity-50",
                    editingId === template.id ? "bg-muted/50 ring-1 ring-primary/20" : "hover:bg-muted/30"
                  )}>
                    {editingId === template.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="resize-none"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={cancelEdit} className="gap-1">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </Button>
                          <Button size="sm" onClick={saveEdit} disabled={updateTemplate.isPending} className="gap-1">
                            <Check className="h-3.5 w-3.5" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {template.message_text}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Switch
                            checked={template.is_active}
                            onCheckedChange={(checked) => updateTemplate.mutate({ id: template.id, is_active: checked })}
                            className="scale-75"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(template.id, template.message_text)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteTemplate.mutate(template.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
