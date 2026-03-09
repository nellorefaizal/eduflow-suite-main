import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Users } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Support Staff" subtitle="Manage support team members and permissions" icon={Users} />
  </DashboardLayout>
);
export default Page;