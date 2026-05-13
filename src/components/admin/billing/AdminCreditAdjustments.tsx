import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PlusCircle, MinusCircle, Loader2, History, Wallet, Building2 } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { toast } from "sonner";
import { format } from "date-fns";

interface Wallet {
  tenant_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  last_topup_at: string | null;
  tenants: { name: string; slug: string; pricing_region: string } | null;
}

interface Tx {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  description: string | null;
  status: string;
  created_at: string;
  metadata?: { category?: string } | null;
}

const CATEGORY_OPTIONS = [
  { value: "bonus", label: "Bonus", desc: "Goodwill / loyalty grant" },
  { value: "promo", label: "Promotional", desc: "Marketing campaign credits" },
  { value: "refund", label: "Refund", desc: "Compensation for failed broadcast / outage" },
  { value: "meta_paid", label: "Meta-paid Allocation", desc: "Customer paid Meta directly" },
  { value: "adjustment", label: "Manual Adjustment", desc: "Other / corrections" },
] as const;

export function AdminCreditAdjustments() {
  const { get, post } = useAdminApi();
  const [search, setSearch] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Wallet | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<string>("bonus");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get(`credits/wallets${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      setWallets(data.wallets || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openHistory = async (w: Wallet) => {
    setSelected(w);
    setHistoryOpen(true);
    try {
      const data = await get(`credits/transactions?workspace_id=${w.tenant_id}`);
      setTxs(data.transactions || []);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openAdjust = (w: Wallet, dir: "credit" | "debit") => {
    setSelected(w);
    setDirection(dir);
    setAmount(100);
    setReason("");
    setAdjustOpen(true);
  };

  const submitAdjust = async () => {
    if (!selected) return;
    if (!amount || amount <= 0) { toast.error("Amount must be positive"); return; }
    if (reason.trim().length < 3) { toast.error("Reason is required (min 3 chars)"); return; }
    setSubmitting(true);
    try {
      const signed = direction === "credit" ? amount : -amount;
      await post("credits/adjust", { workspace_id: selected.tenant_id, amount: signed, reason });
      toast.success(`Adjusted ${signed > 0 ? "+" : ""}${signed} credits for ${selected.tenants?.name}`);
      setAdjustOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" /> Workspace Credit Wallets</CardTitle>
        <CardDescription>Credit or debit any workspace's message-credit wallet. All actions are audited.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workspace name or slug" className="pl-8" onKeyDown={(e) => e.key === "Enter" && load()} />
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Purchased</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-4 w-4 animate-spin inline" /></TableCell></TableRow>
              ) : wallets.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No wallets found</TableCell></TableRow>
              ) : wallets.map((w) => (
                <TableRow key={w.tenant_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{w.tenants?.name || w.tenant_id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">{w.tenants?.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{w.tenants?.pricing_region || "OTHER"}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{w.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{w.total_purchased.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{w.total_used.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openAdjust(w, "credit")}>
                        <PlusCircle className="h-3 w-3" /> Credit
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openAdjust(w, "debit")}>
                        <MinusCircle className="h-3 w-3" /> Debit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => openHistory(w)}>
                        <History className="h-3 w-3" /> Log
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Adjust dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {direction === "credit" ? <PlusCircle className="h-4 w-4 text-emerald-600" /> : <MinusCircle className="h-4 w-4 text-rose-600" />}
              {direction === "credit" ? "Credit" : "Debit"} Workspace
            </DialogTitle>
            <DialogDescription>{selected?.tenants?.name} · current balance: {selected?.balance.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Amount (credits)</Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-xs">Reason (audited)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Promotional grant, Refund for failed broadcast, Manual chargeback" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={submitAdjust} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Confirm {direction === "credit" ? "Credit" : "Debit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Log — {selected?.tenants?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">No transactions</TableCell></TableRow>
                ) : txs.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{format(new Date(t.created_at), "MMM d, HH:mm")}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] capitalize">{t.type}</Badge></TableCell>
                    <TableCell className={`text-right tabular-nums text-xs font-medium ${t.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{t.balance_after}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[260px]">{t.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
