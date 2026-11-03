'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Users, BarChart3, Plus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Four labeled items; the central + button is overlaid in the middle.
const ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'People', href: '/people', icon: Users },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-stretch">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 transition',
                active ? 'text-accent' : 'text-ink-muted',
              )}
            >
              <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="max-w-full truncate text-sm font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center raised add button, overlaid so the four labels keep equal width. */}
        <Link
          href="/add"
          aria-label="Add"
          aria-current={isActive(pathname, '/add') ? 'page' : undefined}
          className="absolute -top-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg outline-none transition hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Plus className="h-7 w-7" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
