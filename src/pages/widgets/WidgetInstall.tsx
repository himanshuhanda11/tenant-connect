import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget } from '@/hooks/useWidgets';
import { WidgetPreview } from '@/components/widgets/WidgetPreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Copy, Check, ArrowLeft, ExternalLink, Sparkles, Code2,
  Rocket, MousePointerClick, Eye, Inbox, AlertTriangle, PartyPopper, FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const PUBLIC_WIDGET_URL = 'https://aireatro.com/widget.js';

export default function WidgetInstall() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const justPublished = params.get('published') === '1';
  const { widget, agents, loading, setStatus } = useWidget(id);
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const html = useMemo(
    () => widget ? `<script src="${PUBLIC_WIDGET_URL}" data-id="${widget.public_key}" defer></script>` : '',
    [widget]
  );
  const ctaLink = useMemo(
    () => widget?.whatsapp_number ? `https://wa.me/${String(widget.whatsapp_number).replace(/\D/g, '')}` : '',
    [widget]
  );
  const reactSnippet = widget
    ? `// Add once in your app entry (e.g. main.tsx) or any page\nimport { useEffect } from 'react';\n\nuseEffect(() => {\n  const s = document.createElement('script');\n  s.src = '${PUBLIC_WIDGET_URL}';\n  s.defer = true;\n  s.dataset.id = '${widget.public_key}';\n  document.body.appendChild(s);\n}, []);`
    : '';

  if (loading || !widget) {
    return <DashboardLayout><div className="p-6 text-sm text-muted-foreground">Loading…</div></DashboardLayout>;
  }

  const isPublished = widget.status === 'published';

  const copy = async (text: string, key: string, label = 'Snippet') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Copy failed — please select and copy manually');
    }
  };

  const handlePublish = async () => {
    if (!widget.whatsapp_number) {
      toast.error('Add a WhatsApp number in the builder first');
      navigate(`/widgets/${widget.id}`);
      return;
    }
    await setStatus('published');
    toast.success('Widget published — snippet is ready to copy');
  };

  return (
    <DashboardLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-5 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}`)}>
            <ArrowLeft className="h-4 w-4" /> Back to builder
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Install · {widget.name}</h1>
              <Badge
                className={isPublished
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                }
              >
                {isPublished ? '● Published' : '● Draft'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              One line of code. Setup time &lt; 2 min. Leads land directly in your Inbox.
            </p>
          </div>
        </div>

        {/* Just-published banner */}
        <AnimatePresence>
          {justPublished && isPublished && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Widget is live!</p>
                <p className="text-xs text-muted-foreground">
                  Copy the snippet below and paste it into your website's HTML before <code>&lt;/body&gt;</code>.
                </p>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => copy(html, 'banner-html', 'Embed code')}>
                {copied === 'banner-html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === 'banner-html' ? 'Copied' : 'Copy snippet'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not-published warning + inline publish CTA */}
        {!isPublished && (
          <Card className="p-4 border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">Widget is in draft mode</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Publish to activate the embed code on your website.</p>
            </div>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={handlePublish}>
              <Rocket className="h-4 w-4" /> Publish now
            </Button>
          </Card>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-5">
          {/* LEFT — instructions + snippet */}
          <div className="space-y-5">
            {/* Steps */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-emerald-500" />
                <h3 className="font-semibold text-sm">Where to paste this code?</h3>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Copy the snippet below.</li>
                <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Open your website's HTML and paste it just before the closing <code className="px-1 rounded bg-muted">&lt;/body&gt;</code> tag.</li>
                <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Save and reload — the WhatsApp button appears in the corner.</li>
              </ol>
            </Card>

            {/* Snippet tabs */}
            <Tabs defaultValue="html">
              <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="wp">WordPress</TabsTrigger>
                <TabsTrigger value="shopify">Shopify</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="mt-3">
                <CodeBox code={html} onCopy={() => copy(html, 'html', 'Embed code')} copied={copied === 'html'} />
              </TabsContent>

              <TabsContent value="wp" className="mt-3 space-y-3">
                <Card className="p-4 text-sm bg-card/60 space-y-2">
                  <p>1. WordPress Admin → Plugins → Add new → install <strong>"Insert Headers and Footers"</strong>.</p>
                  <p>2. Settings → Insert Headers and Footers → paste below into the <strong>Footer</strong> box.</p>
                  <p>3. Save. The widget appears on every page.</p>
                </Card>
                <CodeBox code={html} onCopy={() => copy(html, 'wp', 'Embed code')} copied={copied === 'wp'} />
              </TabsContent>

              <TabsContent value="shopify" className="mt-3 space-y-3">
                <Card className="p-4 text-sm bg-card/60 space-y-2">
                  <p>1. Shopify Admin → Online Store → Themes → <strong>Edit code</strong>.</p>
                  <p>2. Open <code className="px-1 rounded bg-muted">theme.liquid</code> and paste before <code className="px-1 rounded bg-muted">&lt;/body&gt;</code>.</p>
                  <p>3. Save.</p>
                </Card>
                <CodeBox code={html} onCopy={() => copy(html, 'shopify', 'Embed code')} copied={copied === 'shopify'} />
              </TabsContent>

              <TabsContent value="react" className="mt-3">
                <CodeBox code={reactSnippet} onCopy={() => copy(reactSnippet, 'react', 'React snippet')} copied={copied === 'react'} multiline />
              </TabsContent>
            </Tabs>

            {/* Test integration */}
            <Card className="p-4 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border-violet-500/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Test the integration</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Loads the public snippet inside a sandboxed iframe and runs end-to-end checks (script reachable, config OK, widget rendered).
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" className="gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white"
                      onClick={() => navigate(`/widgets/${widget.id}/test`)}>
                      <FlaskConical className="h-3.5 w-3.5" /> Open live test page
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => copy(html, 'test-html', 'Embed code')}>
                      {copied === 'test-html' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy website code
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => window.open(PUBLIC_WIDGET_URL, '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5" /> Verify widget.js
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* CTA link card */}
            {ctaLink && (
              <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-sm">Direct WhatsApp link (CTA buttons)</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Use this for "Chat on WhatsApp" buttons in emails, ads, and bio links.
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border/60">
                  <code className="flex-1 text-xs truncate font-mono">{ctaLink}</code>
                  <Button size="sm" variant="outline" className="gap-1.5 flex-shrink-0" onClick={() => copy(ctaLink, 'cta', 'WhatsApp link')}>
                    {copied === 'cta' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'cta' ? 'Copied' : 'Copy link'}
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-shrink-0" onClick={() => window.open(ctaLink, '_blank')}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Where leads go */}
            <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Inbox className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Leads land in your Inbox</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Every visitor message creates a conversation in <strong>Dashboard → Inbox</strong> with the
                    "Website Widget" source. No separate leads list to check.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 gap-1.5" onClick={() => navigate('/inbox?source=website_widget')}>
                    <Inbox className="h-3.5 w-3.5" /> Open Inbox
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT — preview + actions */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-emerald-500" />
                <h3 className="font-semibold text-sm">Live preview</h3>
              </div>
              <WidgetPreview widget={widget} agents={agents} device="desktop" />
            </Card>

            <Card className="p-4 space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Public widget ID</div>
              <div className="font-mono text-xs break-all p-2 rounded-md bg-muted/40 border border-border/40">
                {widget.public_key}
              </div>
              <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => copy(widget.public_key, 'pk', 'Widget ID')}>
                {copied === 'pk' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'pk' ? 'Copied' : 'Copy widget ID'}
              </Button>
              <Button size="sm" variant="ghost" className="w-full gap-1.5" onClick={() => navigate(`/widgets/${widget.id}`)}>
                <Sparkles className="h-3.5 w-3.5" /> Edit widget
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CodeBox({ code, onCopy, copied, multiline }: { code: string; onCopy: () => void; copied: boolean; multiline?: boolean }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-[11px] font-mono text-slate-400">embed.html</span>
        </div>
        <Button
          size="sm"
          onClick={onCopy}
          className={`gap-1.5 h-8 px-3 text-xs font-semibold transition-all ${
            copied
              ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
              : 'bg-white text-slate-900 hover:bg-slate-100'
          }`}
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy snippet</>}
        </Button>
      </div>
      <pre className={`p-4 text-xs sm:text-sm text-slate-100 font-mono overflow-x-auto ${multiline ? '' : 'whitespace-pre-wrap break-all'}`}>
        {code}
      </pre>
    </div>
  );
}
