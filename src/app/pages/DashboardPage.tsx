import PageTransition from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CheckCircle,
  Clock,
  Shield,
  X,
  Lightbulb
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

const ROLE_TIPS: Record<string, { title: string; tips: string[] }> = {
  admin: {
    title: "Welcome, Admin! Here's what you can do:",
    tips: [
      'Approve or reject material requests from the Approvals page.',
      'Manage user accounts and approve new registrations under User Management.',
      'Monitor system activity in the Activity Logs and Security Center.',
    ],
  },
  staff: {
    title: "Welcome, Warehouse Staff! Here's what you can do:",
    tips: [
      'Record material IN/OUT transactions from the IN/OUT Tracking page.',
      'View and search inventory levels on the Inventory page.',
      'Check the Activity Logs to review recent transactions.',
    ],
  },
  engineer: {
    title: "Welcome, Engineer! Here's what you can do:",
    tips: [
      'Browse current inventory levels on the Inventory page.',
      'Communicate with project managers via the Messages page.',
      'Use the Dashboard to stay updated on stock alerts.',
    ],
  },
  manager: {
    title: "Welcome, Project Manager! Here's what you can do:",
    tips: [
      'Submit material requests from the Material Requests page.',
      'Track the status of your requests (Pending, Approved, Rejected).',
      'Message engineers directly from the Messages page.',
    ],
  },
};

