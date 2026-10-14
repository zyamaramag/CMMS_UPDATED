import PageTransition from '../components/PageTransition';
import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  User,
  Briefcase,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserApprovalsPage() {
  const { user } = useAuth();
  const { pendingRegistrations, approvePendingRegistration, rejectPendingRegistration, addUser } = useData();
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComment, setApprovalComment] = useState('');

  const pendingCount = pendingRegistrations.filter(r => r.status === 'pending').length;
  const approvedCount = pendingRegistrations.filter(r => r.status === 'approved').length;
  const rejectedCount = pendingRegistrations.filter(r => r.status === 'rejected').length;

  const handleApprove = () => {
    if (!selectedRegistration || !user) return;

    const registration = pendingRegistrations.find(r => r.id === selectedRegistration);
    if (!registration) return;

    // Approve the registration with optional comment
    approvePendingRegistration(selectedRegistration, user.username, approvalComment.trim() || undefined);

    // Create the actual user account
    addUser({
      username: registration.username,
      password: registration.password,
      fullName: registration.fullName,
      email: registration.email,
      role: registration.role,
      status: 'active'
    });

    toast.success(`Account approved for ${registration.fullName}`);
    setIsApproveDialogOpen(false);
    setSelectedRegistration(null);
    setApprovalComment('');
  };

  const handleReject = () => {
    if (!selectedRegistration || !user || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const registration = pendingRegistrations.find(r => r.id === selectedRegistration);
    if (!registration) return;

    rejectPendingRegistration(selectedRegistration, user.username, rejectionReason);
    toast.success(`Registration rejected for ${registration.fullName}`);
    setIsRejectDialogOpen(false);
    setSelectedRegistration(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-red-500 text-white">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'staff':
        return <Badge className="bg-blue-900 text-white">Warehouse Staff</Badge>;
      case 'engineer':
        return <Badge className="bg-green-600 text-white">Engineer</Badge>;
      case 'manager':
        return <Badge className="bg-stone-700">Project Manager</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">User Registration Approvals</h1>
        <p className="text-stone-700 mt-1">Review and approve new user account requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-stone-700 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-stone-700 mt-1">Accounts created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-stone-700 mt-1">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Registrations */}
      {pendingCount > 0 && (
        <Card className="border-stone-900/20 bg-red-50/50">
          <CardHeader className="bg-blue-950">
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Pending Approvals ({pendingCount})
            </CardTitle>
            <CardDescription className="text-stone-400">
              Review these registration requests and take action
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pendingRegistrations
                .filter(r => r.status === 'pending')
                .map((registration) => (
                  <Card key={registration.id} className="bg-white">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
                              {registration.fullName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{registration.fullName}</h3>
                              <p className="text-sm text-stone-700">@{registration.username}</p>
                            </div>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 text-sm">
                            <div className="flex items-center gap-2 text-stone-700">
                              <Mail className="h-4 w-4" />
                              {registration.email}
                            </div>
                            <div className="flex items-center gap-2 text-stone-700">
                              <Briefcase className="h-4 w-4" />
                              {getRoleBadge(registration.role)}
                            </div>
                            <div className="flex items-center gap-2 text-stone-700">
                              <Calendar className="h-4 w-4" />
                              Requested: {new Date(registration.requestDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(registration.status)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRegistration(registration.id);
                              setIsApproveDialogOpen(true);
                            }}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRegistration(registration.id);
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Registrations History */}
      <Card>
        <CardHeader>
          <CardTitle>Registration History</CardTitle>
          <CardDescription>All registration requests (approved, rejected, and pending)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRegistrations.length === 0 ? (
              <p className="text-center text-stone-600 py-8">No registration requests yet</p>
            ) : (
              pendingRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-stone-700" />
                      <span className="font-medium">{registration.fullName}</span>
                      <span className="text-sm text-stone-700">({registration.username})</span>
                      {getRoleBadge(registration.role)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-700">
                      <span>{registration.email}</span>
                      <span>•</span>
                      <span>{new Date(registration.requestDate).toLocaleString()}</span>
                      {registration.reviewDate && (
                        <>
                          <span>•</span>
                          <span>Reviewed: {new Date(registration.reviewDate).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                    {registration.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                        <p className="text-xs text-red-600">
                          <strong>❌ Rejection Reason:</strong> {registration.rejectionReason}
                        </p>
                      </div>
                    )}
                    {registration.approvalComment && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                        <p className="text-xs text-green-700">
                          <strong>✓ Approval Comment:</strong> {registration.approvalComment}
                        </p>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(registration.status)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              Approve Registration
            </DialogTitle>
            <DialogDescription>
              This will create a new user account and grant system access
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRegistration && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Full Name:</strong> {pendingRegistrations.find(r => r.id === selectedRegistration)?.fullName}</p>
                <p><strong>Username:</strong> {pendingRegistrations.find(r => r.id === selectedRegistration)?.username}</p>
                <p><strong>Email:</strong> {pendingRegistrations.find(r => r.id === selectedRegistration)?.email}</p>
                <p><strong>Role:</strong> <span className="capitalize">{pendingRegistrations.find(r => r.id === selectedRegistration)?.role}</span></p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Approval Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Enter any additional comments for approval..."
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="h-5 w-5" />
              Reject Registration
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this registration request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRejectDialogOpen(false);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
}