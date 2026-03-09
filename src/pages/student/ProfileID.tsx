import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { CreditCard } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Digital ID Card" subtitle="View your digital student ID" icon={CreditCard} /></DashboardLayout>);
export default Page;