function OnboardingBanner({ role }: { role: string }) {
  const storageKey = `hvl_onboarding_dismissed_${role}`;
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(storageKey); } catch { return true; }
  });

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
  };

  if (!visible) return null;

  const content = ROLE_TIPS[role];
  if (!content) return null;

  return (
    <div className="border border-stone-900 bg-white p-0 flex gap-0 items-stretch shadow-[2px_2px_0px_0px_#EAB308]">
      <div className="w-1 bg-yellow-500 flex-shrink-0" />
      <div className="flex-1 p-4 flex gap-3 items-start">
        <Lightbulb className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-stone-950 mb-2">{content.title}</p>
          <ul className="space-y-1">
            {content.tips.map((tip, i) => (
              <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5 font-mono">
                <CheckCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
          <button
            onClick={dismiss}
            className="mt-3 text-xs font-black uppercase tracking-widest text-yellow-600 hover:text-yellow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            Dismiss →
          </button>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss onboarding tips"
          className="flex-shrink-0 text-stone-400 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { materials, transactions, activityLogs, requests, pendingRegistrations } = useData();
  const navigate = useNavigate();

  const lowStockItems = materials.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock');
  const totalItems = materials.length;
  const inStockItems = materials.filter(m => m.status === 'In Stock').length;
  const recentTransactions = transactions.slice(0, 5);
  const recentActivity = activityLogs.slice(0, 5);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const pendingUserApprovals = pendingRegistrations.filter(r => r.status === 'pending');

  // Admin Dashboard
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Admin Dashboard</h1>
          <p className="text-stone-700 mt-1">System overview and user management (View-Only for transactions)</p>
        </div>

        <OnboardingBanner role="admin" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer card-hover bg-green-50 border-green-800"
            onClick={() => navigate('/security')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Security</CardTitle>
              <Shield className="h-4 w-4 text-green-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">Secure</div>
              <p className="text-xs text-green-700 mt-1">Click to view details</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-stone-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-stone-700 mt-1">{inStockItems} in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{pendingRequests.length}</div>
              <p className="text-xs text-stone-700 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer card-hover"
            onClick={() => navigate('/user-approvals')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending User Approvals</CardTitle>
              <Users className="h-4 w-4 text-stone-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">
                {pendingUserApprovals.length}
              </div>
              <p className="text-xs text-stone-700 mt-1">Click to review</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system actions by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <Activity className="h-4 w-4 text-stone-700 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.username}</span>
                        <Badge variant="outline" className="text-xs">{log.role}</Badge>
                      </div>
                      <p className="text-xs text-stone-700 mt-0.5">{log.action}</p>
                      <p className="text-xs text-stone-600 mt-0.5">{log.details}</p>
                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-stone-900/20">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-stone-700">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-700">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-stone-600">Min: {item.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest IN/OUT movements (View Only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <div className={`p-2 rounded-full ${transaction.type === 'in' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {transaction.type === 'in' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.materialName}</p>
                      <p className="text-xs text-stone-700">{transaction.notes}</p>
                    </div>
                    <Badge variant={transaction.type === 'in' ? 'default' : 'secondary'}>
                      {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Staff Dashboard
  if (user?.role === 'staff') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Warehouse Staff Dashboard</h1>
          <p className="text-stone-700 mt-1">Material handling and approved requests</p>
        </div>

        <OnboardingBanner role="staff" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-green-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approved Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedRequests.length}</div>
              <p className="text-sm text-green-100 mt-2">Ready for processing</p>
              <Button
                className="w-full bg-white text-green-600 hover:bg-stone-100 mt-4"
                onClick={() => navigate('/requests')}
              >
                View Requests
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-950 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Material IN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-100 mb-4">Record incoming deliveries</p>
              <Button
                className="w-full bg-white text-orange-600 hover:bg-stone-100"
                onClick={() => navigate('/inout')}
              >
                Record Material IN
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-stone-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5" />
                Material OUT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-400 mb-4">Release approved materials</p>
              <Button
                className="w-full bg-white text-stone-800 hover:bg-stone-100"
                onClick={() => navigate('/inout')}
              >
                Release Material OUT
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items that need replenishment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-stone-700">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === 'Out of Stock' ? 'destructive' : 'secondary'}>
                      {item.quantity} {item.unit}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Engineer Dashboard (View-Only)
  if (user?.role === 'engineer') {
    const myRequests = requests.filter(r => r.requestedBy === user.username);
    const myPendingRequests = myRequests.filter(r => r.status === 'pending');
    const myApprovedRequests = myRequests.filter(r => r.status === 'approved');

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Engineer Dashboard</h1>
          <p className="text-stone-700 mt-1">View inventory and communicate with project managers</p>
        </div>

        <OnboardingBanner role="engineer" />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-stone-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">{totalItems}</div>
              <p className="text-xs text-stone-700 mt-1">{inStockItems} in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
              <p className="text-xs text-stone-700 mt-1">May need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-stone-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentActivity.length}</div>
              <p className="text-xs text-stone-700 mt-1">System actions logged</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Inventory</CardTitle>
              <CardDescription>Current material stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {materials.slice(0, 8).map((material) => (
                  <div key={material.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{material.name}</p>
                      <p className="text-xs text-stone-700">{material.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={material.status === 'In Stock' ? 'default' : material.status === 'Low Stock' ? 'secondary' : 'destructive'}>
                        {material.quantity} {material.unit}
                      </Badge>
                      <p className="text-xs text-stone-600 mt-1">{material.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest material movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    {transaction.type === 'in' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{transaction.materialName}</p>
                      <p className="text-xs text-stone-700">
                        {transaction.type === 'in' ? 'Received' : 'Released'}: {transaction.quantity}
                      </p>
                      <p className="text-xs text-stone-600 mt-1">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={transaction.type === 'in' ? 'default' : 'secondary'} className={transaction.type === 'in' ? 'bg-green-600 text-white' : 'bg-red-700 text-white'}>
                      {transaction.type.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Project Manager Dashboard
  if (user?.role === 'manager') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Project Manager Dashboard</h1>
          <p className="text-stone-700 mt-1">View requests and monitor inventory (Read-Only)</p>
        </div>

        <OnboardingBanner role="manager" />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-blue-950 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <p className="text-sm text-orange-100 mt-2">Awaiting admin review</p>
              <Button
                className="w-full bg-white text-orange-600 hover:bg-stone-100 mt-4"
                onClick={() => navigate('/approvals')}
              >
                View Requests
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
              <p className="text-xs text-stone-700 mt-1">Ready for processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <Activity className="h-4 w-4 text-stone-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentTransactions.length}</div>
              <p className="text-xs text-stone-700 mt-1">Latest movements</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/inout')}
              >
                View IN/OUT
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-900">Pending Material Requests</CardTitle>
                  <CardDescription>View-only access - Requests awaiting admin approval</CardDescription>
                </div>
                <Badge className="bg-stone-600 text-white">READ-ONLY</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{request.materialName}</p>
                        <Badge variant="outline" className="text-xs bg-white">{request.id}</Badge>
                        <Badge className="bg-red-500 text-white text-xs">Pending</Badge>
                      </div>
                      <p className="text-xs text-stone-700 mt-1">{request.purpose}</p>
                      <p className="text-xs text-stone-600 mt-1">
                        Requested by {request.requestedBy} • Needed by {new Date(request.dateNeeded).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-orange-700">{request.quantity} {request.unit}</p>
                      <p className="text-xs text-stone-600 mt-1">View Only</p>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <p className="text-sm text-stone-600 text-center py-4">No pending requests</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest IN/OUT movements (View Only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <div className={`p-2 rounded-full ${transaction.type === 'in' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {transaction.type === 'in' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.materialName}</p>
                      <p className="text-xs text-stone-700">{transaction.notes}</p>
                    </div>
                    <Badge variant={transaction.type === 'in' ? 'default' : 'secondary'}>
                      {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                    </Badge>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-sm text-stone-600 text-center py-4">No recent transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Alert className="border-stone-300 bg-stone-100">
          <AlertCircle className="h-4 w-4 text-stone-800" />
          <AlertDescription className="text-stone-950">
            <strong>Note:</strong> As a Project Manager, you have read-only access to pending requests and inventory. 
            Only Admins can approve/reject material requests, and only Warehouse Staff can edit inventory levels.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Default fallback (shouldn't happen with proper auth)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Dashboard</h1>
        <p className="text-stone-700 mt-1">Welcome to HVL Materials Management System</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-stone-700">Please contact your administrator for access.</p>
        </CardContent>
      </Card>
    </div>
  );
}