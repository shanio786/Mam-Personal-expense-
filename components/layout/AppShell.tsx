import { getSession } from '@/lib/auth';
import { initialsFromName } from '@/lib/utils';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Shell for all authenticated pages: Sidebar (desktop) / BottomNav (mobile),
 * a sticky Header, and the page content in a centered, padded container.
 */
export default async function AppShell({ title, children }: AppShellProps) {
  const user = await getSession();
  const name = user?.full_name || user?.username || null;
  const initials = initialsFromName(name);

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto flex w-full max-w-6xl">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={title} initials={initials} userName={name} />

          {/* Extra bottom padding on mobile so content clears the fixed BottomNav. */}
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
