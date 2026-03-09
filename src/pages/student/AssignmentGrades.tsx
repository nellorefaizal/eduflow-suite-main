import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Award } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Assignment Grades" subtitle="View grades for submitted assignments" icon={Award} /></DashboardLayout>);
export default Page;