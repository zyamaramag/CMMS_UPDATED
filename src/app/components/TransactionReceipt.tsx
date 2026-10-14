import { Transaction } from '../data/mockData';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Printer, X } from 'lucide-react';

interface TransactionReceiptProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionReceipt({ transaction, isOpen, onClose }: TransactionReceiptProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-stone-950">HVL Engineering Services</h1>
            <p className="text-sm text-stone-700">Construction Materials Management System</p>
            <p className="text-xs text-stone-600 mt-1">Material {transaction.type === 'in' ? 'Receipt' : 'Release'} Slip</p>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-700 uppercase">Transaction ID</p>
              <p className="font-semibold">{transaction.id}</p>
            </div>
            <div>
              <p className="text-xs text-stone-700 uppercase">Type</p>
              <p className="font-semibold">
                <span className={`px-2 py-1 rounded text-sm ${
                  transaction.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  Material {transaction.type === 'in' ? 'IN' : 'OUT'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-700 uppercase">Date & Time</p>
              <p className="font-semibold">{new Date(transaction.date).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-stone-700 uppercase">Performed By</p>
              <p className="font-semibold">{transaction.performedBy}</p>
            </div>
          </div>

          {/* Material Information */}
          <div className="border-t border-b py-4">
            <h3 className="font-semibold text-lg mb-3">Material Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-700 uppercase">Material Name</p>
                <p className="font-medium">{transaction.materialName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">Material ID</p>
                <p className="font-medium">{transaction.materialId}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">Quantity</p>
                <p className="font-medium text-lg">{transaction.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-stone-700 uppercase">
                  {transaction.type === 'in' ? 'Source/Supplier' : 'Destination/Project'}
                </p>
                <p className="font-medium">{transaction.assignedTo}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div>
              <p className="text-xs text-stone-700 uppercase mb-1">Notes/Remarks</p>
              <p className="text-sm bg-stone-50 p-3 rounded">{transaction.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t">
            <div>
              <div className="border-t-2 border-stone-300 pt-2 mt-12">
                <p className="text-sm font-medium">Prepared By</p>
                <p className="text-xs text-stone-700">{transaction.performedBy}</p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-stone-300 pt-2 mt-12">
                <p className="text-sm font-medium">Received/Released By</p>
                <p className="text-xs text-stone-700">Signature Over Printed Name</p>
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
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
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