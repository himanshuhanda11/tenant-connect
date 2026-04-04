import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus, History, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useMessageCredits } from '@/hooks/useMessageCredits';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export function MessageCreditsCard() {
  const { currentTenant } = useTenant();
  const { balance, totalPurchased, totalUsed, transactions, transactionsLoading, invalidate } = useMessageCredits();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (amount: number) => {
    if (!currentTenant?.id || amount <= 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('add_message_credits', {
        p_tenant_id: currentTenant.id,
        p_amount: amount,
      });
      if (error) throw error;
      toast.success(`Added ${amount} credits`);
      invalidate();
      setCustomAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4 text-primary" />
              Message Credits
            </CardTitle>
            <CardDescription className="text-xs">Used for template messages via WhatsApp</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{balance}</p>
            <p className="text-[10px] text-muted-foreground">available</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <p className="text-[10px] text-muted-foreground">Purchased</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />{totalPurchased}
            </p>
          </div>
          <div className="rounded-lg bg-red-500/10 p-2.5">
            <p className="text-[10px] text-muted-foreground">Used</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />{totalUsed}
            </p>
          </div>
        </div>

        {/* Quick Top-Up */}
        <div>
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Quick Top-Up
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_AMOUNTS.map((amount) => (
              <Button key={amount} variant="outline" size="sm" disabled={loading} onClick={() => handleTopUp(amount)} className="h-7 text-xs px-2.5 gap-1">
                <Plus className="h-2.5 w-2.5" />{amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom */}
        <div className="flex gap-2">
          <Input type="number" min={1} placeholder="Custom..." value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="h-8 text-xs max-w-[120px]" />
          <Button size="sm" className="h-8 text-xs" disabled={loading || !customAmount || Number(customAmount) <= 0} onClick={() => handleTopUp(Number(customAmount))}>
            Add
          </Button>
        </div>

        {/* Recent Transactions */}
        {transactions && transactions.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1">
              <History className="h-3 w-3" /> Recent
            </p>
            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 text-xs">
                  <div>
                    <p className="font-medium">{tx.description || tx.type}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, HH:mm')}</p>
                  </div>
                  <Badge variant={tx.amount > 0 ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0 h-4">
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
