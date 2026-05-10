import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget } from '@/hooks/useWidgets';
import { WidgetBuilderControls } from '@/components/widgets/WidgetBuilderControls';
import { WidgetPreview } from '@/components/widgets/WidgetPreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code2, Eye, Monitor, Smartphone, Users, BarChart3, Pause, Play, FlaskConical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function WidgetBuilder() {
  const { id } = useParams<{ id: string }>();
  const { widget, agents, loading, save, setStatus, upsertAgent, removeAgent } = useWidget(id);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const navigate = useNavigate();

  if (loading || !widget) {
    return <DashboardLayout><div className="p-6 text-sm text-muted-foreground">Loading widget…</div></DashboardLayout>;
  }

  const isPublished = widget.status === 'published';

  return (
    <DashboardLayout>
      <div className="border-b border-border/50 bg-gradient-to-r from-emerald-500/5 via-card to-teal-500/5 backdrop-blur sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/widgets')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> All widgets
          </Button>
          <div className="font-semibold truncate flex items-center gap-2">
            {widget.name}
            <Badge variant={isPublished ? 'default' : 'secondary'} className={isPublished ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : ''}>{widget.status}</Badge>
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}/leads`)}><Users className="h-4 w-4" />Leads</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}/analytics`)}><BarChart3 className="h-4 w-4" />Analytics</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}/test`)}><FlaskConical className="h-4 w-4" />Test</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${widget.id}/install`)}><Code2 className="h-4 w-4" />Install</Button>
          {isPublished ? (
            <>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={() => navigate(`/widgets/${widget.id}/install`)}>
                <Code2 className="h-4 w-4" /> Get embed code
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={async () => { await setStatus('paused'); toast({ title: 'Widget paused' }); }}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            </>
          ) : (
            <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={async () => {
              if (!widget.whatsapp_number) { toast({ title: 'Add a WhatsApp number first', variant: 'destructive' }); return; }
              await setStatus('published');
              toast({ title: 'Widget published 🎉', description: 'Opening installation snippet…' });
              navigate(`/widgets/${widget.id}/install?published=1`);
            }}>
              <Play className="h-4 w-4" /> Publish & install
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 px-4 sm:px-6 py-6 max-w-[1500px] mx-auto">
        <div>
          <WidgetBuilderControls
            widget={widget}
            agents={agents}
            onChange={save}
            onAgentSave={upsertAgent}
            onAgentDelete={removeAgent}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold"><Eye className="h-4 w-4 text-emerald-500" /> Live preview</div>
            <div className="inline-flex rounded-lg border border-border/50 p-0.5 bg-muted/30">
              <button onClick={() => setDevice('desktop')} className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${device === 'desktop' ? 'bg-card shadow' : 'text-muted-foreground'}`}><Monitor className="h-3.5 w-3.5" />Desktop</button>
              <button onClick={() => setDevice('mobile')} className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${device === 'mobile' ? 'bg-card shadow' : 'text-muted-foreground'}`}><Smartphone className="h-3.5 w-3.5" />Mobile</button>
            </div>
          </div>
          <WidgetPreview widget={widget} agents={agents} device={device} />
        </div>
      </div>
    </DashboardLayout>
  );
}
