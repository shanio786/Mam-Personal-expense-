'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional footer area (e.g. action buttons). */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * A responsive modal:
 *  - Mobile: slides up from the bottom as a sheet with a drag handle.
 *  - Desktop: a centered dialog.
 * Closes on backdrop click and Escape, and locks body scroll while open.
 */
export default function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  // Escape to close.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Dialog'}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col bg-card shadow-xl',
          'animate-sheet-up rounded-t-2xl',
          'sm:max-w-md sm:animate-dialog-in sm:rounded-card',
          className,
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
        </div>

        {title && (
          <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-3 sm:pt-5">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 flex h-12 w-12 items-center justify-center rounded-button text-ink-muted transition hover:bg-page hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-1">{children}</div>

        {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
