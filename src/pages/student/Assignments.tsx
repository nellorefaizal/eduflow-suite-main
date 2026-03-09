import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { ClipboardList } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="My Assignments" subtitle="View assigned homework and tasks" icon={ClipboardList} /></DashboardLayout>);
export default Page;