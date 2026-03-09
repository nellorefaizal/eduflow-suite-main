import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Download } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Study Materials" subtitle="Download study materials shared by teachers" icon={Download} /></DashboardLayout>);
export default Page;