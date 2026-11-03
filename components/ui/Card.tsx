import { cn } from '@/lib/utils';

export interface CardProps {
  title?: React.ReactNode;
  /** Optional element shown in the top-right corner (e.g. a button or link). */
  action?: React.ReactNode;
  className?: string;
  /** Remove the default inner padding (useful for lists that draw their own). */
  noPadding?: boolean;
  children?: React.ReactNode;
}

export default function Card({ title, action, className, noPadding, children }: CardProps) {
  const hasHeader = Boolean(title || action);

  return (
    <section className={cn('rounded-card border border-line bg-card', className)}>
      {hasHeader && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : <span />}
          {action}
        </header>
      )}
      <div className={cn(!noPadding && 'p-4 sm:p-5')}>{children}</div>
    </section>
  );
}
