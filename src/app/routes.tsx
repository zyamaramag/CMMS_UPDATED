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
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'inventory',
        element: <InventoryPage />
      },
      {
        path: 'requests',
        element: <MaterialRequestPage />
      },
      {
        path: 'approvals',
        element: <ApprovalPage />
      },
      {
        path: 'user-approvals',
        element: <UserApprovalsPage />
      },
      {
        path: 'messages',
        element: <MessagesPage />
      },
      {
        path: 'inout',
        element: <InOutPage />
      },
      {
        path: 'users',
        element: <UsersPage />
      },
      {
        path: 'logs',
        element: <ActivityLogsPage />
      },
      {
        path: 'security',
        element: <SecurityCenterPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
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