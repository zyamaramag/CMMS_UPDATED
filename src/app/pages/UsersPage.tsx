import PageTransition from '../components/PageTransition';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SystemUser } from '../data/mockData';
import { Plus, Edit, Trash2, ShieldAlert, AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function UsersPage() {
  const { user } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { announce } = useAccessibility();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'engineer' as 'admin' | 'staff' | 'engineer' | 'manager',
    password: ''
  });

  const isAdmin = user?.role === 'admin';
  const filteredUsers = users.filter(systemUser => {
    const query = searchTerm.trim().toLowerCase();
    return !query ||
      systemUser.username.toLowerCase().includes(query) ||
      systemUser.fullName.toLowerCase().includes(query) ||
      systemUser.email.toLowerCase().includes(query) ||
      systemUser.role.toLowerCase().includes(query) ||
      systemUser.status.toLowerCase().includes(query);
  });

  useEffect(() => {
    setSearchTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const voiceState = location.state as {
      voiceOpenAddUser?: boolean;
      voiceEditUserId?: string;
    } | null;
    if ((!voiceState?.voiceOpenAddUser && !voiceState?.voiceEditUserId) || !isAdmin) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    if (voiceState.voiceOpenAddUser) {
      resetForm();
      setIsAddDialogOpen(true);
      announce('New user form opened. Review all account fields before creating the user.');
      return;
    }

    if (voiceState.voiceEditUserId) {
      const selected = users.find(systemUser => systemUser.id === voiceState.voiceEditUserId);
      if (!selected) {
        announce('The voice-selected user is no longer available.', 'assertive');
        return;
      }
      setSelectedUser(selected);
      setFormData({
        username: selected.username,
        email: selected.email,
        fullName: selected.fullName,
        role: selected.role,
        password: '',
      });
      setIsEditDialogOpen(true);
      announce(`Edit form opened for ${selected.fullName}. Review all fields before saving.`);
    }
  }, [announce, isAdmin, location.pathname, location.search, location.state, navigate, users]);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">User Management</h1>
          <p className="text-stone-700 mt-1">Manage system users and permissions</p>
        </div>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Only administrators can manage users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleAdd = () => {
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim() || formData.password.length < 8) {
      toast.error('Complete all fields and use a password with at least 8 characters');
      return;
    }
    if (users.some(existing => existing.username.toLowerCase() === formData.username.trim().toLowerCase() || existing.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      toast.error('A user with that username or email already exists');
      return;
    }
    addUser({
      username: formData.username.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      role: formData.role,
      status: 'active',
      password: formData.password
    });

    toast.success('User created successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedUser) return;

    updateUser(selectedUser.id, {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role
    });

    toast.success('User updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    deleteUser(selectedUser.id);
    toast.success('User deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'staff',
      password: ''
    });
    setSelectedUser(null);
  };

  const openEditDialog = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: SystemUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      case 'engineer':
        return 'default';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500 text-stone-950';
      case 'staff':
        return 'bg-blue-900 text-white';
      case 'engineer':
        return 'bg-green-600 text-white';
      case 'manager':
        return 'bg-stone-700';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">User Management</h1>
          <p className="text-stone-700 mt-1">Manage system users and assign roles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-stone-950 self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-stone-500">
              {users.filter(u => u.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
          <div className="relative max-w-md pt-2">
            <Search className="absolute left-3 top-5 h-4 w-4 text-stone-500" aria-hidden="true" />
            <Label htmlFor="user-search" className="sr-only">Search system users</Label>
            <Input
              id="user-search"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search by name, username, email, role, or status"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label="System users">
            {filteredUsers.map(systemUser => (
              <Card key={systemUser.id} className="border-stone-300 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-stone-600">@{systemUser.username}</div>
                      <h3 className="truncate text-base font-bold text-stone-950">{systemUser.fullName}</h3>
                      <p className="truncate text-sm text-stone-700">{systemUser.email}</p>
                    </div>
                    <Badge variant={systemUser.status === 'active' ? 'default' : 'secondary'}>
                      {systemUser.status}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-3">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Role</dt>
                      <dd className="mt-1">
                        <Badge variant={getRoleBadgeVariant(systemUser.role)} className={getRoleBadgeClass(systemUser.role)}>
                          {systemUser.role.toUpperCase()}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Last Login</dt>
                      <dd className="mt-0.5 text-sm text-stone-800">
                        {new Date(systemUser.lastLogin).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-200 pt-3">
                    <Button variant="outline" onClick={() => openEditDialog(systemUser)}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openDeleteDialog(systemUser)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredUsers.length === 0 && (
              <Alert className="md:col-span-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No users match “{searchTerm}”.</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="hidden rounded-md border overflow-x-auto xl:block">
            <Table aria-label="System users">
              <TableCaption className="sr-only">
                System users with roles, account status, last login, and management actions.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className={getRoleBadgeClass(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          aria-label={`Edit user ${user.fullName}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          aria-label={`Delete user ${user.fullName}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-stone-600">
                      No users match “{searchTerm}”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-user-username">Username</Label>
              <Input
                id="add-user-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-user-full-name">Full Name</Label>
              <Input
                id="add-user-full-name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-user-email">Email</Label>
              <Input
                id="add-user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-user-password">Password</Label>
              <Input
                id="add-user-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label id="add-user-role-label">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'staff' | 'engineer' | 'manager') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger aria-labelledby="add-user-role-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full Access</SelectItem>
                  <SelectItem value="staff">Warehouse Staff - Manage IN/OUT</SelectItem>
                  <SelectItem value="engineer">Engineer - Inventory and Messages</SelectItem>
                  <SelectItem value="manager">Project Manager - Submit Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim() || formData.password.length < 8}
              className="bg-yellow-500 hover:bg-yellow-600 text-stone-950"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-username">Username</Label>
              <Input
                id="edit-user-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-full-name">Full Name</Label>
              <Input
                id="edit-user-full-name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label id="edit-user-role-label">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'staff' | 'engineer' | 'manager') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger aria-labelledby="edit-user-role-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full Access</SelectItem>
                  <SelectItem value="staff">Warehouse Staff - Manage IN/OUT</SelectItem>
                  <SelectItem value="engineer">Engineer - Submit Requests</SelectItem>
                  <SelectItem value="manager">Project Manager - Approve Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-600 text-stone-950">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
