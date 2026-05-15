import React, { useState, useEffect, useMemo } from 'react';
import {
  HandMetal,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Eye,
  Search,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGreetingTemplates, MAX_AGENT_GREETINGS } from '@/hooks/useGreetingTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VARIABLES = [
  { token: '{{name}}', label: 'Customer name' },
  { token: '{{biz}}', label: 'Business name' },
  { token: '{{agent_name}}', label: 'Agent name' },
];

const renderPreview = (text: string) =>
  text
    .replace(/\{\{name\}\}/g, 'Sarah')
    .replace(/\{\{biz\}\}/g, 'Aireatro')
    .replace(/\{\{agent_name\}\}/g, 'Alex');

export function AgentGreetingsCard() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    seedDefaults,
  } = useGreetingTemplates();

  const [enabled, setEnabled] = useState(false);
  const [savingFlag, setSavingFlag] = useState(false);
  const [loadedFlag, setLoadedFlag] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Load enable flag
  useEffect(() => {
    if (!user?.id || !currentTenant?.id) return;
    (async () => {
      const { data } = await supabase
        .from('agents')
        .select('personal_greetings_enabled')
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      setEnabled(!!data?.personal_greetings_enabled);
      setLoadedFlag(true);
    })();
  }, [user?.id, currentTenant?.id]);

  const toggleEnabled = async (next: boolean) => {
    if (!user?.id || !currentTenant?.id) return;
    setEnabled(next);
    setSavingFlag(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ personal_greetings_enabled: next })
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
      toast.success(next ? 'Personal greetings enabled' : 'Personal greetings disabled');
    } catch (err: any) {
      setEnabled(!next);
      toast.error(err?.message || 'Failed to update');
    } finally {
      setSavingFlag(false);
    }
  };

  const atLimit = templates.length >= MAX_AGENT_GREETINGS;

  const handleAdd = () => {
    if (!newMessage.trim() || atLimit) return;
    addTemplate.mutate(newMessage.trim(), {
      onSuccess: () => setNewMessage(''),
    });
  };

  const insertVariable = (token: string, target: 'new' | 'edit') => {
    if (target === 'new') setNewMessage((p) => `${p}${p && !p.endsWith(' ') ? ' ' : ''}${token}`);
    else setEditText((p) => `${p}${p && !p.endsWith(' ') ? ' ' : ''}${token}`);
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;
    updateTemplate.mutate(
      { id: editingId, message_text: editText.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditText('');
          toast.success('Greeting updated');
        },
      }
    );
  };

  const activeCount = templates.filter((t) => t.is_active).length;
  const disabledCount = templates.length - activeCount;

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (filter === 'active' && !t.is_active) return false;
      if (filter === 'disabled' && t.is_active) return false;
      if (search && !t.message_text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [templates, filter, search]);

  return (
    <Card className="overflow-hidden border-border/60">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-7 border-b border-border/60">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <HandMetal className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl tracking-tight flex items-center gap-2">
                Direct Chat Greetings
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <ShieldCheck className="w-3 h-3" /> Personal
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                Up to {MAX_AGENT_GREETINGS} personal openers used by the <strong>Open in Direct Chat</strong> button
                in the inbox. Independent from workspace auto-reply and away messages.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                {enabled ? 'Active' : 'Disabled'}
              </span>
              <span className="text-[11px] text-muted-foreground/80">
                {activeCount}/{templates.length} selected
              </span>
            </div>
            <Switch checked={enabled} onCheckedChange={toggleEnabled} disabled={!loadedFlag || savingFlag} />
          </div>
        </div>
      </div>

      <CardContent className={cn('p-5 sm:p-6 space-y-6', !enabled && 'opacity-90')}>
        {!enabled && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            Turn on the toggle above to use your personal greeting library on assigned chats.
            Templates below stay saved either way.
          </div>
        )}

        {/* Composer + Live Preview */}
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3 rounded-xl border border-border/60 bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  New Greeting
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {templates.length}/{MAX_AGENT_GREETINGS} used · variables personalize each send
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => insertVariable(v.token, 'new')}
                  className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-mono"
                  title={v.label}
                >
                  + {v.token}
                </button>
              ))}
            </div>

            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Hi {{name}}! 👋 This is {{agent_name}} from {{biz}}. How can we help today?"
              rows={4}
              maxLength={500}
              className="resize-none text-sm"
              disabled={atLimit}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{newMessage.length}/500</span>
              <Button
                onClick={handleAdd}
                disabled={!newMessage.trim() || addTemplate.isPending || atLimit}
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                {atLimit ? 'Limit reached' : 'Add Greeting'}
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:col-span-2 rounded-xl border border-border/60 overflow-hidden bg-card/50">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <div
              className="p-4 min-h-[170px] flex items-end"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.08) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[hsl(152_45%_55%)] text-white px-3.5 py-2 shadow-sm">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {newMessage.trim()
                    ? renderPreview(newMessage)
                    : 'Hi Sarah! 👋 This is Alex from Aireatro. How can we help today?'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-white/80">12:34</span>
                  <Check className="w-3 h-3 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Library */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">My Greeting Library</h3>
              <Badge variant="secondary" className="text-[10px]">{templates.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(['all', 'active', 'disabled'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'px-2.5 py-1.5 text-xs font-medium capitalize transition-colors',
                      filter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {templates.length === 0 ? 'No greetings yet' : 'No matching greetings'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {templates.length === 0
                  ? 'Add your first opener above or load 10 curated defaults.'
                  : 'Try adjusting the search or filter.'}
              </p>
              {templates.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => seedDefaults.mutate()}
                  disabled={seedDefaults.isPending}
                  className="mt-4 gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Load 10 Defaults
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {filtered.map((template) => {
                const isEditing = editingId === template.id;
                return (
                  <div
                    key={template.id}
                    className={cn(
                      'group relative rounded-xl border bg-card p-3.5 transition-all',
                      isEditing
                        ? 'border-primary/40 ring-2 ring-primary/10'
                        : 'border-border hover:border-primary/30 hover:shadow-md',
                      !template.is_active && 'opacity-60'
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {VARIABLES.map((v) => (
                            <button
                              key={v.token}
                              type="button"
                              onClick={() => insertVariable(v.token, 'edit')}
                              className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-mono"
                            >
                              + {v.token}
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          maxLength={500}
                          className="resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-7 gap-1">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </Button>
                          <Button size="sm" onClick={saveEdit} disabled={updateTemplate.isPending} className="h-7 gap-1">
                            <Check className="h-3.5 w-3.5" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge
                            variant={template.is_active ? 'default' : 'secondary'}
                            className={cn(
                              'text-[10px] h-5 gap-1',
                              template.is_active &&
                                'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                template.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                              )}
                            />
                            {template.is_active ? 'Selected' : 'Off'}
                          </Badge>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <Switch
                              checked={template.is_active}
                              onCheckedChange={(checked) =>
                                updateTemplate.mutate({ id: template.id, is_active: checked })
                              }
                              className="scale-75 ml-0.5"
                            />
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words line-clamp-4">
                          {template.message_text}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
