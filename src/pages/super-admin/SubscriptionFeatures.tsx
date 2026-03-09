import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonPage from "@/components/shared/SkeletonPage";
import { Settings, Lock, Clock } from "lucide-react";

const Page = () => (
  <DashboardLayout role="super-admin">
    <SkeletonPage title="Feature Access Control" subtitle="Control which features are available per subscription plan" icon={Settings}
      cards={[
        { title: "Starter Plan Features", description: "Student management, attendance, basic fees — 8 modules" },
        { title: "Professional Plan Features", description: "All Starter + exams, transport, library, SMS — 14 modules" },
        { title: "Enterprise Plan Features", description: "All Professional + AI, API, custom domain, branding — 20 modules" },
      ]}
    />
  </DashboardLayout>
);
export default Page;