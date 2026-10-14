import PageTransition from '../components/PageTransition';
import { useState } from 'react';
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
} from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, Send, AlertCircle, CheckCircle, XCircle, Clock, Printer } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import RequestApprovalReceipt from '../components/RequestApprovalReceipt';
import { MaterialRequest } from '../data/mockData';

export default function MaterialRequestPage() {
  const { user } = useAuth();
  const { materials, requests, addRequest } = useData();
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: 0,
    purpose: '',
    dateNeeded: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const canSubmit = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  // Project Managers see only their requests, Admin see all requests
  const userRequests = canSubmit
    ? requests.filter(r => r.requestedById === user?.id)
    : requests;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materials.find(m => m.id === formData.materialId);
    if (!material || !user) return;

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
    setFormData({
      materialId: '',
      quantity: 0,
      purpose: '',
      dateNeeded: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
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
      default:
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
    }
  };

  const handlePrintReceipt = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setIsReceiptOpen(true);
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
                  <Label>Material</Label>
                  <Select
                    value={formData.materialId}
                    onValueChange={(value) => setFormData({ ...formData, materialId: value })}
                    required
                  >
                    <SelectTrigger>
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
                  <Label>Quantity Needed</Label>
                  <Input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Needed</Label>
                  <Input
                    type="date"
                    value={formData.dateNeeded}
                    onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Purpose / Project Details</Label>
                <Textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Describe what the materials will be used for..."
                  rows={3}
                  required
                />
              </div>

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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
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
                {userRequests.map((request) => (
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
                    </TableCell>
                    {canSubmit && (
                      <TableCell className="text-right">
                        {(request.status === 'approved' || request.status === 'rejected') && (
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
                ))}
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
    </div>
    </PageTransition>
  );
}