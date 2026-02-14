import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus, History, TrendingUp, TrendingDown } from 'lucide-react';
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
      toast.success(`Added ${amount} credits to your workspace`);
      invalidate();
      setCustomAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Balance & Top-Up */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Message Credits
              </CardTitle>
              <CardDescription>Credits are used for sending template messages via WhatsApp</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{balance}</p>
              <p className="text-xs text-muted-foreground">Available credits</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Purchased</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                {totalPurchased}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Used</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-destructive" />
                {totalUsed}
              </p>
            </div>
          </div>

          {/* Quick Top-Up */}
          <div>
            <p className="text-sm font-medium mb-2">Quick Top-Up</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleTopUp(amount)}
                  className="min-w-[70px]"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Custom amount..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="max-w-[180px]"
            />
            <Button
              disabled={loading || !customAmount || Number(customAmount) <= 0}
              onClick={() => handleTopUp(Number(customAmount))}
            >
              Add Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Credit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !transactions?.length ? (
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={tx.amount > 0 ? 'default' : 'destructive'} className="text-xs">
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-0.5">Bal: {tx.balance_after}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
