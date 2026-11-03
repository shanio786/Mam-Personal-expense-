'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  /** Optional action button inside the toast (e.g. "Undo"). */
  action?: ToastAction;
}

interface ToastItem extends Required<Pick<ToastOptions, 'message'>> {
  id: number;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, variant = 'success', action }: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant, action }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Stack — sits above the bottom nav on mobile. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card border border-line bg-card px-4 py-3 shadow-lg"
          >
            {t.variant === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-income" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-expense" aria-hidden="true" />
            )}
            <p className="min-w-0 flex-1 break-words text-sm text-ink">{t.message}</p>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded px-1 text-sm font-semibold text-accent hover:text-accent-hover"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-ink-muted transition hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}
