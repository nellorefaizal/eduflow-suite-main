import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { UserCircle } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Personal Info" subtitle="View and update your profile" icon={UserCircle} /></DashboardLayout>);
export default Page;