import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { CalendarDays } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="My Attendance" subtitle="View daily and monthly attendance records" icon={CalendarDays} /></DashboardLayout>);
export default Page;