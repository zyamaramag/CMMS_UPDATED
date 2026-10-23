import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MFAVerificationPage from './pages/MFAVerificationPage';
import PasskeyVerificationPage from './pages/PasskeyVerificationPage';
import AccountStatusPage from './pages/AccountStatusPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import InOutPage from './pages/InOutPage';
import UsersPage from './pages/UsersPage';
import UserApprovalsPage from './pages/UserApprovalsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SettingsPage from './pages/SettingsPage';
import MaterialRequestPage from './pages/MaterialRequestPage';
import ApprovalPage from './pages/ApprovalPage';
import MessagesPage from './pages/MessagesPage';
import SecurityCenterPage from './pages/SecurityCenterPage';
import Layout from './components/Layout';
import RootProviders from './components/RootProviders';
import { useAuth, UserRole } from './contexts/AuthContext';

function RequireRole({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

const allRoles: UserRole[] = ['admin', 'staff', 'engineer', 'manager'];

export const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignUpPage />
  },
  {
    path: '/mfa-verification',
    element: <MFAVerificationPage />
  },
  {
    path: '/passkey-verification',
    element: <PasskeyVerificationPage />
  },
  {
    path: '/account-status',
    element: <AccountStatusPage />
  },
  {
    path: '/',
    element: <RequireRole roles={allRoles}><Layout /></RequireRole>,
    children: [
      {
        path: 'dashboard',
        element: <RequireRole roles={allRoles}><DashboardPage /></RequireRole>
      },
      {
        path: 'inventory',
        element: <RequireRole roles={allRoles}><InventoryPage /></RequireRole>
      },
      {
        path: 'requests',
        element: <RequireRole roles={['admin', 'manager']}><MaterialRequestPage /></RequireRole>
      },
      {
        path: 'approvals',
        element: <RequireRole roles={['admin']}><ApprovalPage /></RequireRole>
      },
      {
        path: 'user-approvals',
        element: <RequireRole roles={['admin']}><UserApprovalsPage /></RequireRole>
      },
      {
        path: 'messages',
        element: <RequireRole roles={['engineer', 'manager']}><MessagesPage /></RequireRole>
      },
      {
        path: 'inout',
        element: <RequireRole roles={['admin', 'staff', 'manager']}><InOutPage /></RequireRole>
      },
      {
        path: 'users',
        element: <RequireRole roles={['admin']}><UsersPage /></RequireRole>
      },
      {
        path: 'logs',
        element: <RequireRole roles={['admin', 'staff']}><ActivityLogsPage /></RequireRole>
      },
      {
        path: 'security',
        element: <RequireRole roles={['admin']}><SecurityCenterPage /></RequireRole>
      },
      {
        path: 'settings',
        element: <RequireRole roles={allRoles}><SettingsPage /></RequireRole>
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
  ] // end RootProviders children
  }
]);
