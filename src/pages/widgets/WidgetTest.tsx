import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget } from '@/hooks/useWidgets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, RefreshCw, ExternalLink, Code2,
} from 'lucide-react';

const PUBLIC_WIDGET_URL = 'https://aireatro.com/widget.js';

type Status = 'idle' | 'loading' | 'ok' | 'fail';
type Check = { label: string; status: Status; detail?: string };

export default function WidgetTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { widget, loading } = useWidget(id);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [checks, setChecks] = useState<Check[]>([
    { label: 'widget.js script reachable', status: 'idle' },
    { label: 'Public config endpoint OK', status: 'idle' },
    { label: 'Widget published', status: 'idle' },
    { label: 'WhatsApp number set', status: 'idle' },
    { label: 'Widget rendered in test page', status: 'idle' },
  ]);

  useEffect(() => {
    if (!widget) return;
    setChecks((c) => c.map((x) => ({ ...x, status: 'loading' as Status })));

    const next: Check[] = [];

    // 1. script reachable
    fetch(PUBLIC_WIDGET_URL, { method: 'GET', mode: 'cors' })
      .then((r) => next[0] = { label: 'widget.js script reachable', status: r.ok ? 'ok' : 'fail', detail: `HTTP ${r.status}` })
      .catch((e) => next[0] = { label: 'widget.js script reachable', status: 'fail', detail: String(e) })
      .finally(updateAll);

    // 2. config endpoint
    fetch(`https://fygwjpdasnhaomoqdvcu.supabase.co/functions/v1/widget-config?id=${encodeURIComponent(widget.public_key)}`)
      .then(async (r) => {
        const ok = r.ok; let detail = `HTTP ${r.status}`;
        try { const j = await r.json(); if (j?.id) detail = `Config returned for "${j.name || 'widget'}"`; } catch {}
        next[1] = { label: 'Public config endpoint OK', status: ok ? 'ok' : 'fail', detail };
      })
      .catch((e) => next[1] = { label: 'Public config endpoint OK', status: 'fail', detail: String(e) })
      .finally(updateAll);

    // 3. published
    next[2] = {
      label: 'Widget published',
      status: widget.status === 'published' ? 'ok' : 'fail',
      detail: widget.status === 'published' ? 'Status: published' : 'Publish from the builder before installing',
    };
    // 4. whatsapp number
    next[3] = {
      label: 'WhatsApp number set',
      status: widget.whatsapp_number ? 'ok' : 'fail',
      detail: widget.whatsapp_number ? widget.whatsapp_number : 'Add a WhatsApp number in the builder',
    };
    updateAll();

    function updateAll() {
      setChecks((prev) => prev.map((p, i) => next[i] ?? p));
    }

    // 5. iframe render check (postMessage from iframe)
    const onMsg = (e: MessageEvent) => {
      if (e.data && e.data.__aireatroWidgetTest) {
        setChecks((prev) => prev.map((p, i) =>
          i === 4 ? { label: 'Widget rendered in test page', status: 'ok', detail: 'Bubble appeared in sandbox iframe' } : p
        ));
      }
    };
    window.addEventListener('message', onMsg);
    const t = setTimeout(() => {
      setChecks((prev) => prev.map((p, i) => i === 4 && p.status !== 'ok'
        ? { ...p, status: 'fail', detail: 'No widget detected after 6s — check console of the test frame' }
        : p));
    }, 6000);
    return () => { window.removeEventListener('message', onMsg); clearTimeout(t); };
  }, [widget, reloadKey]);

  if (loading || !widget) {
    return <DashboardLayout><div className="p-6 text-sm text-muted-foreground">Loading…</div></DashboardLayout>;
  }

  const sandboxHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Widget test</title>
<style>body{margin:0;font-family:-apple-system,sans-serif;background:#f8fafc;color:#0f172a;padding:32px}h1{font-size:18px}p{color:#64748b;font-size:14px}</style>
</head><body>
<h1>Widget sandbox · ${widget.name}</h1>
<p>This iframe simulates an external website. The Aireatro widget script is loaded exactly as it would be on a customer's site.</p>
<script>
  window.addEventListener('load', function(){
    setTimeout(function(){
      var b = document.querySelector('.aw-bubble, .aireatro-widget__bubble, .aireatro-widget__sticky');
      if (b) parent.postMessage({ __aireatroWidgetTest: true }, '*');
    }, 1500);
  });
<\/script>
<script src="${PUBLIC_WIDGET_URL}" data-id="${widget.public_key}" defer><\/script>
</body></html>`;

  const iconFor = (s: Status) =>
    s === 'ok' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
    s === 'fail' ? <XCircle className="h-4 w-4 text-rose-500" /> :
    s === 'loading' ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
    <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-[1400px] mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}/install`)}>
            <ArrowLeft className="h-4 w-4" /> Back to install
          </Button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">Live integration test</h1>
            <p className="text-xs text-muted-foreground">Loads the real public snippet inside a sandboxed iframe to verify end-to-end installation.</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">{widget.status}</Badge>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setReloadKey((k) => k + 1)}>
            <RefreshCw className="h-4 w-4" /> Re-run tests
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-2 border-b text-xs text-muted-foreground flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5" /> Sandbox iframe — loads <code className="font-mono">{PUBLIC_WIDGET_URL}</code>
            </div>
            <iframe
              key={reloadKey}
              ref={iframeRef}
              title="Widget test sandbox"
              srcDoc={sandboxHtml}
              sandbox="allow-scripts allow-popups allow-same-origin"
              className="w-full bg-white"
              style={{ height: 600, border: 0 }}
            />
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Verification checklist</h3>
            <ul className="space-y-2">
              {checks.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5">{iconFor(c.status)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{c.label}</div>
                    {c.detail && <div className="text-[11px] text-muted-foreground truncate">{c.detail}</div>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t space-y-2">
              <Button size="sm" className="w-full gap-2" variant="outline"
                onClick={() => window.open(PUBLIC_WIDGET_URL, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" /> Open widget.js
              </Button>
              <Button size="sm" className="w-full gap-2" variant="outline"
                onClick={() => navigate(`/widgets/${widget.id}/install`)}>
                <Code2 className="h-3.5 w-3.5" /> View embed code
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
