import { Outlet } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import SessionWarningModal from './SessionWarningModal';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';

export default function RootProviders() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <DataProvider>
          <Outlet />
          <SessionWarningModal />
        </DataProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
