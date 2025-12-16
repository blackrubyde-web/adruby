// Admin dashboard temporarily deactivated; replace with lightweight placeholder.
import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageShell from '../../components/ui/PageShell';
import EmptyState from '../../components/ui/EmptyState';

const AdminDashboard = () => (
  <DashboardLayout>
    <PageShell title="Admin Dashboard" subtitle="Dieses Dashboard ist vorübergehend deaktiviert.">
      <EmptyState
        title="Deaktiviert"
        description="Das Admin-Dashboard wird aktuell gewartet. Bitte später erneut prüfen."
      />
    </PageShell>
  </DashboardLayout>
);

export default AdminDashboard;
