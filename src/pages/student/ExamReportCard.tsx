import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Download } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Report Card" subtitle="Download your report card" icon={Download} /></DashboardLayout>);
export default Page;