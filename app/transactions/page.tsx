import { ArrowLeftRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function TransactionsPage() {
  return (
    <AppShell title="Transactions">
      <EmptyState
        icon={<ArrowLeftRight className="h-6 w-6" />}
        title="Coming soon"
        description="Your transactions list is being built."
      />
    </AppShell>
  );
}
