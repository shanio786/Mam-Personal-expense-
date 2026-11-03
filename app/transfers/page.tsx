import { Send } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function TransfersPage() {
  return (
    <AppShell title="Money Transfers">
      <EmptyState
        icon={<Send className="h-6 w-6" />}
        title="Coming soon"
        description="Money transfers are being built."
      />
    </AppShell>
  );
}
