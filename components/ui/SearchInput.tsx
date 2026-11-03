'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  /** Called with the current text after the debounce delay. */
  onChange: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  /** Debounce delay in milliseconds. */
  delay?: number;
  className?: string;
  'aria-label'?: string;
}

export default function SearchInput({
  onChange,
  placeholder = 'Search',
  defaultValue = '',
  delay = 300,
  className,
  'aria-label': ariaLabel,
}: SearchInputProps) {
  const [text, setText] = useState(defaultValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce changes to text.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      onChangeRef.current(text);
    }, delay);
    return () => window.clearTimeout(handle);
  }, [text, delay]);

  function clear() {
    setText('');
    // Clearing is immediate, not debounced.
    onChangeRef.current('');
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        inputMode="search"
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={cn(
          'h-12 w-full rounded-button border border-line bg-card pl-11 pr-11 text-base text-ink',
          'placeholder:text-ink-muted outline-none transition',
          'focus:border-transparent focus:ring-2 focus:ring-accent',
          // Hide the browser's native search clear control; we provide our own.
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-page hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
