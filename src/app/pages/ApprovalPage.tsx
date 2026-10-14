import PageTransition from '../components/PageTransition';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { MaterialRequest } from '../data/mockData';
import { CheckCircle, XCircle, Clock, ShieldAlert, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import RequestApprovalReceipt from '../components/RequestApprovalReceipt';

export default function ApprovalPage() {
  const { user } = useAuth();
  const { requests, approveRequest, rejectRequest } = useData();
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedRequest, setApprovedRequest] = useState<MaterialRequest | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Request Approval</h1>
          <p className="text-stone-700 mt-1">Review and approve material requests</p>
        </div>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Only Admins can approve material requests.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleApprove = () => {
    if (!selectedRequest || !user) return;

    approveRequest(selectedRequest.id, user.fullName);
    toast.success(`Request ${selectedRequest.id} approved successfully`);
    setIsApproveDialogOpen(false);

    // Show receipt for approved request
    const updatedRequest = {
      ...selectedRequest,
      status: 'approved' as const,
      reviewedBy: user.fullName,
      reviewDate: new Date().toISOString()
    };
    setApprovedRequest(updatedRequest);
    setIsReceiptOpen(true);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest || !user || !rejectionReason.trim()) return;

    rejectRequest(selectedRequest.id, user.fullName, rejectionReason);
    toast.error(`Request ${selectedRequest.id} rejected`);
    setIsRejectDialogOpen(false);

    // Show receipt for rejected request
    const updatedRequest = {
      ...selectedRequest,
      status: 'rejected' as const,
      reviewedBy: user.fullName,
      reviewDate: new Date().toISOString(),
      rejectionReason: rejectionReason
    };
    setApprovedRequest(updatedRequest);
    setIsReceiptOpen(true);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const openApproveDialog = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Request Approval</h1>
        <p className="text-stone-700 mt-1">Review and manage material requisitions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingRequests.length}</div>
            <p className="text-xs text-stone-700 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
            <p className="text-xs text-stone-700 mt-1">Ready for processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
            <p className="text-xs text-stone-700 mt-1">Not approved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Requests</CardTitle>
          <CardDescription>Review and take action on pending requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No pending requests at this time.</AlertDescription>
                </Alert>
              ) : (
                <RequestTable
                  requests={pendingRequests}
                  onApprove={openApproveDialog}
                  onReject={openRejectDialog}
                  showActions
                />
              )}
            </TabsContent>

            <TabsContent value="approved">
              <RequestTable requests={approvedRequests} showActions={false} />
            </TabsContent>

            <TabsContent value="rejected">
              <RequestTable requests={rejectedRequests} showActions={false} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Material Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve request {selectedRequest?.id}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-stone-700">Material:</div>
              <div className="font-medium">{selectedRequest?.materialName}</div>
              <div className="text-stone-700">Quantity:</div>
              <div className="font-medium">{selectedRequest?.quantity} {selectedRequest?.unit}</div>
              <div className="text-stone-700">Requested by:</div>
              <div className="font-medium">{selectedRequest?.requestedBy}</div>
              <div className="text-stone-700">Purpose:</div>
              <div className="font-medium">{selectedRequest?.purpose}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Material Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="text-stone-700">Material:</div>
              <div className="font-medium">{selectedRequest?.materialName}</div>
              <div className="text-stone-700">Quantity:</div>
              <div className="font-medium">{selectedRequest?.quantity} {selectedRequest?.unit}</div>
              <div className="text-stone-700">Requested by:</div>
              <div className="font-medium">{selectedRequest?.requestedBy}</div>
            </div>
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Receipt */}
      <RequestApprovalReceipt
        request={approvedRequest}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}

function RequestTable({
  requests,
  showActions,
  onApprove,
  onReject
}: {
  requests: MaterialRequest[];
  showActions: boolean;
  onApprove?: (request: MaterialRequest) => void;
  onReject?: (request: MaterialRequest) => void;
}) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Date Needed</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id}</TableCell>
              <TableCell>{request.materialName}</TableCell>
              <TableCell>
                {request.quantity} {request.unit}
              </TableCell>
              <TableCell>{request.requestedBy}</TableCell>
              <TableCell>{new Date(request.dateNeeded).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-xs">
                <span className="text-sm text-stone-700 line-clamp-2">{request.purpose}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === 'approved'
                      ? 'default'
                      : request.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className={`flex items-center gap-1 w-fit ${request.status === 'approved' ? 'bg-green-600 text-white' : request.status === 'pending' ? 'bg-red-700 text-white' : ''}`}
                >
                  {request.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                  {request.status === 'rejected' && <XCircle className="h-3 w-3" />}
                  {request.status === 'pending' && <Clock className="h-3 w-3" />}
                  {request.status.toUpperCase()}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove?.(request)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-red-50"
                      onClick={() => onReject?.(request)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}