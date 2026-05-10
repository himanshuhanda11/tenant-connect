import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget } from '@/hooks/useWidgets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Inbox, ArrowRight } from 'lucide-react';

export default function WidgetLeads() {
  const { id } = useParams<{ id: string }>();
  const { widget } = useWidget(id);
  const navigate = useNavigate();

  // Auto-redirect after a short pause so users learn where leads now live.
  useEffect(() => {
    const t = setTimeout(() => navigate('/inbox?source=website_widget'), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${id}`)}>
          <ArrowLeft className="h-4 w-4" /> Back to builder
        </Button>

        <Card className="p-8 text-center bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5 border-emerald-500/20">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Inbox className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold mt-4">Widget leads now live in your Inbox</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            Every message from <strong>{widget?.name || 'your widget'}</strong> appears in
            Dashboard → Inbox as a real conversation, with the “Website Widget” source filter.
          </p>
          <Button
            className="mt-5 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            onClick={() => navigate('/inbox?source=website_widget')}
          >
            Open Inbox <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">Redirecting automatically…</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
