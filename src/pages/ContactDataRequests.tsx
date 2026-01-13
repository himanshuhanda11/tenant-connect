import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  UserX,
  Trash2,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DataRequest {
  id: string;
  contact_id: string;
  contact_name: string | null;
  contact_phone: string;
  request_type: 'opt_out' | 'deletion';
  status: 'pending' | 'processing' | 'completed';
  requested_at: string;
  completed_at: string | null;
}

export default function ContactDataRequests() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data requests
      const mockRequests: DataRequest[] = [
        {
          id: '1',
          contact_id: 'c1',
          contact_name: 'John Doe',
          contact_phone: '971501234567',
          request_type: 'opt_out',
          status: 'pending',
          requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
        {
          id: '2',
          contact_id: 'c2',
          contact_name: 'Jane Smith',
          contact_phone: '971509876543',
          request_type: 'deletion',
          status: 'pending',
          requested_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
        {
          id: '3',
          contact_id: 'c3',
          contact_name: 'Ahmed Ali',
          contact_phone: '971507654321',
          request_type: 'opt_out',
          status: 'completed',
          requested_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          contact_id: 'c4',
          contact_name: null,
          contact_phone: '971501111111',
          request_type: 'deletion',
          status: 'completed',
          requested_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load data requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const processRequest = (request: DataRequest) => {
    setSelectedRequest(request);
    setShowProcessDialog(true);
  };

  const confirmProcess = () => {
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: 'completed' as const, completed_at: new Date().toISOString() }
            : r
        )
      );
      toast.success(
        `${selectedRequest.request_type === 'opt_out' ? 'Opt-out' : 'Deletion'} request processed`
      );
    }
    setShowProcessDialog(false);
    setSelectedRequest(null);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const completedRequests = requests.filter((r) => r.status === 'completed');
  const optOutRequests = requests.filter((r) => r.request_type === 'opt_out');
  const deletionRequests = requests.filter((r) => r.request_type === 'deletion');

  const getStatusBadge = (status: DataRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    }
  };

  const RequestTable = ({ data }: { data: DataRequest[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contact</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Completed</TableHead>
          <TableHead className="w-24"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((request) => (
          <TableRow key={request.id}>
            <TableCell>
              <div>
                <p className="font-medium">{request.contact_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  +{request.contact_phone}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={request.request_type === 'deletion' ? 'destructive' : 'secondary'}>
                {request.request_type === 'opt_out' ? (
                  <><UserX className="h-3 w-3 mr-1" /> Opt-Out</>
                ) : (
                  <><Trash2 className="h-3 w-3 mr-1" /> Deletion</>
                )}
              </Badge>
            </TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {request.completed_at
                ? formatDistanceToNow(new Date(request.completed_at), { addSuffix: true })
                : '-'}
            </TableCell>
            <TableCell>
              {request.status === 'pending' && (
                <Button size="sm" onClick={() => processRequest(request)}>
                  Process
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No requests found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Data Requests</h1>
          <p className="text-muted-foreground">
            Manage opt-out and data deletion requests for compliance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950/30">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <UserX className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{optOutRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Opt-Outs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/30">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deletionRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Deletions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  GDPR Compliance
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Data deletion requests must be processed within 30 days as per GDPR requirements.
                  All actions are logged for audit purposes. Ensure you have proper authorization
                  before processing requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>View and process data subject requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <RequestTable data={pendingRequests} />
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <RequestTable data={completedRequests} />
                )}
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <RequestTable data={requests} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Process Dialog */}
      <AlertDialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Process {selectedRequest?.request_type === 'opt_out' ? 'Opt-Out' : 'Deletion'} Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRequest?.request_type === 'opt_out' ? (
                <>
                  This will mark the contact as opted out. They will no longer receive marketing
                  messages. This action is logged for compliance purposes.
                </>
              ) : (
                <>
                  This will permanently delete all data associated with this contact including
                  conversations, messages, and timeline events. This action cannot be undone and
                  is logged for compliance purposes.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmProcess}
              className={
                selectedRequest?.request_type === 'deletion'
                  ? 'bg-destructive text-destructive-foreground'
                  : ''
              }
            >
              {selectedRequest?.request_type === 'opt_out' ? 'Mark Opted Out' : 'Delete Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
