-- =============================================================================
-- Expense Manager — seed data (Supabase / PostgreSQL)
--
-- Safe to re-run: each insert is guarded so duplicates are not created.
-- No user is seeded here — the single account is created by a CLI script later.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Accounts
-- -----------------------------------------------------------------------------
insert into accounts (name, type, currency, opening_balance, sort_order)
select v.name, v.type, 'PKR', 0, v.sort_order
from (values
  ('Cash',          'cash',   0),
  ('Bank Account',  'bank',   1),
  ('Mobile Wallet', 'wallet', 2)
) as v(name, type, sort_order)
where not exists (
  select 1 from accounts a where a.name = v.name
);

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------
insert into categories (name, group_name, icon, sort_order)
select v.name, v.group_name, v.icon, v.sort_order
from (values
  -- Home
  ('Groceries',       'Home',      '🛒',  0),
  ('Utilities',       'Home',      '💡',  1),
  ('Rent',            'Home',      '🏠',  2),
  ('Medical',         'Home',      '🏥',  3),
  ('Education',       'Home',      '🎓',  4),
  ('Household',       'Home',      '🧹',  5),
  ('Transport',       'Home',      '🚗',  6),
  -- Shopping
  ('Online Shopping', 'Shopping',  '📦',  7),
  ('Clothing',        'Shopping',  '👕',  8),
  ('Electronics',     'Shopping',  '💻',  9),
  ('Home Goods',      'Shopping',  '🛋️',  10),
  -- Business
  ('Stock Purchase',  'Business',  '📥',  11),
  ('Office Expense',  'Business',  '🏢',  12),
  ('Marketing',       'Business',  '📣',  13),
  ('Courier',         'Business',  '🚚',  14),
  ('Software',        'Business',  '🧩',  15),
  -- Transfers
  ('Employee Salary', 'Transfers', '💵',  16),
  ('Business Funding','Transfers', '💰',  17),
  ('Family Support',  'Transfers', '👨‍👩‍👧',  18),
  -- Other
  ('Miscellaneous',   'Other',     '🔖',  19)
) as v(name, group_name, icon, sort_order)
where not exists (
  select 1 from categories c
  where c.name = v.name and c.group_name = v.group_name
);

-- -----------------------------------------------------------------------------
-- App settings
-- -----------------------------------------------------------------------------
insert into app_settings (key, value) values
  ('base_currency', 'PKR'),
  ('app_name',      'Expense Manager')
on conflict (key) do nothing;
