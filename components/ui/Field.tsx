import { cn } from '@/lib/utils';

export interface FieldShellProps {
  id: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Shared label + helper/error chrome for form controls.
 * The helper line is replaced by the error message (in red) when present.
 */
export default function FieldShell({
  id,
  label,
  required,
  error,
  helperText,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
          {required && (
            <span className="ml-0.5 text-expense" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-expense">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1.5 text-sm text-ink-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control classes (inputs / selects / textarea). */
export function controlClasses(hasError: boolean): string {
  return cn(
    'w-full rounded-button border bg-card px-3.5 text-base text-ink',
    'placeholder:text-ink-muted outline-none transition',
    'focus:border-transparent focus:ring-2 focus:ring-accent',
    'disabled:cursor-not-allowed disabled:opacity-60',
    hasError ? 'border-expense' : 'border-line',
  );
}
