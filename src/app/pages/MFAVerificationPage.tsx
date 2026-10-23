import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Shield, Mail, RefreshCw, ArrowLeft, Clock, Loader2, AlertCircle } from 'lucide-react';
import AuthStepIndicator from '../components/AuthStepIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

export default function MFAVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticatedUser } = useAuth();
  const { addAuthLog, users } = useData();
  
  const pendingUsername = location.state?.username;
  const pendingPassword = location.state?.password;
  const userEmail = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [correctOtp, setCorrectOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!pendingUsername || !pendingPassword) {
      navigate('/');
      return;
    }

    // Generate OTP and log it
    generateOTP();
    
    // Auto-focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [pendingUsername, pendingPassword, navigate]);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCorrectOtp(newOtp);
    setTimeLeft(120);
    
    // Log OTP generation
    addAuthLog({
      username: pendingUsername,
      action: 'mfa_sent',
      details: `OTP Code: ${newOtp} (sent to ${userEmail})`
    });

    // Show OTP in toast for demo purposes
    toast.info(`Demo Mode: Your OTP is ${newOtp}`, { duration: 10000 });
  };

  const handleOtpChange = (index: number, value: string) => {
    // Clear error when user starts typing
    if (error) setError('');

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-jump to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If box already has a digit and user types a new digit, replace and advance
    if (/^\d$/.test(e.key) && otp[index]) {
      e.preventDefault();
      if (error) setError('');
      const newOtp = [...otp];
      newOtp[index] = e.key;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
      return;
    }

    // Handle backspace - move to previous box
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Auto-submit on Enter if all digits filled
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus last input after paste
      inputRefs.current[5]?.focus();
      setFocusedIndex(5);
      
      // Clear error
      if (error) setError('');
      
      toast.success('OTP pasted successfully');
    } else {
      toast.error('Please paste a valid 6-digit code');
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select the content on focus for easy replacement
    inputRefs.current[index]?.select();
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setError('Please fill in all 6 digits before verifying.');
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate verification delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (enteredOtp === correctOtp) {
      // OTP verified successfully
      addAuthLog({
        username: pendingUsername,
        action: 'mfa_verified',
        details: 'MFA verification successful'
      });

      // Check if user is an existing demo user (admin, staff, engineer, manager)
      const existingDemoUsers = ['admin', 'staff', 'engineer', 'manager', 'jdoe', 'msmith'];
      
      if (existingDemoUsers.includes(pendingUsername)) {
        // Redirect to passkey verification for existing users
        toast.success('MFA verified! Please enter your passkey.');
        navigate('/passkey-verification', {
          state: {
            username: pendingUsername,
            password: pendingPassword,
            fullName: location.state?.fullName || pendingUsername
          }
        });
      } else {
        // New users go directly to dashboard
        addAuthLog({
          username: pendingUsername,
          action: 'login_success',
          details: 'User logged in successfully (new user - no passkey required)'
        });

        // Get full user data from DataContext
        const userData = users.find(u => u.username === pendingUsername);
        
        if (userData) {
          // Set the authenticated user with full data
          const authUser = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            fullName: userData.fullName
          };
          
          setAuthenticatedUser(authUser);
          toast.success('Authentication successful!');
          navigate('/dashboard');
        } else {
          toast.error('User data not found. Please contact administrator.');
        }
      }
    } else {
      // OTP verification failed
      addAuthLog({
        username: pendingUsername,
        action: 'mfa_failed',
        details: 'Invalid OTP entered'
      });

      setError('Incorrect code. Double-check the digits or click "Resend Code" to get a fresh one.');
      setIsVerifying(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    }
  };

  const handleResendOTP = () => {
    generateOTP();
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
    toast.success('New OTP sent to your email');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-stone-900 shadow-[4px_4px_0px_0px_#EAB308] overflow-hidden">
        <CardHeader className="space-y-0 p-0 bg-blue-950">
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle role="heading" aria-level={1} className="text-white text-base font-black uppercase tracking-tight">MFA Verification</CardTitle>
              <CardDescription className="text-stone-400 text-xs uppercase tracking-widest font-mono">
                Step 2 — Identity Check
              </CardDescription>
            </div>
          </div>
          <div className="px-6 pb-4 border-t border-stone-700 pt-4">
            <AuthStepIndicator currentStep={2} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Verification Code Sent</p>
              <p className="text-xs">
                A 6-digit verification code has been sent to <strong>{userEmail}</strong>
              </p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label id="otp-label" className="text-sm font-medium text-stone-800">Enter 6-Digit Code</label>
              <span className="text-xs text-stone-600">Paste supported</span>
            </div>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  aria-labelledby="otp-label"
                  aria-label={`Digit ${index + 1} of 6`}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  onFocus={() => handleFocus(index)}
                  className={`
                    w-12 h-14 text-center text-2xl font-bold border-2 transition-all duration-200
                    ${error ? 'border-red-600 bg-red-50' : ''}
                    ${focusedIndex === index && !error ? 'border-stone-900 ring-2 ring-red-500/30 scale-105' : ''}
                    ${digit && !error ? 'border-green-600 bg-green-50' : ''}
                    ${!digit && !error && focusedIndex !== index ? 'border-stone-400' : ''}
                  `}
                  autoFocus={index === 0}
                  disabled={isVerifying}
                />
              ))}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            {/* Success Indicator */}
            {isOtpComplete && !error && !isVerifying && (
              <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Code ready for verification</span>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className={`h-4 w-4 ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-stone-700'}`} />
            <span className={`${timeLeft < 30 ? 'text-red-600 font-semibold' : 'text-stone-700'}`}>
              Code expires in {formatTime(timeLeft)}
            </span>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className={`w-full h-12 transition-all duration-200 font-black uppercase tracking-widest ${isOtpComplete && !error && !isVerifying ? 'bg-yellow-500 hover:bg-yellow-600 text-stone-950' : 'bg-stone-300 text-stone-500'}`}
            disabled={isVerifying || !isOtpComplete || timeLeft === 0}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                {isOtpComplete ? 'Verify & Continue' : 'Enter 6-Digit Code'}
              </>
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              className="text-stone-800 hover:text-stone-900 hover:bg-stone-100"
              disabled={timeLeft > 90}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend Code
            </Button>
            {timeLeft > 90 && (
              <p className="text-xs text-stone-600 mt-1">
                Available in {formatTime(timeLeft - 90)}
              </p>
            )}
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
            <p className="font-semibold text-stone-900">🔒 Security Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This code is valid for 2 minutes</li>
              <li>Each login requires a new verification code</li>
              <li>Never share your OTP with anyone</li>
              <li>All authentication attempts are logged</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
