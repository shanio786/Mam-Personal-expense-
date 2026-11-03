import { Package } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function OrdersPage() {
  return (
    <AppShell title="Online Orders">
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="Coming soon"
        description="Online orders are being built."
      />
    </AppShell>
  );
}
