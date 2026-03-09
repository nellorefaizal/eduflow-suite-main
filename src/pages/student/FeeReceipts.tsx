import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Download } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Fee Receipts" subtitle="Download payment receipts" icon={Download} /></DashboardLayout>);
export default Page;