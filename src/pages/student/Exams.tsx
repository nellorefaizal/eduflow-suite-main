import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { CalendarDays } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Exam Schedule" subtitle="View upcoming exam dates" icon={CalendarDays} /></DashboardLayout>);
export default Page;