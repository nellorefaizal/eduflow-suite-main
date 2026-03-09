import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Calculator } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="GST Reports" subtitle="Tax reports and GST filing summaries" icon={Calculator} />
  </DashboardLayout>
);
export default Page;