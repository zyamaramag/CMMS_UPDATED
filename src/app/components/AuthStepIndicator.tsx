import { Check } from 'lucide-react';

interface AuthStepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { label: 'Sign In' },
  { label: 'MFA' },
  { label: 'Passkey' },
];

export default function AuthStepIndicator({ currentStep }: AuthStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0" aria-label={`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1].label}`}>
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isDone = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-black border-2 transition-colors
                  ${isDone ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-yellow-400 border-yellow-400 text-stone-950' : ''}
                  ${!isDone && !isCurrent ? 'bg-transparent border-stone-600 text-stone-600' : ''}
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span
                className={`text-xs font-mono tracking-widest uppercase
                  ${isCurrent ? 'text-white' : isDone ? 'text-green-400' : 'text-stone-600'}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-px mx-1 mb-4 transition-colors
                  ${isDone ? 'bg-green-500' : 'bg-stone-700'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
