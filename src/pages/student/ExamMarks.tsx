import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Award } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="My Marks" subtitle="View your exam marks and scores" icon={Award} /></DashboardLayout>);
export default Page;