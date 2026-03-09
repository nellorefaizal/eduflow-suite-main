import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Clock } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Trial Settings" subtitle="Configure free trial duration and limitations" icon={Clock}
      cards={[
        { title: "Trial Duration", description: "Default: 14 days — configurable per plan" },
        { title: "Trial Limits", description: "Max 50 students, 10 teachers during trial" },
        { title: "Auto-Disable", description: "Schools auto-suspended after trial expiry" },
      ]}
    />
  </DashboardLayout>
);
export default Page;