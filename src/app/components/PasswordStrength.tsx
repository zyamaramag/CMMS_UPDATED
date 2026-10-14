import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    { label: 'At least 12 characters', test: password.length >= 12 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /[0-9]/.test(password) },
    { label: 'Contains special character', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const metRequirements = requirements.filter(r => r.test).length;
  const strength = metRequirements === 0 ? 0 : (metRequirements / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength === 100) return 'bg-green-500';
    if (strength >= 60) return 'bg-red-500';
    if (strength >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (strength === 100) return 'Strong';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Fair';
    if (strength > 0) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-700 font-medium">Password Strength</span>
          <span className={`font-semibold ${
            strength === 100 ? 'text-green-600' :
            strength >= 60 ? 'text-red-600' :
            strength >= 40 ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="h-2 bg-stone-200 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2 text-xs">
        {requirements.map((req, index) => (
          <div key={index} className={`flex items-center gap-2 ${req.test ? 'text-green-600' : 'text-stone-600'}`}>
            {req.test ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}
