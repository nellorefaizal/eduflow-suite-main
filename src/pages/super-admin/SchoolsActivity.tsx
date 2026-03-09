import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { FileText } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="School Activity Logs" subtitle="Track all school-level activities across the platform" icon={FileText} />
  </DashboardLayout>
);
export default Page;