import { Wallet } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function AccountsPage() {
  return (
    <AppShell title="Accounts">
      <EmptyState
        icon={<Wallet className="h-6 w-6" />}
        title="Coming soon"
        description="Your accounts are being built."
      />
    </AppShell>
  );
}
