import { MaterialRequest } from '../data/mockData';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Printer, X, CheckCircle, XCircle } from 'lucide-react';

interface RequestApprovalReceiptProps {
  request: MaterialRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestApprovalReceipt({ request, isOpen, onClose }: RequestApprovalReceiptProps) {
  if (!request) return null;

  const handlePrint = () => {
    window.print();
  };

  const isApproved = request.status === 'approved' || request.status === 'issued';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Material Request {isApproved ? 'Approval' : 'Rejection'} Receipt</DialogTitle>
        </DialogHeader>

        <div id="approval-receipt-content" className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-stone-950">HVL Engineering Services</h1>
            <p className="text-sm text-stone-700">Construction Materials Management System</p>
            <p className="text-xs text-stone-600 mt-1">Material Request {isApproved ? 'Approval' : 'Rejection'} Notice</p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`flex items-center gap-2 px-6 py-3  ${
              isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isApproved ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <span className="font-bold text-lg">
                {isApproved ? 'REQUEST APPROVED' : 'REQUEST REJECTED'}
              </span>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-700 uppercase">Request ID</p>
              <p className="font-semibold">{request.id}</p>
            </div>
            <div>
              <p className="text-xs text-stone-700 uppercase">Request Date</p>
              <p className="font-semibold">{new Date(request.requestDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-stone-700 uppercase">Requested By</p>
              <p className="font-semibold">{request.requestedBy}</p>
            </div>
            <div>
              <p className="text-xs text-stone-700 uppercase">Date Needed</p>
              <p className="font-semibold">{new Date(request.dateNeeded).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Material Information */}
          <div className="border-t border-b py-4">
            <h3 className="font-semibold text-lg mb-3">Material Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-700 uppercase">Material Name</p>
                <p className="font-medium">{request.materialName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">Material ID</p>
                <p className="font-medium">{request.materialId}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">Quantity Requested</p>
                <p className="font-medium text-lg">{request.quantity} {request.unit}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">Purpose</p>
                <p className="font-medium">{request.purpose}</p>
              </div>
            </div>
          </div>

          {/* Review Information */}
          <div className={`p-4  ${
            isApproved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-semibold mb-3">Review Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-700 uppercase">Reviewed By</p>
                <p className="font-medium">{request.reviewedBy}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">Review Date</p>
                <p className="font-medium">
                  {request.reviewDate ? new Date(request.reviewDate).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            {!isApproved && request.rejectionReason && (
              <div className="mt-4">
                <p className="text-xs text-stone-700 uppercase mb-1">Rejection Reason</p>
                <p className="text-sm bg-white p-3 rounded border border-red-200 text-red-800">
                  {request.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-stone-50 p-4 ">
            <h3 className="font-semibold mb-2">Next Steps</h3>
            {isApproved ? (
              <div className="text-sm text-stone-800 space-y-1">
                <p>✓ This request has been approved by the Project Manager</p>
                <p>✓ Warehouse staff will process your request</p>
                <p>✓ Materials will be prepared for pickup/delivery</p>
                <p>✓ You will be notified when materials are ready</p>
              </div>
            ) : (
              <div className="text-sm text-stone-800 space-y-1">
                <p>✗ This request has been rejected</p>
                <p>• Review the rejection reason above</p>
                <p>• Contact the Project Manager if you have questions</p>
                <p>• You may submit a revised request if appropriate</p>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t">
            <div>
              <div className="border-t-2 border-stone-300 pt-2 mt-12">
                <p className="text-sm font-medium">Project Manager</p>
                <p className="text-xs text-stone-700">{request.reviewedBy}</p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-stone-300 pt-2 mt-12">
                <p className="text-sm font-medium">Acknowledged By</p>
                <p className="text-xs text-stone-700">{request.requestedBy}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-stone-600 pt-4 border-t">
            <p>This is a computer-generated document. No signature is required.</p>
            <p className="mt-1">Printed on: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t print:hidden">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-yellow-500 hover:bg-yellow-600 text-stone-950">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #approval-receipt-content, #approval-receipt-content * {
            visibility: visible;
          }
          #approval-receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Dialog>
  );
}
