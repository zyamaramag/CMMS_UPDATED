import PageTransition from '../components/PageTransition';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, Send, AlertCircle, CheckCircle, XCircle, Clock, Printer, Edit, Ban, Search } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import RequestApprovalReceipt from '../components/RequestApprovalReceipt';
import { MaterialRequest } from '../data/mockData';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

function defaultNeededDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

export default function MaterialRequestPage() {
  const { user } = useAuth();
  const { materials, requests, addRequest, updatePendingRequest, cancelPendingRequest } = useData();
  const { announce } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: 0,
    purpose: '',
    dateNeeded: defaultNeededDate()
  });
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<MaterialRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<MaterialRequest | null>(null);
  const [editData, setEditData] = useState({ quantity: 0, purpose: '', dateNeeded: '' });
  const [requestSearch, setRequestSearch] = useState(() => searchParams.get('q') ?? '');
  const [requestStatus, setRequestStatus] = useState(() => searchParams.get('status') ?? 'all');

  useEffect(() => {
    const voiceState = location.state as {
      voiceDraft?: { materialId: string; quantity: number; purpose?: string };
      voiceRequestAction?: { action: 'edit' | 'cancel'; requestId: string };
    } | null;
    if ((!voiceState?.voiceDraft && !voiceState?.voiceRequestAction) || user?.role !== 'manager') return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    if (voiceState.voiceDraft) {
      setFormData(current => ({
        ...current,
        materialId: voiceState.voiceDraft!.materialId,
        quantity: voiceState.voiceDraft!.quantity,
        purpose: voiceState.voiceDraft!.purpose ?? current.purpose,
      }));
      announce('Voice request details added. Complete the date and purpose, then review before submitting.');
      return;
    }
    if (voiceState.voiceRequestAction) {
      const request = requests.find(item =>
        item.id === voiceState.voiceRequestAction!.requestId &&
        item.requestedById === user.id &&
        item.status === 'pending'
      );
      if (!request) {
        announce('The selected pending request is no longer available.', 'assertive');
        return;
      }
      if (voiceState.voiceRequestAction.action === 'edit') {
        setRequestToEdit(request);
        setEditData({
          quantity: request.quantity,
          purpose: request.purpose,
          dateNeeded: request.dateNeeded.slice(0, 10),
        });
        announce(`Edit dialog opened for request ${request.id}.`);
      } else {
        setRequestToCancel(request);
        announce(`Cancellation confirmation opened for request ${request.id}.`);
      }
    }
  }, [announce, location.pathname, location.search, location.state, navigate, requests, user]);

  const canSubmit = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const selectedMaterial = materials.find(material => material.id === formData.materialId);

  // Project Managers see only their requests, Admin see all requests
  const userRequests = canSubmit
    ? requests.filter(r => r.requestedById === user?.id)
    : requests;
  const filteredRequests = userRequests.filter(request => {
    const query = requestSearch.trim().toLowerCase();
    const matchesSearch = !query ||
      request.id.toLowerCase().includes(query) ||
      request.materialName.toLowerCase().includes(query) ||
      request.purpose.toLowerCase().includes(query);
    const matchesStatus = requestStatus === 'all' || request.status === requestStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materials.find(m => m.id === formData.materialId);
    if (!material || !user) {
      announce('Request could not be submitted. Select a valid material and sign in again.', 'assertive');
      return;
    }
    if (formData.quantity <= 0) {
      announce('Quantity must be greater than zero.', 'assertive');
      return;
    }
    if (formData.dateNeeded < new Date().toISOString().slice(0, 10)) {
      announce('Date needed cannot be in the past.', 'assertive');
      return;
    }

    addRequest({
      materialId: formData.materialId,
      materialName: material.name,
      quantity: formData.quantity,
      unit: material.unit,
      purpose: formData.purpose,
      dateNeeded: formData.dateNeeded,
      requestedBy: user.fullName,
      requestedById: user.id
    });

    toast.success('Material request submitted successfully');
    announce(`Material request for ${formData.quantity} ${material.unit} of ${material.name} submitted successfully.`);
    setFormData({
      materialId: '',
      quantity: 0,
      purpose: '',
      dateNeeded: defaultNeededDate()
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <Ban className="h-4 w-4 text-stone-600" />;
      case 'issued':
        return <CheckCircle className="h-4 w-4 text-blue-700" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-stone-600 text-white">Cancelled</Badge>;
      case 'issued':
        return <Badge className="bg-blue-800 text-white">Issued</Badge>;
      default:
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
    }
  };

  const handlePrintReceipt = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setIsReceiptOpen(true);
  };

  const openEditRequest = (request: MaterialRequest) => {
    setRequestToEdit(request);
    setEditData({
      quantity: request.quantity,
      purpose: request.purpose,
      dateNeeded: request.dateNeeded.slice(0, 10),
    });
  };

  const handleUpdateRequest = () => {
    if (!requestToEdit || !user) return;
    const updated = updatePendingRequest(requestToEdit.id, user.id, editData);
    if (!updated) {
      const message = 'Only your pending requests with valid details can be edited.';
      toast.error(message);
      announce(message, 'assertive');
      return;
    }
    toast.success(`Request ${requestToEdit.id} updated successfully`);
    announce(`Request ${requestToEdit.id} updated successfully.`);
    setRequestToEdit(null);
  };

  const handleCancelRequest = () => {
    if (!requestToCancel || !user) return;
    const cancelled = cancelPendingRequest(requestToCancel.id, user.id, user.fullName);
    if (!cancelled) {
      const message = 'Only your pending requests can be cancelled.';
      toast.error(message);
      announce(message, 'assertive');
      return;
    }
    toast.success(`Request ${requestToCancel.id} cancelled`);
    announce(`Request ${requestToCancel.id} cancelled.`);
    setRequestToCancel(null);
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Material Requests</h1>
        <p className="text-stone-700 mt-1">Submit and track material requisitions</p>
      </div>

      {!canSubmit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can view material requests but cannot submit new ones. Only Project Managers can submit material requests.
          </AlertDescription>
        </Alert>
      )}

      {canSubmit && (
        <Card>
          <CardHeader className="bg-blue-950">
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Submit Material Request
            </CardTitle>
            <CardDescription className="text-stone-400">Request materials needed for your project</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label id="request-material-label">Material</Label>
                  <Select
                    value={formData.materialId}
                    onValueChange={(value) => setFormData({ ...formData, materialId: value })}
                    required
                  >
                    <SelectTrigger aria-labelledby="request-material-label">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(material => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.quantity} {material.unit} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-quantity">Quantity Needed</Label>
                  <Input
                    id="request-quantity"
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    placeholder="Enter quantity"
                    required
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-date">Date Needed</Label>
                  <Input
                    id="request-date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.dateNeeded}
                    onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-purpose">Purpose / Project Details</Label>
                <Textarea
                  id="request-purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Describe what the materials will be used for..."
                  rows={3}
                  required
                />
              </div>

              {selectedMaterial && formData.quantity > 0 && formData.purpose.trim() && formData.dateNeeded && (
                <div className="border border-stone-300 bg-stone-50 p-4" aria-labelledby="request-summary-title">
                  <h3 id="request-summary-title" className="text-sm font-bold">Request Summary</h3>
                  <p className="mt-2 text-sm text-stone-700">
                    {formData.quantity} {selectedMaterial.unit} of {selectedMaterial.name}, needed by{' '}
                    {new Date(`${formData.dateNeeded}T00:00:00`).toLocaleDateString()}.
                  </p>
                  <p className="mt-1 text-sm text-stone-700">{formData.purpose}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950"
                disabled={!formData.materialId || !formData.quantity || !formData.purpose || !formData.dateNeeded}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{canSubmit ? 'My Material Requests' : 'All Material Requests'}</CardTitle>
          <CardDescription>Track the status of material requisitions</CardDescription>
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
              <Input
                value={requestSearch}
                onChange={event => setRequestSearch(event.target.value)}
                placeholder="Search by request ID, material, or purpose"
                className="pl-10"
                aria-label="Search material requests"
              />
            </div>
            <Select value={requestStatus} onValueChange={setRequestStatus}>
              <SelectTrigger aria-label="Filter material requests by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="sr-only" aria-live="polite">
            {filteredRequests.length} request {filteredRequests.length === 1 ? 'result' : 'results'} found.
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label={canSubmit ? 'My material requests' : 'All material requests'}>
            {filteredRequests.length > 0 ? filteredRequests.map(request => (
              <Card key={request.id} className="border-stone-300 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-stone-600">{request.id}</div>
                      <h3 className="truncate text-base font-bold text-stone-950">{request.materialName}</h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-3">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Quantity</dt>
                      <dd className="mt-0.5 text-sm font-semibold">{request.quantity} {request.unit}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Date Needed</dt>
                      <dd className="mt-0.5 text-sm">{new Date(request.dateNeeded).toLocaleDateString()}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Requested By</dt>
                      <dd className="mt-0.5 text-sm">{request.requestedBy}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Purpose</dt>
                      <dd className="mt-0.5 break-words text-sm text-stone-800">{request.purpose}</dd>
                    </div>
                  </dl>

                  {(request.rejectionReason || request.reviewedBy || request.status === 'cancelled' || request.status === 'issued') && (
                    <div className="mt-3 border-l-4 border-amber-500 bg-stone-50 p-3 text-sm">
                      {request.status === 'rejected' && request.rejectionReason && (
                        <span><strong>Rejection reason:</strong> {request.rejectionReason}</span>
                      )}
                      {request.status === 'approved' && request.reviewedBy && (
                        <span>Approved by {request.reviewedBy}</span>
                      )}
                      {request.status === 'cancelled' && <span>Cancelled by requester</span>}
                      {request.status === 'issued' && (
                        <span>
                          Issued by {request.issuedBy}
                          {request.issueDate ? ` on ${new Date(request.issueDate).toLocaleDateString()}` : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {canSubmit && (
                    <div className="mt-4 border-t border-stone-200 pt-3">
                      {request.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => openEditRequest(request)}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRequestToCancel(request)}
                            className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Ban className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      {(request.status === 'approved' || request.status === 'rejected' || request.status === 'issued') && (
                        <Button variant="outline" className="w-full" onClick={() => handlePrintReceipt(request)}>
                          <Printer className="h-4 w-4" />
                          View Receipt
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              <div className="border border-stone-300 p-6 text-center text-sm text-stone-600">
                No material requests match the current filters.
              </div>
            )}
          </div>

          <div className="hidden rounded-md border overflow-x-auto xl:block">
            <Table aria-label={canSubmit ? 'My material requests' : 'All material requests'}>
              <TableCaption className="sr-only">
                Material requests with quantities, requester, required date, status, and review notes.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Date Needed</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  {canSubmit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.materialName}</TableCell>
                    <TableCell>
                      {request.quantity} {request.unit}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-stone-700 line-clamp-2">{request.purpose}</span>
                    </TableCell>
                    <TableCell>{new Date(request.dateNeeded).toLocaleDateString()}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="text-xs text-red-600 max-w-xs">
                          <strong>Rejection reason:</strong> {request.rejectionReason}
                        </div>
                      )}
                      {request.status === 'approved' && request.reviewedBy && (
                        <div className="text-xs text-green-600">
                          Approved by {request.reviewedBy}
                        </div>
                      )}
                      {request.status === 'cancelled' && (
                        <div className="text-xs text-stone-600">Cancelled by requester</div>
                      )}
                      {request.status === 'issued' && (
                        <div className="text-xs text-blue-800">
                          Issued by {request.issuedBy}
                          {request.issueDate ? ` on ${new Date(request.issueDate).toLocaleDateString()}` : ''}
                        </div>
                      )}
                    </TableCell>
                    {canSubmit && (
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRequest(request)}
                              aria-label={`Edit request ${request.id}`}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRequestToCancel(request)}
                              className="text-red-700 hover:bg-red-50 hover:text-red-800"
                              aria-label={`Cancel request ${request.id}`}
                            >
                              <Ban className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        )}
                        {(request.status === 'approved' || request.status === 'rejected' || request.status === 'issued') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintReceipt(request)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={canSubmit ? 9 : 8} className="py-8 text-center text-stone-600">
                      No material requests match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approval/Rejection Receipt */}
      <RequestApprovalReceipt
        request={selectedRequest}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      <Dialog open={Boolean(requestToEdit)} onOpenChange={open => !open && setRequestToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material Request</DialogTitle>
            <DialogDescription>
              Update pending request {requestToEdit?.id}. Material and unit remain unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-request-quantity">Quantity Needed</Label>
              <Input
                id="edit-request-quantity"
                type="number"
                min={1}
                value={editData.quantity || ''}
                onChange={event => setEditData(current => ({ ...current, quantity: Number(event.target.value) }))}
                aria-invalid={editData.quantity <= 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-request-date">Date Needed</Label>
              <Input
                id="edit-request-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={editData.dateNeeded}
                onChange={event => setEditData(current => ({ ...current, dateNeeded: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-request-purpose">Purpose / Project Details</Label>
              <Textarea
                id="edit-request-purpose"
                value={editData.purpose}
                onChange={event => setEditData(current => ({ ...current, purpose: event.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestToEdit(null)}>Cancel</Button>
            <Button
              onClick={handleUpdateRequest}
              disabled={editData.quantity <= 0 || !editData.purpose.trim() || !editData.dateNeeded}
              className="bg-yellow-500 text-stone-950 hover:bg-yellow-600"
            >
              Save Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(requestToCancel)} onOpenChange={open => !open && setRequestToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel request {requestToCancel?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the request from the pending approval queue. Its history remains available for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageTransition>
  );
}
