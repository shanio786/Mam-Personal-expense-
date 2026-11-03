'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  ArrowLeftRight,
  Package,
  Send,
  Wallet,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Add', href: '/add', icon: Plus },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Online Orders', href: '/orders', icon: Package },
  { label: 'Money Transfers', href: '/transfers', icon: Send },
  { label: 'Accounts', href: '/accounts', icon: Wallet },
  { label: 'People', href: '/people', icon: Users },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-card lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-button bg-accent text-white">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-base font-semibold text-ink">Expense Manager</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-12 items-center gap-3 rounded-button px-3 text-base font-medium transition',
                active
                  ? 'bg-accent-tint text-accent'
                  : 'text-ink-soft hover:bg-page hover:text-ink',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
