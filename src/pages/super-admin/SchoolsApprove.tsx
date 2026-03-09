import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { UserCheck, Building2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage
      title="Approve / Reject Schools"
      subtitle="Review and approve pending school registrations"
      icon={UserCheck}
      stats={[
        { label: "Pending", value: "12", icon: Clock },
        { label: "Approved Today", value: "5", icon: CheckCircle2 },
        { label: "Rejected", value: "2", icon: AlertTriangle },
        { label: "Total Reviewed", value: "347", icon: Building2 },
      ]}
      cards={[
        { title: "Modern Academy, Pune", description: "Starter Plan • 420 students • Submitted 2 days ago" },
        { title: "Ryan International, Gurugram", description: "Enterprise Plan • 2800 students • Submitted 1 day ago" },
        { title: "St. Xavier's, Mumbai", description: "Professional Plan • 1200 students • Submitted today" },
      ]}
    />
  </DashboardLayout>
);
export default Page;