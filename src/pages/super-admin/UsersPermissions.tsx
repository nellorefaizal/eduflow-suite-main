import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { UserCheck } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Role Permissions" subtitle="Configure role-based access control" icon={UserCheck} />
  </DashboardLayout>
);
export default Page;