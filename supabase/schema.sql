-- =============================================================================
-- Expense Manager — database schema (Supabase / PostgreSQL)
--
-- Single-user application: there is exactly one account in `users`.
-- No roles, no multi-user, no sharing.
--
-- This file is idempotent: re-running it is safe. Tables use
-- CREATE TABLE IF NOT EXISTS, indexes use CREATE INDEX IF NOT EXISTS, and the
-- updated_at trigger is dropped and recreated each run.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto (also built into PostgreSQL 13+).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- users  (single account only)
-- -----------------------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  full_name     text,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- accounts
-- -----------------------------------------------------------------------------
create table if not exists accounts (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null,
  currency        text not null default 'PKR',
  opening_balance numeric(14,2) default 0,
  icon            text,
  color           text,
  sort_order      int default 0,
  is_active       boolean default true,
  created_at      timestamptz not null default now(),
  constraint accounts_type_check check (type in ('bank', 'wallet', 'cash', 'card'))
);

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  group_name text not null,
  icon       text,
  color      text,
  sort_order int default 0,
  is_active  boolean default true,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- people
-- -----------------------------------------------------------------------------
create table if not exists people (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text,
  role            text,
  photo_url       text,
  monthly_salary  numeric(14,2),
  salary_due_day  int,
  advance_balance numeric(14,2) default 0,
  notes           text,
  is_active       boolean default true,
  created_at      timestamptz not null default now(),
  constraint people_role_check check (role in ('employee', 'business', 'supplier', 'family', 'other')),
  constraint people_salary_due_day_check check (salary_due_day between 1 and 31)
);

-- -----------------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------------
create table if not exists transactions (
  id            uuid primary key default gen_random_uuid(),
  type          text not null,
  amount        numeric(14,2) not null,
  currency      text not null default 'PKR',
  exchange_rate numeric(14,6) default 1,
  amount_base   numeric(14,2) not null,
  account_id    uuid references accounts(id),
  to_account_id uuid references accounts(id),
  category_id   uuid references categories(id),
  person_id     uuid references people(id),
  txn_date      date not null,
  note          text,
  receipt_url   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint transactions_type_check check (
    type in ('expense', 'income', 'transfer', 'remittance', 'online_order', 'loan_given', 'loan_received')
  ),
  constraint transactions_amount_check check (amount > 0)
);

-- -----------------------------------------------------------------------------
-- online_orders
-- -----------------------------------------------------------------------------
create table if not exists online_orders (
  id                  uuid primary key default gen_random_uuid(),
  transaction_id      uuid not null references transactions(id) on delete cascade,
  store_name          text not null,
  order_number        text,
  item_description    text,
  quantity            int default 1,
  shipping_cost       numeric(14,2) default 0,
  order_date          date,
  expected_delivery   date,
  status              text default 'ordered',
  tracking_number     text,
  refund_amount       numeric(14,2) default 0,
  order_screenshot_url text,
  constraint online_orders_status_check check (
    status in ('ordered', 'shipped', 'delivered', 'returned', 'refunded')
  )
);

-- -----------------------------------------------------------------------------
-- remittances
-- -----------------------------------------------------------------------------
create table if not exists remittances (
  id               uuid primary key default gen_random_uuid(),
  transaction_id   uuid not null references transactions(id) on delete cascade,
  recipient_type   text not null,
  person_id        uuid references people(id),
  business_name    text,
  channel          text,
  sent_amount      numeric(14,2),
  sent_currency    text,
  transfer_fee     numeric(14,2) default 0,
  exchange_rate    numeric(14,6),
  received_pkr     numeric(14,2),
  purpose          text not null,
  reference_number text,
  status           text default 'sent',
  receipt_url      text,
  sent_date        date,
  received_date    date,
  constraint remittances_recipient_type_check check (
    recipient_type in ('employee', 'business', 'family', 'other')
  ),
  constraint remittances_status_check check (status in ('sent', 'received', 'failed'))
);

