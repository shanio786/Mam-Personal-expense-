'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateChipsProps {
  /** Selected date as an ISO day string (yyyy-MM-dd). */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function isoDay(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export default function DateChips({ value, onChange, className }: DateChipsProps) {
  const today = isoDay(new Date());
  const yesterday = isoDay(subDays(new Date(), 1));

  const isToday = value === today;
  const isYesterday = value === yesterday;
  const isCustom = Boolean(value) && !isToday && !isYesterday;

  const [showPicker, setShowPicker] = useState(isCustom);
  const pickActive = showPicker || isCustom;

  const chipBase =
    'min-h-12 flex-none rounded-button border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  function chipClass(active: boolean) {
    return cn(
      chipBase,
      active
        ? 'border-accent bg-accent-tint text-accent'
        : 'border-line bg-card text-ink-soft hover:text-ink',
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          type="button"
          className={chipClass(isToday)}
          aria-pressed={isToday}
          onClick={() => {
            setShowPicker(false);
            onChange(today);
          }}
        >
          Today
        </button>
        <button
          type="button"
          className={chipClass(isYesterday)}
          aria-pressed={isYesterday}
          onClick={() => {
            setShowPicker(false);
            onChange(yesterday);
          }}
        >
          Yesterday
        </button>
        <button
          type="button"
          className={chipClass(pickActive)}
          aria-pressed={pickActive}
          onClick={() => setShowPicker(true)}
        >
          Pick a date
        </button>
      </div>

      {pickActive && (
        <input
          type="date"
          value={isCustom ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'mt-3 h-12 w-full rounded-button border border-line bg-card px-3.5 text-base text-ink',
            'outline-none transition focus:border-transparent focus:ring-2 focus:ring-accent',
          )}
        />
      )}
    </div>
  );
}
