import { Users } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function PeoplePage() {
  return (
    <AppShell title="People">
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Coming soon"
        description="People are being built."
      />
    </AppShell>
  );
}
