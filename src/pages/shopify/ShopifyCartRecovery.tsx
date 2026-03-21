import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShoppingCart, Plus, DollarSign, TrendingUp, Clock,
  Percent, Trash2, AlertTriangle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ShopifyPageShell, ShopifyEmptyState, ShopifyStatCard } from '@/components/shopify/ShopifyPageShell';
import { useCartRecoveryRules } from '@/hooks/useCartRecovery';
import { formatDistanceToNow } from 'date-fns';

const TRIGGER_TYPES = [
  { value: 'cart_abandoned', label: 'Cart Abandoned' },
  { value: 'checkout_abandoned', label: 'Checkout Abandoned' },
  { value: 'high_value_cart', label: 'High Value Cart' },
  { value: 'repeat_abandoner', label: 'Repeat Abandoner' },
  { value: 'returning_visitor', label: 'Returning Visitor' },
];

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700', chat: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700', popup: 'bg-amber-100 text-amber-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-blue-100 text-blue-700', clicked: 'bg-purple-100 text-purple-700',
  recovered: 'bg-green-100 text-green-700', expired: 'bg-muted text-muted-foreground',
  failed: 'bg-red-100 text-red-700',
};

export default function ShopifyCartRecovery() {
  const { storeId } = useParams<{ storeId: string }>();
  const { rules, logs, stats, isLoading, createRule, toggleRule, deleteRule } = useCartRecoveryRules(storeId);
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '', trigger_type: 'cart_abandoned', delay_minutes: 30,
    discount_type: 'none', discount_value: 0, discount_code: '',
    min_cart_value: 0, description: '',
  });

  const handleCreate = async () => {
    if (!newRule.name.trim()) return;
    await createRule.mutateAsync({
      name: newRule.name, trigger_type: newRule.trigger_type,
      delay_minutes: newRule.delay_minutes,
      discount_type: newRule.discount_type === 'none' ? null : newRule.discount_type,
      discount_value: newRule.discount_value, discount_code: newRule.discount_code || null,
      min_cart_value: newRule.min_cart_value, description: newRule.description || null,
      actions: [{ type: 'send_whatsapp_reminder' }], is_active: true,
    });
    setShowCreate(false);
    setNewRule({ name: '', trigger_type: 'cart_abandoned', delay_minutes: 30, discount_type: 'none', discount_value: 0, discount_code: '', min_cart_value: 0, description: '' });
  };

  return (
    <ShopifyPageShell
      title="Cart Recovery"
      subtitle="Recover abandoned carts and increase conversions"
      icon={ShoppingCart}
      backTo={`/app/integrations/shopify/${storeId}`}
      backLabel="Back to Store"
      isLoading={isLoading}
      maxWidth="2xl"
      actions={
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Rule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Recovery Rule</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Name</Label><Input value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="e.g. High Value Cart Recovery" /></div>
              <div>
                <Label>Trigger</Label>
                <Select value={newRule.trigger_type} onValueChange={v => setNewRule(p => ({ ...p, trigger_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Delay (min)</Label><Input type="number" value={newRule.delay_minutes} onChange={e => setNewRule(p => ({ ...p, delay_minutes: parseInt(e.target.value) || 0 }))} /></div>
                <div><Label>Min Cart Value</Label><Input type="number" value={newRule.min_cart_value} onChange={e => setNewRule(p => ({ ...p, min_cart_value: parseFloat(e.target.value) || 0 }))} /></div>
              </div>
              <div>
                <Label>Discount Offer</Label>
                <Select value={newRule.discount_type} onValueChange={v => setNewRule(p => ({ ...p, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRule.discount_type !== 'none' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Discount Value</Label><Input type="number" value={newRule.discount_value} onChange={e => setNewRule(p => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label>Discount Code</Label><Input value={newRule.discount_code} onChange={e => setNewRule(p => ({ ...p, discount_code: e.target.value }))} placeholder="RECOVER10" /></div>
                </div>
              )}
              <div><Label>Description</Label><Textarea value={newRule.description} onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
              <Button className="w-full" onClick={handleCreate} disabled={!newRule.name.trim() || createRule.isPending}>
                {createRule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <ShopifyStatCard label="Active Rules" value={stats.activeRules} />
        <ShopifyStatCard label="Triggered" value={stats.totalTriggered} />
        <ShopifyStatCard label="Recovered" value={stats.totalRecovered} valueColor="text-green-600" />
        <ShopifyStatCard label="Revenue Recovered" value={`$${stats.revenueRecovered.toFixed(0)}`} icon={DollarSign} iconColor="text-green-500" valueColor="text-green-600" />
        <ShopifyStatCard label="Pending" value={stats.pendingRecoveries} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules">
        <TabsList><TabsTrigger value="rules">Recovery Rules</TabsTrigger><TabsTrigger value="logs">Recovery Logs</TabsTrigger></TabsList>

        <TabsContent value="rules" className="mt-4 space-y-3">
          {rules.length === 0 ? (
            <Card><CardContent className="p-0">
              <ShopifyEmptyState icon={ShoppingCart} title="No recovery rules yet" description="Create your first rule to start recovering abandoned carts."
                action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Create Rule</Button>} />
            </CardContent></Card>
          ) : rules.map(rule => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Switch checked={rule.is_active} onCheckedChange={v => toggleRule.mutate({ id: rule.id, is_active: v })} />
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{rule.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{TRIGGER_TYPES.find(t => t.value === rule.trigger_type)?.label || rule.trigger_type}</Badge>
                        <span className="text-xs text-muted-foreground">{rule.delay_minutes}min delay</span>
                        {rule.discount_type && rule.discount_type !== 'none' && (
                          <Badge variant="outline" className="text-xs">
                            <Percent className="h-3 w-3 mr-1" />
                            {rule.discount_type === 'percentage' ? `${rule.discount_value}% off` : rule.discount_type === 'fixed_amount' ? `$${rule.discount_value} off` : 'Free shipping'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right text-sm hidden sm:block">
                      <p>{rule.stats_triggered} triggered</p>
                      <p className="text-green-600">{rule.stats_recovered} recovered</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRule.mutate(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead><TableHead>Cart Value</TableHead><TableHead>Channel</TableHead>
                    <TableHead>Action</TableHead><TableHead>Status</TableHead><TableHead>Recovered</TableHead><TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No recovery logs yet</TableCell></TableRow>
                  ) : logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm truncate max-w-[150px]">{log.customer_email || log.customer_phone || '—'}</TableCell>
                      <TableCell className="text-sm font-medium">${log.cart_value?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell><Badge variant="secondary" className={`text-xs border-0 ${CHANNEL_COLORS[log.channel || ''] || ''}`}>{log.channel || '—'}</Badge></TableCell>
                      <TableCell className="text-sm">{log.action_taken}</TableCell>
                      <TableCell><Badge variant="secondary" className={`text-xs border-0 ${STATUS_COLORS[log.status] || ''}`}>{log.status}</Badge></TableCell>
                      <TableCell className="text-sm text-green-600 font-medium">{log.recovered_value ? `$${log.recovered_value.toFixed(2)}` : '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </ShopifyPageShell>
  );
}
