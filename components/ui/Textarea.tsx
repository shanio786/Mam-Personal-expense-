'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import FieldShell, { controlClasses } from './Field';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, required, id, className, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hasError = Boolean(error);

  return (
    <FieldShell
      id={textareaId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={
          hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        className={cn(controlClasses(hasError), 'min-h-24 resize-y py-2.5', className)}
        {...props}
      />
    </FieldShell>
  );
});

export default Textarea;
