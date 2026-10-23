import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { UserPlus, Lock, Mail, User, Briefcase, CheckCircle, ArrowLeft } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { PasswordStrength, isPasswordValid } from '../components/PasswordStrength';
import { toast } from 'sonner';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { addPendingRegistration, pendingRegistrations, users } = useData();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '' as 'engineer' | 'staff' | 'manager' | ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.role) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      toast.error('Password does not meet security requirements');
      return;
    }

    // Check if username or email already exists
    const existingUser = users.find(u => u.username === formData.username || u.email === formData.email);
    if (existingUser) {
      toast.error('Username or email already exists');
      return;
    }

    // Check if pending registration already exists
    const existingPending = pendingRegistrations.find(
      r => (r.username === formData.username || r.email === formData.email) && r.status === 'pending'
    );
    if (existingPending) {
      toast.error('A registration request with this username or email is already pending');
      return;
    }

    // Submit registration
    addPendingRegistration({
      fullName: formData.fullName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: formData.role
    });

    setSubmitted(true);
    toast.success('Registration request submitted successfully!');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-none border-stone-900/20">
          <CardHeader className="text-center space-y-4 bg-blue-950 text-white rounded-t-lg">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle role="heading" aria-level={1} className="text-2xl">Registration Submitted!</CardTitle>
            <CardDescription className="text-blue-200">
              Your account request is pending approval
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="bg-stone-100 border border-stone-300 rounded-lg p-4 text-sm text-stone-900">
              <p className="font-medium mb-2">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Admin will review your registration request</li>
                <li>You will receive notification once approved</li>
                <li>After approval, you can log in with your credentials</li>
                <li>Multi-Factor Authentication (MFA) will be required on login</li>
              </ol>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-stone-700"><strong>Full Name:</strong> {formData.fullName}</p>
              <p className="text-stone-700"><strong>Email:</strong> {formData.email}</p>
              <p className="text-stone-700"><strong>Username:</strong> {formData.username}</p>
              <p className="text-stone-700"><strong>Requested Role:</strong> <span className="capitalize">{formData.role}</span></p>
            </div>

            <Button
              onClick={() => navigate('/')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-none border-stone-900/20">
        <CardHeader className="space-y-2 bg-blue-950 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-950" />
            </div>
            <div>
              <CardTitle role="heading" aria-level={1} className="text-2xl">Create Account</CardTitle>
              <CardDescription className="text-blue-200">
                HVL Engineering Services - Materials Management System
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Secure Registration Process</p>
                <p className="text-xs">Your account requires admin approval before you can access the system. Multi-Factor Authentication (MFA) will be required on all logins.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@hvleng.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  <User className="h-4 w-4 inline mr-2" />
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="juan.delacruz"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  Select Role *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="staff">Warehouse Staff</SelectItem>
                    <SelectItem value="manager">Project Manager</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-stone-600">Select the role that matches your job position</p>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="h-4 w-4 inline mr-2" />
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              {formData.password && (
                <div className="mt-3">
                  <PasswordStrength password={formData.password} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950 h-12"
                disabled={!isPasswordValid(formData.password) || formData.password !== formData.confirmPassword}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Submit Registration Request
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
