import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {
  AlertTriangle, ShieldAlert, Clock, CheckCircle, Plus,
  Loader2, RefreshCw, ChevronRight, Siren,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  affected_systems: string[];
  root_cause: string | null;
  actions_taken: string | null;
  declared_by: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: string;
  description: string;
  actor_user_id: string | null;
  created_at: string;
}

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  high: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
};

const SYSTEMS = ['WhatsApp Sending', 'Billing', 'Templates', 'Webhooks', 'Authentication', 'API'];

export default function AdminIncidents() {
  const { role, readOnly } = useOutletContext<{ role: string; readOnly: boolean }>();
  const { get, post, loading } = useAdminApi();
  const isSuperAdmin = role === 'super_admin';

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingState, setLoadingState] = useState(true);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);

  // New incident form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [newSystems, setNewSystems] = useState<string[]>([]);

  // Resolve form
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');

  const loadIncidents = useCallback(async () => {
    setLoadingState(true);
    try {
      const data = await get('incidents');
      setIncidents(data.incidents || []);
    } catch {
      toast({ title: 'Failed to load incidents', variant: 'destructive' });
    } finally {
      setLoadingState(false);
    }
  }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  const loadEvents = async (incidentId: string) => {
    try {
      const data = await get(`incidents/${incidentId}/events`);
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    }
  };

  const openDetail = (incident: Incident) => {
    setDetailIncident(incident);
    loadEvents(incident.id);
  };

  const declareIncident = async () => {
    if (!newTitle.trim()) return;
    try {
      await post('incidents', {
        title: newTitle,
        description: newDesc,
        severity: newSeverity,
        affected_systems: newSystems,
      });
      toast({ title: 'Incident declared' });
      setDeclareOpen(false);
      setNewTitle(''); setNewDesc(''); setNewSeverity('medium'); setNewSystems([]);
      loadIncidents();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const resolveIncident = async () => {
    if (!detailIncident) return;
    try {
      await post(`incidents/${detailIncident.id}/resolve`, {
        root_cause: rootCause,
        actions_taken: actionsTaken,
      });
      toast({ title: 'Incident resolved' });
      setResolveOpen(false);
      setRootCause(''); setActionsTaken('');
      setDetailIncident(null);
      loadIncidents();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const toggleSystem = (sys: string) => {
    setNewSystems(prev =>
      prev.includes(sys) ? prev.filter(s => s !== sys) : [...prev, sys]
    );
  };

  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  if (loadingState) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            SOC-style incident tracking for platform operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {activeCount} active
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadIncidents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isSuperAdmin && !readOnly && (
            <Button size="sm" className="rounded-xl" onClick={() => setDeclareOpen(true)}>
              <Siren className="h-4 w-4 mr-1.5" />
              Declare Incident
            </Button>
          )}
        </div>
      </div>

      {/* Incident List */}
      {incidents.length === 0 ? (
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardContent className="py-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">All clear — no incidents reported.</p>
            <p className="text-xs text-muted-foreground mt-1">Declare an incident when something goes wrong.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map(incident => {
            const sev = severityConfig[incident.severity] || severityConfig.medium;
            const isActive = incident.status !== 'resolved';
            return (
              <Card
                key={incident.id}
                className={cn(
                  'rounded-2xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow',
                  isActive ? sev.border : 'border-border/50'
                )}
                onClick={() => openDetail(incident)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0', sev.bg)}>
                      {isActive
                        ? <AlertTriangle className={cn('h-4 w-4', sev.color)} />
                        : <CheckCircle className="h-4 w-4 text-emerald-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold truncate">{incident.title}</span>
                        <Badge variant="outline" className={cn('text-[9px] h-4 px-1.5 uppercase', sev.bg, sev.color)}>
                          {incident.severity}
                        </Badge>
                        <Badge variant={isActive ? 'default' : 'secondary'} className="text-[9px] h-4 px-1.5">
                          {incident.status}
                        </Badge>
                      </div>
                      {incident.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{incident.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(incident.created_at).toLocaleString()}
                        </span>
                        {incident.affected_systems.length > 0 && (
                          <div className="flex gap-1">
                            {incident.affected_systems.slice(0, 3).map(sys => (
                              <Badge key={sys} variant="outline" className="text-[9px] h-4 px-1">
                                {sys}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Declare Incident Dialog */}
      <Dialog open={declareOpen} onOpenChange={setDeclareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-destructive" />
              Declare Incident
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Title</label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. WhatsApp sending failures" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Description</label>
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What happened?" rows={3} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Severity</label>
              <Select value={newSeverity} onValueChange={setNewSeverity}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Affected Systems</label>
              <div className="grid grid-cols-2 gap-2">
                {SYSTEMS.map(sys => (
                  <label key={sys} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={newSystems.includes(sys)}
                      onCheckedChange={() => toggleSystem(sys)}
                    />
                    {sys}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclareOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={declareIncident} disabled={!newTitle.trim()}>
              Declare Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Incident Detail Drawer */}
      <Sheet open={!!detailIncident} onOpenChange={() => setDetailIncident(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detailIncident && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{detailIncident.title}</SheetTitle>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className={cn('text-[10px]', severityConfig[detailIncident.severity]?.bg, severityConfig[detailIncident.severity]?.color)}>
                    {detailIncident.severity}
                  </Badge>
                  <Badge variant={detailIncident.status !== 'resolved' ? 'default' : 'secondary'} className="text-[10px]">
                    {detailIncident.status}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="space-y-4 mt-6">
                {detailIncident.description && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-0.5">{detailIncident.description}</p>
                  </div>
                )}

                {detailIncident.affected_systems.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Affected Systems</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {detailIncident.affected_systems.map(sys => (
                        <Badge key={sys} variant="outline" className="text-xs">{sys}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Started</label>
                    <p className="text-sm">{new Date(detailIncident.created_at).toLocaleString()}</p>
                  </div>
                  {detailIncident.resolved_at && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Resolved</label>
                      <p className="text-sm">{new Date(detailIncident.resolved_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {detailIncident.root_cause && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Root Cause</label>
                    <p className="text-sm mt-0.5">{detailIncident.root_cause}</p>
                  </div>
                )}

                {detailIncident.actions_taken && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Actions Taken</label>
                    <p className="text-sm mt-0.5">{detailIncident.actions_taken}</p>
                  </div>
                )}

                <Separator />

                {/* Timeline */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Timeline</label>
                  {events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No events recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map(ev => (
                        <div key={ev.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                            <div className="w-px flex-1 bg-border" />
                          </div>
                          <div className="pb-3">
                            <p className="text-sm">{ev.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(ev.created_at).toLocaleString()} · {ev.event_type}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resolve button */}
              {detailIncident.status !== 'resolved' && isSuperAdmin && !readOnly && (
                <SheetFooter className="mt-6">
                  <Button className="w-full rounded-xl" onClick={() => setResolveOpen(true)}>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Resolve Incident
                  </Button>
                </SheetFooter>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Resolve Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Root Cause</label>
              <Textarea value={rootCause} onChange={e => setRootCause(e.target.value)} placeholder="What caused this incident?" rows={3} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Actions Taken</label>
              <Textarea value={actionsTaken} onChange={e => setActionsTaken(e.target.value)} placeholder="What was done to resolve it?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button onClick={resolveIncident}>Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
