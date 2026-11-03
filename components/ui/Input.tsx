'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import FieldShell, { controlClasses } from './Field';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, required, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);

  return (
    <FieldShell
      id={inputId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        className={cn(controlClasses(hasError), 'h-12', className)}
        {...props}
      />
    </FieldShell>
  );
});

export default Input;
