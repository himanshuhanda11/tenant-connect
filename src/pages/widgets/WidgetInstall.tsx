import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget } from '@/hooks/useWidgets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SCRIPT_HOST = `${import.meta.env.VITE_SUPABASE_URL ?? ''}`.replace('.supabase.co', '.supabase.co');
// We'll serve the runtime from the published Aireatro app (public/widget.js)
const PUBLIC_WIDGET_URL = 'https://app.aireatro.com/widget.js';

export default function WidgetInstall() {
  const { id } = useParams<{ id: string }>();
  const { widget, loading } = useWidget(id);
  const navigate = useNavigate();

  if (loading || !widget) return <DashboardLayout><div className="p-6 text-sm text-muted-foreground">Loading…</div></DashboardLayout>;

  const isReady = widget.status === 'published';
  const html = `<script src="${PUBLIC_WIDGET_URL}" data-id="${widget.public_key}" defer></script>`;
  const react = `// In your app entry (e.g. main.tsx) or any page\nuseEffect(() => {\n  const s = document.createElement('script');\n  s.src = '${PUBLIC_WIDGET_URL}';\n  s.defer = true;\n  s.dataset.id = '${widget.public_key}';\n  document.body.appendChild(s);\n}, []);`;
  const wp = `1. Go to WordPress Admin → Appearance → Theme File Editor (or use a header/footer plugin like “Insert Headers and Footers”).\n2. Paste this snippet into the <head> or just before </body>:\n\n${html}\n\n3. Save. Visit your site — the widget should appear instantly.`;
  const shopify = `1. In Shopify Admin → Online Store → Themes → Edit Code.\n2. Open theme.liquid and paste this just before </body>:\n\n${html}\n\n3. Save. The widget loads on every page.`;

  const copy = (s: string, label = 'Code') => { navigator.clipboard.writeText(s); toast({ title: `${label} copied` }); };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}`)}><ArrowLeft className="h-4 w-4" />Back to builder</Button>

        <div>
          <h1 className="text-2xl font-bold">Install your widget</h1>
          <p className="text-sm text-muted-foreground mt-1">Add one line to your website. Setup time: &lt; 2 min.</p>
        </div>

        {!isReady && (
          <Card className="p-4 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm">
            Your widget is in <strong>{widget.status}</strong> mode. Publish it from the builder to make it live.
          </Card>
        )}

        <Tabs defaultValue="html">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="wp">WordPress</TabsTrigger>
            <TabsTrigger value="shopify">Shopify</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="mt-3">
            <Card className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-auto">
              <pre>{html}</pre>
            </Card>
            <Button className="mt-3 gap-2" onClick={() => copy(html, 'Embed code')}><Copy className="h-4 w-4" />Copy snippet</Button>
          </TabsContent>
          <TabsContent value="wp" className="mt-3">
            <Card className="p-4 whitespace-pre-wrap text-sm bg-card/60">{wp}</Card>
            <Button className="mt-3 gap-2" onClick={() => copy(html, 'Embed code')}><Copy className="h-4 w-4" />Copy snippet</Button>
          </TabsContent>
          <TabsContent value="shopify" className="mt-3">
            <Card className="p-4 whitespace-pre-wrap text-sm bg-card/60">{shopify}</Card>
            <Button className="mt-3 gap-2" onClick={() => copy(html, 'Embed code')}><Copy className="h-4 w-4" />Copy snippet</Button>
          </TabsContent>
          <TabsContent value="react" className="mt-3">
            <Card className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-auto">
              <pre>{react}</pre>
            </Card>
            <Button className="mt-3 gap-2" onClick={() => copy(react, 'React snippet')}><Copy className="h-4 w-4" />Copy snippet</Button>
          </TabsContent>
        </Tabs>

        <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Public key</div>
          <div className="mt-1 font-mono text-sm break-all">{widget.public_key}</div>
          <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={() => copy(widget.public_key, 'Public key')}><Copy className="h-4 w-4" />Copy</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
