import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page";

export default function AdminPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      <DashboardPageFrame>{children}</DashboardPageFrame>
    </AdminShell>
  );
}
