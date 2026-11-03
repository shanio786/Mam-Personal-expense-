import { Settings } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <EmptyState
        icon={<Settings className="h-6 w-6" />}
        title="Coming soon"
        description="Settings are being built."
      />
    </AppShell>
  );
}
