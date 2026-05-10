import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget, useWidgetLeads } from '@/hooks/useWidgets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MessageSquare } from 'lucide-react';

export default function WidgetLeads() {
  const { id } = useParams<{ id: string }>();
  const { widget } = useWidget(id);
  const { leads, loading } = useWidgetLeads(id);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${id}`)}><ArrowLeft className="h-4 w-4" />Back</Button>
        <h1 className="text-2xl font-bold">Captured leads {widget ? `· ${widget.name}` : ''}</h1>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : leads.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground bg-card/60">
            No leads yet. Once visitors submit the pre-chat form, they'll show up here automatically.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Contact</th>
                  <th className="text-left p-3">Message</th>
                  <th className="text-left p-3">Page</th>
                  <th className="text-left p-3">When</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} className="border-t border-border/50 hover:bg-muted/20">
                    <td className="p-3 font-medium">{l.name || '—'}</td>
                    <td className="p-3">
                      {l.phone && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{l.phone}</div>}
                      {l.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{l.email}</div>}
                    </td>
                    <td className="p-3 max-w-[280px] truncate" title={l.message || ''}><MessageSquare className="h-3 w-3 inline mr-1 text-muted-foreground" />{l.message || '—'}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[180px] truncate">{l.page_url || '—'}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
