import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { ClipboardList } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Complaint Tracking" subtitle="Track and resolve school complaints" icon={ClipboardList} />
  </DashboardLayout>
);
export default Page;