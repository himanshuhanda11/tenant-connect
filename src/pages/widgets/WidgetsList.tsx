import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, MessageCircle, Trash2, ExternalLink, BarChart3, Sparkles } from 'lucide-react';
import { useWidgets } from '@/hooks/useWidgets';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export default function WidgetsList() {
  const { widgets, loading, create, remove } = useWidgets();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Growth Tools
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">WhatsApp Website Widget</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Premium chat widget builder. Capture leads instantly and route them to WhatsApp.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50">
            <Plus className="h-4 w-4" /> New widget
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading widgets…</div>
        ) : widgets.length === 0 ? (
          <Card className="p-10 text-center bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5 border-dashed">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Build your first widget</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Design a beautiful WhatsApp chat button, embed it on your website, and capture qualified leads in &lt; 10 min.
            </p>
            <Button className="mt-4 gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create widget</Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="group p-5 h-full flex flex-col bg-gradient-to-br from-card to-card/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all border-border/50">
                  <div className="flex items-start justify-between">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ background: `linear-gradient(135deg, ${w.config?.primaryColor || '#10B981'}, ${w.config?.accentColor || '#059669'})` }}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <Badge variant={w.status === 'published' ? 'default' : 'secondary'} className={w.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : ''}>
                      {w.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mt-3 truncate">{w.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{w.whatsapp_number || 'No WhatsApp number'}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/widgets/${w.id}`)}>Open builder</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/widgets/${w.id}/analytics`)}><BarChart3 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/widgets/${w.id}/install`)}><ExternalLink className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New widget</DialogTitle></DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pricing page widget" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              const w = await create(name || 'My WhatsApp Widget');
              setOpen(false); setName('');
              if (w) navigate(`/widgets/${w.id}`);
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
