import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Key, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import AuthStepIndicator from '../components/AuthStepIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function PasskeyVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticatedUser } = useAuth();
  const { addAuthLog, users } = useData();
  
  const pendingUsername = location.state?.username;
  const pendingPassword = location.state?.password;
  const userFullName = location.state?.fullName;

  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  // Default passkey for demo users (in production, this would be stored securely per user)
  const DEFAULT_PASSKEY = '123456';

  useEffect(() => {
    if (!pendingUsername || !pendingPassword) {
      navigate('/');
      return;
    }

    // Show passkey info
    toast.info(`Demo Mode: Default passkey is ${DEFAULT_PASSKEY}`, { duration: 10000 });
  }, [pendingUsername, pendingPassword, navigate]);

  const handleVerify = () => {
    setError('');

    if (!passkey.trim()) {
      setError('Please enter your 6-digit passkey to continue.');
      return;
    }

    // Verify passkey
    if (passkey === DEFAULT_PASSKEY) {
      // Passkey verified successfully
      addAuthLog({
        username: pendingUsername,
        action: 'login_success',
        details: 'Passkey verification successful - User logged in'
      });

      // Get full user data from DataContext
      const userData = users.find(u => u.username === pendingUsername);
      
      console.log('🔍 DEBUG: Looking for user:', pendingUsername);
      console.log('🔍 DEBUG: Found user data:', userData);
      
      if (userData) {
        // Set the authenticated user with full data
        const authUser = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName
        };
        
        console.log('✅ DEBUG: Setting authenticated user:', authUser);
        
        // Set authenticated user
        setAuthenticatedUser(authUser);
        
        toast.success('Authentication successful! Welcome back.');
        navigate('/dashboard');
      } else {
        console.error('❌ DEBUG: User not found in DataContext');
        setError('User data not found. Please contact administrator.');
      }
    } else {
      // Passkey verification failed
      addAuthLog({
        username: pendingUsername,
        action: 'login_failed',
        details: 'Invalid passkey entered'
      });

      setError('Incorrect passkey. Try again, or use the "Contact Support" link below to request a reset.');
      setPasskey('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-stone-900 shadow-[4px_4px_0px_0px_#EAB308] overflow-hidden">
        <CardHeader className="space-y-0 p-0 bg-blue-950">
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle role="heading" aria-level={1} className="text-white text-base font-black uppercase tracking-tight">Passkey Verification</CardTitle>
              <CardDescription className="text-stone-400 text-xs uppercase tracking-widest font-mono">
                Step 3 — Final Check
              </CardDescription>
            </div>
          </div>
          <div className="px-6 pb-4 border-t border-stone-700 pt-4">
            <AuthStepIndicator currentStep={3} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Welcome Message */}
          <div className="bg-stone-100 border border-stone-300 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-stone-900 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-stone-900">
              <p className="font-semibold mb-1">Welcome back, {userFullName}!</p>
              <p className="text-xs">
                As an existing user, please enter your passkey for additional security verification.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Passkey Input */}
          <div className="space-y-3">
            <Label htmlFor="passkey">
              <Key className="h-4 w-4 inline mr-2" />
              Enter Your Passkey
            </Label>
            <Input
              id="passkey"
              type="password"
              placeholder="Enter 6-digit passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
            <p className="text-xs text-stone-600">
              Enter the 6-digit passkey you set up during registration
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950 h-12"
            disabled={!passkey.trim()}
          >
            <Key className="h-5 w-5 mr-2" />
            Verify Passkey
          </Button>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-stone-700">
              Forgot your passkey?{' '}
              <button
                onClick={() => {
                  toast.info('Please contact your system administrator to reset your passkey');
                }}
                className="text-stone-800 hover:text-stone-900 font-medium underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
              >
                Contact Support
              </button>
            </p>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>

          {/* Security Info */}
          <div className="bg-stone-50 rounded-lg p-4 text-xs text-stone-700 space-y-2">
            <p className="font-semibold text-stone-900">🔒 Passkey Security:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Passkeys provide an extra layer of security</li>
              <li>Your passkey is unique and confidential</li>
              <li>Never share your passkey with anyone</li>
              <li>All verification attempts are logged</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
