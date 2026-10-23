import PageTransition from '../components/PageTransition';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
import { Search, Activity } from 'lucide-react';

export default function ActivityLogsPage() {
  const { activityLogs } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    setSearchTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  // Filter logs based on user role
  const roleBasedLogs = activityLogs.filter(log => {
    // Warehouse staff can only see IN/OUT transaction logs
    if (user?.role === 'staff') {
      return log.action === 'Material IN' || log.action === 'Material OUT';
    }
    // Admin can see all logs
    return true;
  });

  const filteredLogs = roleBasedLogs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesRole && matchesAction;
  });

  const uniqueActions = Array.from(new Set(roleBasedLogs.map(l => l.action)));

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Activity Logs</h1>
        <p className="text-stone-700 mt-1">
          {user?.role === 'staff' 
            ? 'Monitor material IN/OUT transactions' 
            : 'Monitor all user actions and system events'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'staff' ? "Today's Transactions" : "Today's Activity"}
            </CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {roleBasedLogs.filter(l => {
                const logDate = new Date(l.timestamp);
                const today = new Date();
                return logDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-stone-700 mt-1">
              {user?.role === 'staff' ? 'Transactions today' : 'Actions performed today'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'staff' ? 'Transaction History' : 'System Activity Log'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'staff' 
              ? 'Material IN/OUT transaction records' 
              : 'Detailed audit trail of all system actions'}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-500" />
                <Input
                  aria-label="Search activity logs"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter activity logs by role">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter activity logs by action">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label="System activity log">
            {filteredLogs.length > 0 ? filteredLogs.map(log => (
              <Card key={log.id} className="border-stone-300 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-stone-600">{log.id}</div>
                      <h3 className="truncate text-base font-bold text-stone-950">{log.action}</h3>
                    </div>
                    <Badge variant={getRoleBadgeVariant(log.role)}>{log.role}</Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-3">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">User</dt>
                      <dd className="mt-0.5 text-sm font-semibold">{log.username}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Timestamp</dt>
                      <dd className="mt-0.5 text-sm">{new Date(log.timestamp).toLocaleString()}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Details</dt>
                      <dd className="mt-0.5 break-words text-sm text-stone-800">{log.details}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )) : (
              <div className="border border-stone-300 p-6 text-center text-sm text-stone-600">
                {user?.role === 'staff' ? 'No IN/OUT transactions recorded yet' : 'No activity logs found'}
              </div>
            )}
          </div>

          <div className="hidden rounded-md border overflow-x-auto xl:block">
            <Table aria-label="System activity log">
              <TableCaption className="sr-only">
                Audit history with timestamp, user, role, action, and details.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.username}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(log.role)}>
                          {log.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <span className="text-sm text-stone-700">{log.details}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-stone-600">
                      {user?.role === 'staff' 
                        ? 'No IN/OUT transactions recorded yet' 
                        : 'No activity logs found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
