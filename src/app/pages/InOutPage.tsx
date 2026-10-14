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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Transaction } from '../data/mockData';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Printer, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import TransactionReceipt from '../components/TransactionReceipt';

export default function InOutPage() {
  const { user } = useAuth();
  const { materials, transactions, requests, addTransaction, addActivityLog } = useData();
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: 0,
    assignedTo: '',
    notes: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const canManage = user?.role === 'staff'; // Only warehouse staff can manage IN/OUT
  const canView = user?.role === 'admin' || user?.role === 'manager'; // Admin and Manager can only view

  const approvedRequestsForProcessing = requests.filter(r => r.status === 'approved');

  const handleSubmit = (type: 'in' | 'out') => {
    const material = materials.find(m => m.id === formData.materialId);
    if (!material || !user) return;

    addTransaction({
      type,
      materialId: formData.materialId,
      materialName: material.name,
      quantity: formData.quantity,
      date: new Date().toISOString(),
      assignedTo: formData.assignedTo,
      notes: formData.notes,
      performedBy: user.username
    });

    addActivityLog({
      userId: user.id,
      username: user.username,
      role: user.role,
      action: type === 'in' ? 'Material IN' : 'Material OUT',
      timestamp: new Date().toISOString(),
      details: `${type === 'in' ? 'Received' : 'Released'} ${formData.quantity} ${material.unit} of ${material.name}`
    });

    toast.success(`Material ${type === 'in' ? 'IN' : 'OUT'} recorded successfully`);

    // Show receipt for the new transaction
    const newTransaction = transactions[0]; // Get the most recent transaction
    if (newTransaction) {
      setSelectedTransaction(newTransaction);
      setIsReceiptOpen(true);
    }

    setFormData({
      materialId: '',
      quantity: 0,
      assignedTo: '',
      notes: ''
    });
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Material IN/OUT Tracking</h1>
        <p className="text-stone-700 mt-1">Record material movements and track transactions</p>
      </div>

      {canView && !canManage && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have view-only access. Only warehouse staff can record material IN/OUT transactions.
          </AlertDescription>
        </Alert>
      )}

      {!canManage && !canView && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have access to this page. Contact your administrator.
          </AlertDescription>
        </Alert>
      )}

      {canManage && user?.role === 'staff' && approvedRequestsForProcessing.length > 0 && (
        <Card className="bg-green-700 border-green-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Approved Requests Ready for Processing
            </CardTitle>
            <CardDescription className="text-green-100">
              {approvedRequestsForProcessing.length} request(s) approved by Admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedRequestsForProcessing.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{request.materialName}</p>
                      <Badge className="bg-green-600 text-white">{request.id}</Badge>
                    </div>
                    <p className="text-xs text-stone-700 mt-1">{request.purpose}</p>
                    <p className="text-xs text-stone-600 mt-1">
                      Requested by {request.requestedBy} • Needed by {new Date(request.dateNeeded).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-green-700">{request.quantity} {request.unit}</p>
                    <Badge variant="outline" className="text-xs mt-1">Ready</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Material IN Form */}
        <Card className={!canManage ? 'opacity-60 pointer-events-none' : ''}>
          <CardHeader className="bg-blue-950">
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowUpRight className="h-5 w-5" />
              Material IN
            </CardTitle>
            <CardDescription className="text-stone-400">Record incoming materials</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Material</Label>
                <Select
                  value={formData.materialId}
                  onValueChange={(value) => setFormData({ ...formData, materialId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label>Source/Warehouse</Label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g., Warehouse A, Supplier XYZ"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Delivery details, supplier info, etc."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => handleSubmit('in')}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!formData.materialId || !formData.quantity}
              >
                Record Material IN
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Material OUT Form */}
        <Card className={!canManage ? 'opacity-60 pointer-events-none' : ''}>
          <CardHeader className="bg-blue-950">
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowDownRight className="h-5 w-5" />
              Material OUT
            </CardTitle>
            <CardDescription className="text-stone-400">Release materials to projects</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Material</Label>
                <Select
                  value={formData.materialId}
                  onValueChange={(value) => setFormData({ ...formData, materialId: value })}
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
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label>Assigned To (Project/Personnel)</Label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g., Project Site A, John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Purpose, location, special instructions, etc."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => handleSubmit('out')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950"
                disabled={!formData.materialId || !formData.quantity}
              >
                Release Material OUT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Complete record of all material movements</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="in">Material IN</TabsTrigger>
              <TabsTrigger value="out">Material OUT</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionTable transactions={transactions} onPrintReceipt={handlePrintReceipt} />
            </TabsContent>
            <TabsContent value="in">
              <TransactionTable transactions={transactions.filter(t => t.type === 'in')} onPrintReceipt={handlePrintReceipt} />
            </TabsContent>
            <TabsContent value="out">
              <TransactionTable transactions={transactions.filter(t => t.type === 'out')} onPrintReceipt={handlePrintReceipt} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <TransactionReceipt
        transaction={selectedTransaction}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}

function TransactionTable({ transactions, onPrintReceipt }: { transactions: Transaction[]; onPrintReceipt?: (transaction: Transaction) => void }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Assigned To/Source</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === 'in' ? 'default' : 'secondary'}
                  className={transaction.type === 'in' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}
                >
                  <div className="flex items-center gap-1">
                    {transaction.type === 'in' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {transaction.type.toUpperCase()}
                  </div>
                </Badge>
              </TableCell>
              <TableCell>{transaction.materialName}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{transaction.assignedTo}</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
              <TableCell>{transaction.performedBy}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPrintReceipt?.(transaction)}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}