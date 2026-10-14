import PageTransition from '../components/PageTransition';
import { useState } from 'react';
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

export default function SettingsPage() {
  const { user } = useAuth();
  const { data, setData } = useData();
  const [systemSettings, setSystemSettings] = useState({
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    sessionTimeout: 30,
    autoBackup: true,
    backupFrequency: 'daily'
  });

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

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    requestUpdates: true,
    lowStockAlerts: true,
    systemAlerts: true
  });

  const isAdmin = user?.role === 'admin';

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordSettings.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordSettings({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSaveSystemSettings = () => {
    toast.success('System settings saved successfully');
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Settings</h1>
        <p className="text-stone-700 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
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
                <Label>Username</Label>
                <Input
                  value={profileSettings.username}
                  disabled
                  className="bg-stone-50"
                />
                <p className="text-xs text-stone-600">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings({ ...profileSettings, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
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
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordSettings.currentPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordSettings.newPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
                <p className="text-xs text-stone-600">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
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
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-stone-700">Receive email updates</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                />
              </div>

              <Separator />

              {user?.role === 'engineer' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Request Updates</Label>
                      <p className="text-xs text-stone-700">Notifications when requests are approved/rejected</p>
                    </div>
                    <Switch
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
                      <Label>Low Stock Alerts</Label>
                      <p className="text-xs text-stone-700">Alerts when inventory is running low</p>
                    </div>
                    <Switch
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })}
                    />
                  </div>
                  <Separator />
                </>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-xs text-stone-700">Important system notifications</p>
                </div>
                <Switch
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
                    <Label>Minimum Password Length</Label>
                    <Input
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
                      <Label>Require Special Characters</Label>
                      <p className="text-xs text-stone-700">Passwords must include symbols (!@#$%)</p>
                    </div>
                    <Switch
                      checked={systemSettings.requireSpecialChars}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, requireSpecialChars: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Numbers</Label>
                      <p className="text-xs text-stone-700">Passwords must include at least one number</p>
                    </div>
                    <Switch
                      checked={systemSettings.requireNumbers}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, requireNumbers: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Session Timeout (minutes)
                  </Label>
                  <Input
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
                    <Label>Enable Automatic Backups</Label>
                    <p className="text-xs text-stone-700">Automatically backup system data</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                  />
                </div>

                {systemSettings.autoBackup && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <select
                        className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings({ ...systemSettings, backupFrequency: e.target.value })}
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Database className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>

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