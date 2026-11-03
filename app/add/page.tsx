import { Plus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function AddPage() {
  return (
    <AppShell title="Add">
      <EmptyState
        icon={<Plus className="h-6 w-6" />}
        title="Coming soon"
        description="Adding transactions is being built."
      />
    </AppShell>
  );
}
