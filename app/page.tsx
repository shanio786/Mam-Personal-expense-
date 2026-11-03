import { LayoutDashboard } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <EmptyState
        icon={<LayoutDashboard className="h-6 w-6" />}
        title="Coming soon"
        description="Your dashboard is being built."
      />
    </AppShell>
  );
}