-- -----------------------------------------------------------------------------
-- salary_payments
-- -----------------------------------------------------------------------------
create table if not exists salary_payments (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid not null references people(id),
  transaction_id   uuid references transactions(id),
  month            int not null,
  year             int not null,
  gross_amount     numeric(14,2),
  advance_deducted numeric(14,2) default 0,
  net_paid         numeric(14,2),
  status           text default 'paid',
  paid_on          date,
  constraint salary_payments_month_check check (month between 1 and 12),
  constraint salary_payments_status_check check (status in ('paid', 'partial', 'pending')),
  constraint salary_payments_person_month_year_key unique (person_id, month, year)
);

-- -----------------------------------------------------------------------------
-- loans
-- -----------------------------------------------------------------------------
create table if not exists loans (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid not null references people(id),
  direction       text not null,
  principal       numeric(14,2) not null,
  amount_repaid   numeric(14,2) default 0,
  start_date      date,
  expected_return date,
  status          text default 'open',
  notes           text,
  constraint loans_direction_check check (direction in ('given', 'taken')),
  constraint loans_status_check check (status in ('open', 'closed'))
);

-- -----------------------------------------------------------------------------
-- recurring_rules
-- -----------------------------------------------------------------------------
create table if not exists recurring_rules (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  amount        numeric(14,2),
  account_id    uuid references accounts(id),
  category_id   uuid references categories(id),
  person_id     uuid references people(id),
  frequency     text default 'monthly',
  day_of_month  int,
  auto_create   boolean default false,
  next_run_date date,
  is_active     boolean default true,
  constraint recurring_rules_frequency_check check (frequency in ('monthly', 'weekly'))
);

-- -----------------------------------------------------------------------------
-- budgets
-- -----------------------------------------------------------------------------
create table if not exists budgets (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id),
  month        int not null,
  year         int not null,
  limit_amount numeric(14,2) not null,
  constraint budgets_category_month_year_key unique (category_id, month, year)
);

-- -----------------------------------------------------------------------------
-- app_settings  (simple key/value store)
-- -----------------------------------------------------------------------------
create table if not exists app_settings (
  key   text primary key,
  value text
);

-- =============================================================================
-- Indexes — one on every foreign key column, plus transactions.txn_date
-- and transactions.deleted_at.
-- =============================================================================

-- transactions
create index if not exists idx_transactions_account_id    on transactions (account_id);
create index if not exists idx_transactions_to_account_id on transactions (to_account_id);
create index if not exists idx_transactions_category_id   on transactions (category_id);
create index if not exists idx_transactions_person_id     on transactions (person_id);
create index if not exists idx_transactions_txn_date      on transactions (txn_date);
create index if not exists idx_transactions_deleted_at    on transactions (deleted_at);

-- online_orders
create index if not exists idx_online_orders_transaction_id on online_orders (transaction_id);

-- remittances
create index if not exists idx_remittances_transaction_id on remittances (transaction_id);
create index if not exists idx_remittances_person_id      on remittances (person_id);

-- salary_payments
create index if not exists idx_salary_payments_person_id      on salary_payments (person_id);
create index if not exists idx_salary_payments_transaction_id on salary_payments (transaction_id);

-- loans
create index if not exists idx_loans_person_id on loans (person_id);

-- recurring_rules
create index if not exists idx_recurring_rules_account_id  on recurring_rules (account_id);
create index if not exists idx_recurring_rules_category_id on recurring_rules (category_id);
create index if not exists idx_recurring_rules_person_id   on recurring_rules (person_id);

-- budgets
create index if not exists idx_budgets_category_id on budgets (category_id);

-- =============================================================================
-- Trigger — keep transactions.updated_at in sync on every UPDATE.
-- =============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_transactions_set_updated_at on transactions;
create trigger trg_transactions_set_updated_at
  before update on transactions
  for each row
  execute function set_updated_at();
