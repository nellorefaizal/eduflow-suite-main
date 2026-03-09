import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { MessageSquare } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Live Chat Logs" subtitle="Review chat conversations with schools" icon={MessageSquare} />
  </DashboardLayout>
);
export default Page;