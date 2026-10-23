import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type Politeness = 'polite' | 'assertive';

interface AccessibilityContextValue {
  announce: (message: string, politeness?: Politeness) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  announce: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const setter = politeness === 'assertive' ? setAssertiveMessage : setPoliteMessage;
    setter('');
    window.setTimeout(() => setter(message), 20);
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
