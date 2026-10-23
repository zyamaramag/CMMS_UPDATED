import PageTransition from '../components/PageTransition';
import { useEffect, useRef, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Transaction } from '../data/mockData';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Printer, CheckCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import TransactionReceipt from '../components/TransactionReceipt';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function InOutPage() {
  const { user } = useAuth();
  const { materials, transactions, requests, addTransaction, addActivityLog } = useData();
  const { announce } = useAccessibility();
  const submissionLock = useRef(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionSearch, setTransactionSearch] = useState(() => searchParams.get('q') ?? '');
  const [preparedMovementType, setPreparedMovementType] = useState<'in' | 'out' | null>(null);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: 0,
    assignedTo: '',
    notes: '',
    relatedRequestId: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'staff';
  const canView = user?.role === 'manager';

  const approvedRequestsForProcessing = requests.filter(r => r.status === 'approved');
  const linkedRequest = requests.find(request => request.id === formData.relatedRequestId);
  const filteredTransactions = transactions.filter(transaction => {
    const query = transactionSearch.trim().toLowerCase();
    return !query ||
      transaction.id.toLowerCase().includes(query) ||
      transaction.materialName.toLowerCase().includes(query) ||
      transaction.assignedTo.toLowerCase().includes(query) ||
      transaction.notes.toLowerCase().includes(query);
  });

  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) setTransactionSearch(query);
  }, [searchParams]);

  useEffect(() => {
    const voiceTransactionDraft = (location.state as {
      voiceTransactionDraft?: {
        type: 'in' | 'out';
        materialId: string;
        quantity: number;
        assignedTo: string;
        notes: string;
      };
    } | null)?.voiceTransactionDraft;
    if (!voiceTransactionDraft || !canManage) return;

    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    const material = materials.find(item => item.id === voiceTransactionDraft.materialId);
    if (!material) {
      announce('The voice-selected material is no longer available.', 'assertive');
      return;
    }
    if (voiceTransactionDraft.type === 'out' && voiceTransactionDraft.quantity > material.quantity) {
      announce(`Only ${material.quantity} ${material.unit} are available.`, 'assertive');
      return;
    }
    setFormData({
      materialId: voiceTransactionDraft.materialId,
      quantity: voiceTransactionDraft.quantity,
      assignedTo: voiceTransactionDraft.assignedTo,
      notes: voiceTransactionDraft.notes,
      relatedRequestId: '',
    });
    setPreparedMovementType(voiceTransactionDraft.type);
    announce(
      `${voiceTransactionDraft.type === 'in' ? 'Material IN' : 'Material OUT'} form populated. Review it before recording.`
    );
    window.setTimeout(
      () => document.getElementById(`material-${voiceTransactionDraft.type}-quantity`)?.focus(),
      0
    );
  }, [announce, canManage, location.pathname, location.search, location.state, materials, navigate]);

  const handleSubmit = (type: 'in' | 'out') => {
    const material = materials.find(m => m.id === formData.materialId);
    if (!material || !user || submissionLock.current) return;
    if (preparedMovementType && preparedMovementType !== type) {
      const message = `This voice draft is prepared for Material ${preparedMovementType.toUpperCase()}.`;
      toast.error(message);
      announce(message, 'assertive');
      return;
    }
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      announce('Quantity must be greater than zero.', 'assertive');
      return;
    }
    if (type === 'out' && formData.quantity > material.quantity) {
      const message = `Cannot release ${formData.quantity} ${material.unit}. Only ${material.quantity} are available.`;
      toast.error(message);
      announce(message, 'assertive');
      return;
    }
    submissionLock.current = true;

    try {
      const newTransaction = addTransaction({
        type,
        materialId: formData.materialId,
        materialName: material.name,
        quantity: formData.quantity,
        date: new Date().toISOString(),
        assignedTo: formData.assignedTo,
        notes: formData.notes,
        performedBy: user.username,
        relatedRequestId: formData.relatedRequestId || undefined
      });

      addActivityLog({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: type === 'in' ? 'Material IN' : 'Material OUT',
        timestamp: new Date().toISOString(),
        details: `${type === 'in' ? 'Received' : 'Released'} ${formData.quantity} ${material.unit} of ${material.name}`
      });

      const message = `Material ${type === 'in' ? 'IN' : 'OUT'} recorded successfully`;
      toast.success(message);
      announce(message);

      setSelectedTransaction(newTransaction);
      setIsReceiptOpen(true);

      setFormData({
        materialId: '',
        quantity: 0,
        assignedTo: '',
        notes: '',
        relatedRequestId: ''
      });
      setPreparedMovementType(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The stock movement could not be recorded.';
      toast.error(message);
      announce(message, 'assertive');
    } finally {
      submissionLock.current = false;
    }
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptOpen(true);
  };

  const prepareApprovedRequest = (request: typeof approvedRequestsForProcessing[number]) => {
    setFormData({
      materialId: request.materialId,
      quantity: request.quantity,
      assignedTo: request.requestedBy,
      notes: `${request.id}: ${request.purpose}`,
      relatedRequestId: request.id,
    });
    setPreparedMovementType('out');
    announce(`Approved request ${request.id} loaded into the Material OUT form.`);
    window.setTimeout(() => document.getElementById('material-out-quantity')?.focus(), 0);
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
            You have view-only access. Admin and Warehouse Staff can record material IN/OUT transactions.
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

      {canManage && approvedRequestsForProcessing.length > 0 && (
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
                    <Button
                      size="sm"
                      className="mt-2 bg-yellow-500 text-stone-950 hover:bg-yellow-600"
                      onClick={() => prepareApprovedRequest(request)}
                    >
                      Process
                    </Button>
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
              {preparedMovementType === 'in' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Voice-prepared Material IN draft. Review all fields before recording.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label id="material-in-label">Material</Label>
                <Select
                  value={formData.materialId}
                  onValueChange={(value) => setFormData({ ...formData, materialId: value })}
                >
                  <SelectTrigger aria-labelledby="material-in-label">
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
                <Label htmlFor="material-in-quantity">Quantity</Label>
                <Input
                  id="material-in-quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-in-source">Source/Warehouse</Label>
                <Input
                  id="material-in-source"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g., Warehouse A, Supplier XYZ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-in-notes">Notes</Label>
                <Textarea
                  id="material-in-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Delivery details, supplier info, etc."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => handleSubmit('in')}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!formData.materialId || !formData.quantity || preparedMovementType === 'out'}
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
              {linkedRequest && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Processing approved request {linkedRequest.id}. Material and quantity are locked to the approved values.
                  </AlertDescription>
                </Alert>
              )}
              {preparedMovementType === 'out' && !linkedRequest && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Voice-prepared Material OUT draft. Review all fields before recording.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label id="material-out-label">Material</Label>
                <Select
                  value={formData.materialId}
                  onValueChange={(value) => setFormData({ ...formData, materialId: value })}
                  disabled={Boolean(linkedRequest)}
                >
                  <SelectTrigger aria-labelledby="material-out-label">
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
                <Label htmlFor="material-out-quantity">Quantity</Label>
                <Input
                  id="material-out-quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                  min={1}
                  readOnly={Boolean(linkedRequest)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-out-assignee">Assigned To (Project/Personnel)</Label>
                <Input
                  id="material-out-assignee"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g., Project Site A, John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-out-notes">Notes</Label>
                <Textarea
                  id="material-out-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Purpose, location, special instructions, etc."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => handleSubmit('out')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950"
                disabled={!formData.materialId || !formData.quantity || preparedMovementType === 'in'}
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
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
            <Input
              value={transactionSearch}
              onChange={event => setTransactionSearch(event.target.value)}
              placeholder="Search by material, transaction ID, project, or source"
              className="pl-10"
              aria-label="Search material transactions"
            />
          </div>
          <div className="sr-only" aria-live="polite">
            {filteredTransactions.length} transaction {filteredTransactions.length === 1 ? 'result' : 'results'} found.
          </div>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="in">Material IN</TabsTrigger>
              <TabsTrigger value="out">Material OUT</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionTable transactions={filteredTransactions} onPrintReceipt={handlePrintReceipt} />
            </TabsContent>
            <TabsContent value="in">
              <TransactionTable transactions={filteredTransactions.filter(t => t.type === 'in')} onPrintReceipt={handlePrintReceipt} />
            </TabsContent>
            <TabsContent value="out">
              <TransactionTable transactions={filteredTransactions.filter(t => t.type === 'out')} onPrintReceipt={handlePrintReceipt} />
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
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label="Material transaction history">
        {transactions.length > 0 ? transactions.map(transaction => (
          <Card key={transaction.id} className="border-stone-300 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-stone-600">{transaction.id}</div>
                  <h3 className="truncate text-base font-bold text-stone-950">{transaction.materialName}</h3>
                  {transaction.relatedRequestId && (
                    <Badge variant="outline" className="mt-1 text-xs">{transaction.relatedRequestId}</Badge>
                  )}
                </div>
                <Badge
                  variant={transaction.type === 'in' ? 'default' : 'secondary'}
                  className={transaction.type === 'in'
                    ? 'shrink-0 bg-green-600 text-white'
                    : 'shrink-0 bg-orange-600 text-white'}
                >
                  {transaction.type === 'in' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {transaction.type.toUpperCase()}
                </Badge>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Quantity</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-stone-950">{transaction.quantity}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Performed By</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{transaction.performedBy}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Assigned To / Source</dt>
                  <dd className="mt-0.5 break-words text-sm text-stone-800">{transaction.assignedTo || 'Not specified'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Date</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{new Date(transaction.date).toLocaleString()}</dd>
                </div>
              </dl>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => onPrintReceipt?.(transaction)}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </CardContent>
          </Card>
        )) : (
          <div className="border border-stone-300 p-6 text-center text-sm text-stone-600">
            No material transactions match the current filter.
          </div>
        )}
      </div>

      <div className="hidden rounded-md border overflow-x-auto xl:block">
        <Table aria-label="Material transaction history">
          <TableCaption className="sr-only">
            Material movement records with type, quantity, assignment, date, and operator.
          </TableCaption>
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
            {transactions.length > 0 ? transactions.map((transaction) => (
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
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-stone-600">
                  No material transactions match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
