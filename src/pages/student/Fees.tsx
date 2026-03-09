import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { CreditCard } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Fee Payment History" subtitle="View past payments and status" icon={CreditCard} /></DashboardLayout>);
export default Page;