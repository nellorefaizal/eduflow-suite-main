import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Clock } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="My Timetable" subtitle="View your class schedule" icon={Clock} /></DashboardLayout>);
export default Page;