import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Bell } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Notifications" subtitle="View announcements and events" icon={Bell} /></DashboardLayout>);
export default Page;