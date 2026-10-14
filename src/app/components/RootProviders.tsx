import { Outlet } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import SessionWarningModal from './SessionWarningModal';

export default function RootProviders() {
  return (
    <AuthProvider>
      <DataProvider>
        <Outlet />
        <SessionWarningModal />
      </DataProvider>
    </AuthProvider>
  );
}
