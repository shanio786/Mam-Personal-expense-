import { BarChart3 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function ReportsPage() {
  return (
    <AppShell title="Reports">
      <EmptyState
        icon={<BarChart3 className="h-6 w-6" />}
        title="Coming soon"
        description="Reports are being built."
      />
    </AppShell>
  );
}
