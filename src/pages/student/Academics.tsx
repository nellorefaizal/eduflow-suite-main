import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { BookOpen } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="My Subjects" subtitle="View subjects and syllabus" icon={BookOpen} /></DashboardLayout>);
export default Page;