'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  title: string;
  initials: string;
  userName?: string | null;
}

export default function Header({ title, initials, userName }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Even if the request fails, send the user to login.
    }
    router.replace('/login');
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-30 border-b border-line bg-page/80 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4 lg:px-8">
        <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={userName ? `Account: ${userName}` : 'Account menu'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-sm font-semibold text-accent outline-none transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-fade-in absolute right-0 top-14 w-52 overflow-hidden rounded-card border border-line bg-card py-1 shadow-lg"
            >
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center gap-3 px-4 text-base text-ink transition hover:bg-page"
              >
                <Settings className="h-5 w-5 text-ink-soft" aria-hidden="true" />
                Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                disabled={signingOut}
                className={cn(
                  'flex min-h-12 w-full items-center gap-3 px-4 text-left text-base text-ink transition hover:bg-page',
                  'disabled:opacity-60',
                )}
              >
                <LogOut className="h-5 w-5 text-ink-soft" aria-hidden="true" />
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
