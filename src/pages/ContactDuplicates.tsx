import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Copy,
  Trash2,
  Merge,
  AlertTriangle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateGroup {
  phone: string;
  contacts: {
    id: string;
    name: string | null;
    wa_id: string;
    created_at: string;
    source: string | null;
  }[];
}

export default function ContactDuplicates() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeGroup, setMergeGroup] = useState<DuplicateGroup | null>(null);

  const fetchDuplicates = useCallback(async () => {
    setLoading(true);
    try {
      // Mock duplicate groups
      const mockDuplicates: DuplicateGroup[] = [
        {
          phone: '971501234567',
          contacts: [
            { id: '1', name: 'John Doe', wa_id: '971501234567', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), source: 'facebook' },
            { id: '2', name: 'John D', wa_id: '971501234567', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), source: 'website' },
          ],
        },
        {
          phone: '971509876543',
          contacts: [
            { id: '3', name: 'Jane Smith', wa_id: '971509876543', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), source: 'manual' },
            { id: '4', name: null, wa_id: '971509876543', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), source: 'qr' },
            { id: '5', name: 'Jane S.', wa_id: '971509876543', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), source: 'api' },
          ],
        },
      ];

      setDuplicates(mockDuplicates);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      toast.error('Failed to load duplicates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);

  const handleMerge = (group: DuplicateGroup) => {
    setMergeGroup(group);
    setShowMergeDialog(true);
  };

  const confirmMerge = () => {
    if (mergeGroup) {
      toast.success(`Merged ${mergeGroup.contacts.length} duplicate contacts`);
      setDuplicates(duplicates.filter((d) => d.phone !== mergeGroup.phone));
    }
    setShowMergeDialog(false);
    setMergeGroup(null);
  };

  const toggleGroup = (phone: string) => {
    setSelectedGroups((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    );
  };

  const mergeSelected = () => {
    toast.success(`Merged ${selectedGroups.length} duplicate groups`);
    setDuplicates(duplicates.filter((d) => !selectedGroups.includes(d.phone)));
    setSelectedGroups([]);
  };

  const totalDuplicates = duplicates.reduce((sum, g) => sum + g.contacts.length - 1, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Duplicate Contacts</h1>
            <p className="text-muted-foreground">
              Find and merge duplicate contacts by phone number
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDuplicates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan for Duplicates
            </Button>
            {selectedGroups.length > 0 && (
              <Button onClick={mergeSelected}>
                <Merge className="h-4 w-4 mr-2" />
                Merge Selected ({selectedGroups.length})
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                  <Copy className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{duplicates.length}</p>
                  <p className="text-sm text-muted-foreground">Duplicate Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/30">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDuplicates}</p>
                  <p className="text-sm text-muted-foreground">Extra Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950/30">
                  <Merge className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDuplicates}</p>
                  <p className="text-sm text-muted-foreground">Contacts to Merge</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Duplicate Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Duplicate Groups</CardTitle>
            <CardDescription>
              Contacts with the same phone number grouped together
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : duplicates.length === 0 ? (
              <div className="text-center py-12">
                <Copy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">No duplicates found</h3>
                <p className="text-muted-foreground">
                  All your contacts have unique phone numbers
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {duplicates.map((group) => (
                  <div key={group.phone} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedGroups.includes(group.phone)}
                          onCheckedChange={() => toggleGroup(group.phone)}
                        />
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">+{group.phone}</span>
                          <Badge variant="secondary">
                            {group.contacts.length} contacts
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleMerge(group)}>
                        <Merge className="h-4 w-4 mr-2" />
                        Merge
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contact</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.contacts.map((contact, idx) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {contact.name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{contact.name || 'Unknown'}</span>
                                {idx === 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Keep
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{contact.source || 'unknown'}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(contact.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Merge Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Duplicate Contacts</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge {mergeGroup?.contacts.length} contacts with phone number +
              {mergeGroup?.phone} into one. The oldest contact will be kept and updated with
              data from newer records. This action is logged for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMerge}>Merge Contacts</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
