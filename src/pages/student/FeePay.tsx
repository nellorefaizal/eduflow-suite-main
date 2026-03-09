import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Wallet } from "lucide-react";
const Page = () => (<DashboardLayout role="student"><SkeletonPage title="Pay Online" subtitle="Make online fee payments" icon={Wallet} /></DashboardLayout>);
export default Page;