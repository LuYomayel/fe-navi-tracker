import DashboardPage from "./(app)/dashboard/page";
import AppLayout from "@/modules/shared/components/AppLayout";

export default function HomePage() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}
