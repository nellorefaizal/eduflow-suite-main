import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { FileText } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="My Documents" subtitle="View and download your documents" icon={FileText} /></DashboardLayout>);
export default Page;