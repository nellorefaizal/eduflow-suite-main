import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { FileText } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Invoice Logs" subtitle="All generated invoices across schools" icon={FileText} />
  </DashboardLayout>
);
export default Page;