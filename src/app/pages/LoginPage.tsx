import PageTransition from '../components/PageTransition';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import AuthStepIndicator from '../components/AuthStepIndicator';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { users } = useData();
  const { addAuthLog } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      addAuthLog({ username, action: 'login_attempt', details: 'User attempting to log in' });
      const user = users.find(u => u.username === username);

      if (!user) {
        setError('No account found with that username. Check for typos or contact an administrator.');
        addAuthLog({ username, action: 'login_failed', details: 'User not found' });
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        setError('Incorrect password. Check that Caps Lock is off and try again.');
        addAuthLog({ username, action: 'login_failed', details: 'Incorrect password' });
        setLoading(false);
        return;
      }

      if (user.status !== 'active') {
        setError('Your account is not active. Please contact an administrator.');
        addAuthLog({ username, action: 'login_failed', details: `Account status: ${user.status}` });
        setLoading(false);
        return;
      }

      toast.info('Credentials verified. Proceeding to MFA verification...');
      navigate('/mfa-verification', {
        state: { username: user.username, password: user.password, email: user.email, fullName: user.fullName }
      });
    } catch {
      setError('Login failed due to a system error. Please refresh the page and try again.');
      addAuthLog({ username, action: 'login_failed', details: 'System error during login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <PageTransition>
        <div className="w-full max-w-md border border-stone-900 bg-white shadow-[4px_4px_0px_0px_#EAB308]">
          {/* Black header */}
          <div className="bg-blue-950 text-white px-6 pt-6 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm leading-none tracking-tight">HVL</span>
              </div>
              <div>
                <div className="text-xs font-mono text-stone-400 tracking-widest uppercase">Engineering Services</div>
                <div className="text-white font-bold text-sm tracking-tight uppercase">Materials Management</div>
              </div>
            </div>
            <div className="border-t border-stone-700 pt-4">
              <AuthStepIndicator currentStep={1} />
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <h1 className="text-xl font-black uppercase tracking-tight text-stone-950 mb-5">Sign In</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="border border-red-600 bg-red-50 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="username" className="block text-xs font-black uppercase tracking-widest text-stone-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-stone-900 bg-stone-50 focus-visible:ring-yellow-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-stone-900 bg-stone-50 pr-11 focus-visible:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(current => !current)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-600 hover:text-stone-950"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950 h-11 font-black uppercase tracking-widest"
                disabled={loading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? 'Verifying...' : 'Sign In'}
              </Button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-stone-300" />
                <span className="text-xs text-stone-500 uppercase tracking-widest font-mono">or</span>
                <div className="h-px flex-1 bg-stone-300" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-stone-900 text-stone-900 hover:bg-stone-100 h-10 font-bold uppercase tracking-widest"
                onClick={() => navigate('/signup')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 h-9 text-xs uppercase tracking-widest"
                onClick={() => navigate('/account-status')}
              >
                Check Registration Status
              </Button>
            </form>
          </div>

          {/* Demo credentials */}
          <div className="border-t border-stone-900 bg-blue-950 px-6 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-stone-500 mb-2">Demo Access</p>
            <div className="grid grid-cols-2 gap-1 text-xs font-mono text-stone-400">
              <span>admin / admin123</span>
              <span>staff / staff123</span>
              <span>engineer / engineer123</span>
              <span>manager / manager123</span>
            </div>
            <div className="mt-2 pt-2 border-t border-stone-700">
              <p className="text-xs font-mono text-stone-400">
                Passkey: <span className="font-bold text-yellow-600">123456</span>
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
