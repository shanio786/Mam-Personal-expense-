import { cn, formatAmount } from '@/lib/utils';

/** The four semantic color intents for a money value. */
export type MoneyType = 'expense' | 'income' | 'transfer' | 'order';

export interface MoneyProps {
  amount: number;
  /** Currency code, e.g. "PKR". Rendered as a prefix. */
  currency: string;
  /** Optional semantic type; applies the matching color. */
  type?: MoneyType;
  className?: string;
}

const TYPE_COLOR: Record<MoneyType, string> = {
  expense: 'text-expense',
  income: 'text-income',
  transfer: 'text-transfer',
  order: 'text-order',
};

/**
 * Renders a currency amount with thousands separators, two decimals, a currency
 * code prefix, the semantic color for its type, and tabular figures.
 */
export default function Money({ amount, currency, type, className }: MoneyProps) {
  return (
    <span
      className={cn('tabular font-semibold', type ? TYPE_COLOR[type] : 'text-ink', className)}
    >
      {currency} {formatAmount(amount)}
    </span>
  );
}
