// =============================================================================
// Expense Manager — database types
//
// TypeScript interfaces mirroring the Supabase/PostgreSQL schema in
// supabase/schema.sql, plus string-union types for every enum-like column.
//
// Conventions:
//   - uuid / date / timestamptz columns are represented as `string`.
//   - numeric / int columns are represented as `number`.
//   - Columns declared NOT NULL are required; every other column is `| null`
//     to reflect that the database allows NULL there.
// =============================================================================

// -----------------------------------------------------------------------------
// Enum-like string unions
// -----------------------------------------------------------------------------
export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'remittance'
  | 'online_order'
  | 'loan_given'
  | 'loan_received';

export type AccountType = 'bank' | 'wallet' | 'cash' | 'card';

export type PersonRole = 'employee' | 'business' | 'supplier' | 'family' | 'other';

export type OrderStatus = 'ordered' | 'shipped' | 'delivered' | 'returned' | 'refunded';

export type RemittanceType = 'employee' | 'business' | 'family' | 'other';

export type RemittanceStatus = 'sent' | 'received' | 'failed';

export type SalaryStatus = 'paid' | 'partial' | 'pending';

export type LoanDirection = 'given' | 'taken';

export type LoanStatus = 'open' | 'closed';

export type RecurringFrequency = 'monthly' | 'weekly';

// -----------------------------------------------------------------------------
// Tables
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  username: string;
  password_hash: string;
  full_name: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: number | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  group_name: string;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  phone: string | null;
  role: PersonRole | null;
  photo_url: string | null;
  monthly_salary: number | null;
  salary_due_day: number | null;
  advance_balance: number | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  exchange_rate: number | null;
  amount_base: number;
  account_id: string | null;
  to_account_id: string | null;
  category_id: string | null;
  person_id: string | null;
  txn_date: string;
  note: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OnlineOrder {
  id: string;
  transaction_id: string;
  store_name: string;
  order_number: string | null;
  item_description: string | null;
  quantity: number | null;
  shipping_cost: number | null;
  order_date: string | null;
  expected_delivery: string | null;
  status: OrderStatus | null;
  tracking_number: string | null;
  refund_amount: number | null;
  order_screenshot_url: string | null;
}

export interface Remittance {
  id: string;
  transaction_id: string;
  recipient_type: RemittanceType;
  person_id: string | null;
  business_name: string | null;
  channel: string | null;
  sent_amount: number | null;
  sent_currency: string | null;
  transfer_fee: number | null;
  exchange_rate: number | null;
  received_pkr: number | null;
  purpose: string;
  reference_number: string | null;
  status: RemittanceStatus | null;
  receipt_url: string | null;
  sent_date: string | null;
  received_date: string | null;
}

export interface SalaryPayment {
  id: string;
  person_id: string;
  transaction_id: string | null;
  month: number;
  year: number;
  gross_amount: number | null;
  advance_deducted: number | null;
  net_paid: number | null;
  status: SalaryStatus | null;
  paid_on: string | null;
}

export interface Loan {
  id: string;
  person_id: string;
  direction: LoanDirection;
  principal: number;
  amount_repaid: number | null;
  start_date: string | null;
  expected_return: string | null;
  status: LoanStatus | null;
  notes: string | null;
}

export interface RecurringRule {
  id: string;
  name: string;
  amount: number | null;
  account_id: string | null;
  category_id: string | null;
  person_id: string | null;
  frequency: RecurringFrequency | null;
  day_of_month: number | null;
  auto_create: boolean | null;
  next_run_date: string | null;
  is_active: boolean | null;
}

export interface Budget {
  id: string;
  category_id: string;
  month: number;
  year: number;
  limit_amount: number;
}

export interface AppSetting {
  key: string;
  value: string | null;
}
