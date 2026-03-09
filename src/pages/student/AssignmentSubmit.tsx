import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { FileCheck } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Submit Homework" subtitle="Upload and submit your homework" icon={FileCheck} /></DashboardLayout>);
export default Page;