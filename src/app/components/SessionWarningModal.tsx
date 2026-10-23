import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';

export default function SessionWarningModal() {
  const { showSessionWarning, sessionWarningCountdown, resetSessionTimeout, logout } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!showSessionWarning) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(
      dialog?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []
    ).filter(element => !element.hasAttribute('disabled'));
    focusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [showSessionWarning]);

  if (!showSessionWarning) return null;

  const minutes = Math.floor(sessionWarningCountdown / 60);
  const seconds = sessionWarningCountdown % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = sessionWarningCountdown <= 30;
  const pct = (sessionWarningCountdown / 120) * 100;

  const handleExtend = () => resetSessionTimeout();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div ref={dialogRef} className="bg-white border border-stone-900 shadow-[4px_4px_0px_0px_#EAB308] w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-5 pt-5 pb-4 border-b border-stone-200 ${isUrgent ? 'bg-yellow-400' : 'bg-blue-950'}`}>
          <div className="flex items-center gap-3">
            <Clock className={`w-5 h-5 ${isUrgent ? 'text-stone-950 animate-pulse' : 'text-blue-300'}`} />
            <h2
              id="session-warning-title"
              className={`text-sm font-black uppercase tracking-widest ${isUrgent ? 'text-stone-950' : 'text-white'}`}
            >
              {isUrgent ? 'Session Expiring Now' : 'Session Expiring Soon'}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p id="session-warning-desc" className="text-xs text-stone-600 font-mono uppercase tracking-widest">
            Inactivity detected — session expires in:
          </p>

          <div
            aria-live={isUrgent ? 'assertive' : 'polite'}
            aria-label={`${sessionWarningCountdown} seconds remaining`}
            className={`text-6xl font-black tabular-nums tracking-tight ${isUrgent ? 'text-yellow-600' : 'text-blue-950'}`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {timeDisplay}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200 h-1.5 border border-stone-300">
            <div
              role="progressbar"
              aria-label="Time remaining"
              aria-valuemin={0}
              aria-valuemax={120}
              aria-valuenow={sessionWarningCountdown}
              className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-yellow-500' : 'bg-blue-900'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-xs text-stone-500 font-mono">
            Unsaved work will be lost if the session expires.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2 border-t border-stone-200 pt-4">
          <Button
            onClick={handleExtend}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-stone-950 h-10 font-black uppercase tracking-widest"
            autoFocus
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Stay Logged In
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-9 border-stone-900 text-stone-700 hover:bg-stone-100 font-bold uppercase tracking-widest text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Log Out Now
          </Button>
        </div>
      </div>
    </div>
  );
}
