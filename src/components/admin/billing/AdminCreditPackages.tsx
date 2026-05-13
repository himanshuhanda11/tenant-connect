import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Pencil, Trash2, Loader2, Package, Star, Crown } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { toast } from "sonner";

interface Pkg {
  id: string;
  package_name: string;
  credits: number;
  price: number;
  currency: string;
  region: "IN" | "GULF" | "OTHER";
  stripe_price_id: string | null;
  recommended: boolean;
  best_value: boolean;
  sort_order: number;
  active: boolean;
}

const REGION_CURRENCY: Record<string, string> = { IN: "INR", GULF: "AED", OTHER: "USD" };

export function AdminCreditPackages() {
  const { get, post } = useAdminApi();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Pkg> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get("credits/packages");
      setPackages(data.packages || []);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setEditing({
    package_name: "", credits: 1000, price: 0, currency: "INR",
    region: "IN", recommended: false, best_value: false, sort_order: 0, active: true,
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.package_name || !editing.credits || editing.price == null) {
      toast.error("Name, credits, and price are required"); return;
    }
    setSaving(true);
    try {
      await post("credits/packages", editing);
      toast.success(editing.id ? "Package updated" : "Package created");
      setEditing(null);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      await post(`credits/packages/${deleteId}/delete`, {});
      toast.success("Package deleted");
      setDeleteId(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const grouped = (["IN", "GULF", "OTHER"] as const).map((r) => ({
    region: r, items: packages.filter((p) => p.region === r),
  }));

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Credit Packages</CardTitle>
          <CardDescription>Top-up packages by region. Used by every workspace's Billing page.</CardDescription>
        </div>
        <Button size="sm" onClick={openNew}><PlusCircle className="h-3.5 w-3.5 mr-1" /> New Package</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : grouped.map(({ region, items }) => (
          <div key={region}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{region}</Badge>
              <span className="text-xs text-muted-foreground">{items.length} packages</span>
            </div>
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Stripe Price ID</TableHead>
                    <TableHead className="text-right">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-4 text-muted-foreground text-xs">No packages for this region</TableCell></TableRow>
                  ) : items.map((p) => (
                    <TableRow key={p.id} className={!p.active ? "opacity-50" : ""}>
                      <TableCell className="text-sm font-medium">{p.package_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.credits.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.currency} {p.price}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {p.recommended && <Badge className="text-[10px] gap-0.5"><Star className="h-2.5 w-2.5" />Reco</Badge>}
                          {p.best_value && <Badge className="text-[10px] gap-0.5 bg-amber-500 hover:bg-amber-500"><Crown className="h-2.5 w-2.5" />Best</Badge>}
                          {!p.active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[160px]">{p.stripe_price_id || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs">{p.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "New"} Credit Package</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label className="text-xs">Package name</Label>
                <Input value={editing.package_name || ""} onChange={(e) => setEditing({ ...editing, package_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Region</Label>
                <Select value={editing.region} onValueChange={(v: any) => setEditing({ ...editing, region: v, currency: REGION_CURRENCY[v] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">India (INR)</SelectItem>
                    <SelectItem value="GULF">Gulf (AED)</SelectItem>
                    <SelectItem value="OTHER">Other (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Currency</Label>
                <Input value={editing.currency || ""} onChange={(e) => setEditing({ ...editing, currency: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label className="text-xs">Credits</Label>
                <Input type="number" value={editing.credits || 0} onChange={(e) => setEditing({ ...editing, credits: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Price</Label>
                <Input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Stripe Price ID (optional)</Label>
                <Input value={editing.stripe_price_id || ""} onChange={(e) => setEditing({ ...editing, stripe_price_id: e.target.value })} placeholder="price_..." />
              </div>
              <div>
                <Label className="text-xs">Sort order</Label>
                <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2"><Switch checked={!!editing.recommended} onCheckedChange={(c) => setEditing({ ...editing, recommended: c })} /><Label className="text-xs">Recommended</Label></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={!!editing.best_value} onCheckedChange={(c) => setEditing({ ...editing, best_value: c })} /><Label className="text-xs">Best Value</Label></div>
              <div className="flex items-center gap-2"><Switch checked={editing.active !== false} onCheckedChange={(c) => setEditing({ ...editing, active: c })} /><Label className="text-xs">Active</Label></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete package?</DialogTitle>
            <DialogDescription>This cannot be undone. Existing transactions are preserved.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
