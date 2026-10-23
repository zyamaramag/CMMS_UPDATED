import PageTransition from '../components/PageTransition';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Settings, Shield, Clock, Database, User, Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

function loadStoredSettings<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const { user, setAuthenticatedUser } = useAuth();
  const { users, updateUser, resetPrototypeData } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const validRequestedTab =
    requestedTab === 'password' ||
    requestedTab === 'notifications' ||
    requestedTab === 'profile' ||
    (requestedTab === 'system' && user?.role === 'admin')
      ? requestedTab
      : 'profile';
  const [activeTab, setActiveTab] = useState(validRequestedTab);

  useEffect(() => {
    setActiveTab(validRequestedTab);
  }, [validRequestedTab]);
  const [systemSettings, setSystemSettings] = useState(() => loadStoredSettings('hvl-system-settings', {
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    sessionTimeout: 30,
    autoBackup: true,
    backupFrequency: 'daily'
  }));

  const [profileSettings, setProfileSettings] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState(() => loadStoredSettings('hvl-notification-settings', {
    emailNotifications: true,
    requestUpdates: true,
    lowStockAlerts: true,
    systemAlerts: true
  }));

  const isAdmin = user?.role === 'admin';

  const handleSaveProfile = () => {
    if (!user || !profileSettings.fullName.trim() || !profileSettings.email.trim()) {
      toast.error('Full name and email address are required');
      return;
    }
    updateUser(user.id, {
      fullName: profileSettings.fullName.trim(),
      email: profileSettings.email.trim(),
    });
    setAuthenticatedUser({
      ...user,
      fullName: profileSettings.fullName.trim(),
      email: profileSettings.email.trim(),
    });
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    const currentUser = users.find(item => item.id === user?.id);
    if (!currentUser || currentUser.password !== passwordSettings.currentPassword) {
      toast.error('Current password is incorrect');
      return;
    }
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordSettings.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    updateUser(currentUser.id, { password: passwordSettings.newPassword });
    toast.success('Password changed successfully for this prototype session');
    setPasswordSettings({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSaveNotifications = () => {
    try {
      window.localStorage.setItem('hvl-notification-settings', JSON.stringify(notificationSettings));
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Notification preferences could not be saved in this browser');
    }
  };

  const handleSaveSystemSettings = () => {
    try {
      window.localStorage.setItem('hvl-system-settings', JSON.stringify(systemSettings));
      toast.success('System settings saved successfully');
    } catch {
      toast.error('System settings could not be saved in this browser');
    }
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Settings</h1>
        <p className="text-stone-700 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setSearchParams(value === 'profile' ? {} : { tab: value }, { replace: true });
        }}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-username">Username</Label>
                <Input
                  id="profile-username"
                  value={profileSettings.username}
                  disabled
                  className="bg-stone-50"
                />
                <p className="text-xs text-stone-600">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-full-name">Full Name</Label>
                <Input
                  id="profile-full-name"
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings({ ...profileSettings, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-role">Role</Label>
                <Input
                  id="profile-role"
                  value={user?.role?.toUpperCase() ?? ''}
                  disabled
                  className="bg-stone-50"
                />
                <p className="text-xs text-stone-600">Contact admin to change your role</p>
              </div>

              <Separator />

              <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 text-white">
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Settings */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-yellow-600" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordSettings.currentPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordSettings.newPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
                <p className="text-xs text-stone-600">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordSettings.confirmPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                />
              </div>

              <Separator />

              <Button
                onClick={handleChangePassword}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!passwordSettings.currentPassword || !passwordSettings.newPassword || !passwordSettings.confirmPassword}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-stone-700">Receive email updates</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                />
              </div>

              <Separator />

              {user?.role === 'engineer' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="request-updates">Request Updates</Label>
                      <p className="text-xs text-stone-700">Notifications when requests are approved/rejected</p>
                    </div>
                    <Switch
                      id="request-updates"
                      checked={notificationSettings.requestUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, requestUpdates: checked })}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {(user?.role === 'staff' || user?.role === 'manager' || user?.role === 'admin') && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                      <p className="text-xs text-stone-700">Alerts when inventory is running low</p>
                    </div>
                    <Switch
                      id="low-stock-alerts"
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })}
                    />
                  </div>
                  <Separator />
                </>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-alerts">System Alerts</Label>
                  <p className="text-xs text-stone-700">Important system notifications</p>
                </div>
                <Switch
                  id="system-alerts"
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
                />
              </div>

              <Separator />

              <Button onClick={handleSaveNotifications} className="bg-green-600 hover:bg-green-700 text-white">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings (Admin Only) */}
        {isAdmin && (
          <TabsContent value="system" className="space-y-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure password policies and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum-password-length">Minimum Password Length</Label>
                    <Input
                      id="minimum-password-length"
                      type="number"
                      value={systemSettings.minPasswordLength}
                      onChange={(e) => setSystemSettings({ ...systemSettings, minPasswordLength: Number(e.target.value) })}
                      min={6}
                      max={20}
                    />
                    <p className="text-xs text-stone-700">Minimum number of characters required for passwords</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-special-characters">Require Special Characters</Label>
                      <p className="text-xs text-stone-700">Passwords must include symbols (!@#$%)</p>
                    </div>
                    <Switch
                      id="require-special-characters"
                      checked={systemSettings.requireSpecialChars}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, requireSpecialChars: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-numbers">Require Numbers</Label>
                      <p className="text-xs text-stone-700">Passwords must include at least one number</p>
                    </div>
                    <Switch
                      id="require-numbers"
                      checked={systemSettings.requireNumbers}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, requireNumbers: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="session-timeout" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: Number(e.target.value) })}
                    min={5}
                    max={120}
                  />
                  <p className="text-xs text-stone-700">Automatically log out users after this period of inactivity</p>
                </div>
              </CardContent>
            </Card>

            {/* Backup & Restore */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-yellow-600" />
                  Backup & Restore
                </CardTitle>
                <CardDescription>Configure automatic backups and data recovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="automatic-backups">Enable Automatic Backups</Label>
                    <p className="text-xs text-stone-700">Automatically backup system data</p>
                  </div>
                  <Switch
                    id="automatic-backups"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                  />
                </div>

                {systemSettings.autoBackup && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label id="backup-frequency-label">Backup Frequency</Label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={value => setSystemSettings({ ...systemSettings, backupFrequency: value })}
                      >
                        <SelectTrigger aria-labelledby="backup-frequency-label">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" disabled title="Requires a connected backend">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                  <Button variant="outline" className="flex-1" disabled title="Requires a connected backend">
                    <Database className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Reset to Sample Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset all prototype data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This replaces saved inventory, requests, transactions, users, messages, and logs with the original sample records. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          resetPrototypeData();
                          toast.success('Prototype data reset successfully');
                        }}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Reset Sample Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded">
                  Last backup: April 19, 2026 at 6:00 AM
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-yellow-600" />
                  System Information
                </CardTitle>
                <CardDescription>Application details and version information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-stone-700">System Name</Label>
                    <p className="text-sm font-medium">HVL Materials Management</p>
                  </div>
                  <div>
                    <Label className="text-xs text-stone-700">Version</Label>
                    <p className="text-sm font-medium">1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-xs text-stone-700">Database</Label>
                    <p className="text-sm font-medium">Mock Data (Frontend)</p>
                  </div>
                  <div>
                    <Label className="text-xs text-stone-700">Environment</Label>
                    <p className="text-sm font-medium">Development</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSystemSettings} className="bg-green-600 hover:bg-green-700 text-white">
                <Settings className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
    </PageTransition>
  );
}
