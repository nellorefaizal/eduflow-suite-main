import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Landing
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Dashboards
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Super Admin
import SuperAdminSchools from "./pages/super-admin/Schools";
import SuperAdminSchoolsApprove from "./pages/super-admin/SchoolsApprove";
import SuperAdminSchoolsActivity from "./pages/super-admin/SchoolsActivity";
import SuperAdminSubscriptions from "./pages/super-admin/Subscriptions";
import SuperAdminSubFeatures from "./pages/super-admin/SubscriptionFeatures";
import SuperAdminSubTrials from "./pages/super-admin/SubscriptionTrials";
import SuperAdminBilling from "./pages/super-admin/Billing";
import SuperAdminBillingInvoices from "./pages/super-admin/BillingInvoices";
import SuperAdminBillingGST from "./pages/super-admin/BillingGST";
import SuperAdminAnalytics from "./pages/super-admin/Analytics";
import SuperAdminUsers from "./pages/super-admin/Users";
import SuperAdminUsersSupport from "./pages/super-admin/UsersSupport";
import SuperAdminUsersPermissions from "./pages/super-admin/UsersPermissions";
import SuperAdminSupport from "./pages/super-admin/Support";
import SuperAdminSupportChat from "./pages/super-admin/SupportChat";
import SuperAdminSupportComplaints from "./pages/super-admin/SupportComplaints";
import SuperAdminAudit from "./pages/super-admin/AuditLogs";
import SuperAdminUsage from "./pages/super-admin/Usage";
import SuperAdminSettings from "./pages/super-admin/Settings";

// School Admin
import SAStudents from "./pages/school-admin/Students";
import SATeachers from "./pages/school-admin/Teachers";
import SAAttendance from "./pages/school-admin/Attendance";
import SAExams from "./pages/school-admin/Exams";
import SAFees from "./pages/school-admin/Fees";
import SASettings from "./pages/school-admin/Settings";
import SAAcademicClasses from "./pages/school-admin/AcademicClasses";
import SAAcademicSubjects from "./pages/school-admin/AcademicSubjects";
import SAAcademicYear from "./pages/school-admin/AcademicYear";
import SAAcademicCurriculum from "./pages/school-admin/AcademicCurriculum";
import SAStudentPromote from "./pages/school-admin/StudentPromote";
import SAStudentDocuments from "./pages/school-admin/StudentDocuments";
import SAStudentIDCards from "./pages/school-admin/StudentIDCards";
import SAStudentAlumni from "./pages/school-admin/StudentAlumni";
import SAStaffNonTeaching from "./pages/school-admin/StaffNonTeaching";
import SAStaffPayroll from "./pages/school-admin/StaffPayroll";
import SAStaffLeave from "./pages/school-admin/StaffLeave";
import SAAttendanceReports from "./pages/school-admin/AttendanceReports";
import SAExamMarks from "./pages/school-admin/ExamMarks";
import SAExamReportCards from "./pages/school-admin/ExamReportCards";
import SAExamRankings from "./pages/school-admin/ExamRankings";
import SAFeePayments from "./pages/school-admin/FeePayments";
import SAFeeDue from "./pages/school-admin/FeeDue";
import SAFeeScholarships from "./pages/school-admin/FeeScholarships";
import SATimetable from "./pages/school-admin/Timetable";
import SACommNotices from "./pages/school-admin/CommNotices";
import SACommBroadcast from "./pages/school-admin/CommBroadcast";
import SACommMessaging from "./pages/school-admin/CommMessaging";
import SATransport from "./pages/school-admin/Transport";
import SALibrary from "./pages/school-admin/Library";
import SAHostel from "./pages/school-admin/Hostel";
import SAReports from "./pages/school-admin/Reports";

// Teacher
import TeacherClasses from "./pages/teacher/Classes";
import TeacherClassStudents from "./pages/teacher/ClassStudents";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherAttendanceHistory from "./pages/teacher/AttendanceHistory";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherStudyMaterial from "./pages/teacher/StudyMaterial";
import TeacherReviewSubmissions from "./pages/teacher/ReviewSubmissions";
import TeacherExams from "./pages/teacher/Exams";
import TeacherExamResults from "./pages/teacher/ExamResults";
import TeacherTimetable from "./pages/teacher/Timetable";
import TeacherMessages from "./pages/teacher/Messages";
import TeacherAnnouncements from "./pages/teacher/Announcements";
import TeacherLeave from "./pages/teacher/Leave";

// Student
import StudentProfile from "./pages/student/Profile";
import StudentProfileDocuments from "./pages/student/ProfileDocuments";
import StudentProfileID from "./pages/student/ProfileID";
import StudentAttendance from "./pages/student/Attendance";
import StudentAcademics from "./pages/student/Academics";
import StudentAcademicMaterials from "./pages/student/AcademicMaterials";
import StudentAssignments from "./pages/student/Assignments";
import StudentAssignmentSubmit from "./pages/student/AssignmentSubmit";
import StudentAssignmentGrades from "./pages/student/AssignmentGrades";
import StudentExams from "./pages/student/Exams";
import StudentExamMarks from "./pages/student/ExamMarks";
import StudentExamReportCard from "./pages/student/ExamReportCard";
import StudentFees from "./pages/student/Fees";
import StudentFeePay from "./pages/student/FeePay";
import StudentFeeReceipts from "./pages/student/FeeReceipts";
import StudentTimetable from "./pages/student/Timetable";
import StudentNotifications from "./pages/student/Notifications";

const queryClient = new QueryClient();

const SA = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["super_admin"]}>{children}</ProtectedRoute>
);
const SchA = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["school_admin", "super_admin"]}>{children}</ProtectedRoute>
);
const T = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["teacher", "school_admin", "super_admin"]}>{children}</ProtectedRoute>
);
const St = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["student", "teacher", "school_admin", "super_admin"]}>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Super Admin */}
            <Route path="/dashboard/super-admin" element={<SA><SuperAdminDashboard /></SA>} />
            <Route path="/dashboard/super-admin/schools" element={<SA><SuperAdminSchools /></SA>} />
            <Route path="/dashboard/super-admin/schools/approve" element={<SA><SuperAdminSchoolsApprove /></SA>} />
            <Route path="/dashboard/super-admin/schools/activity" element={<SA><SuperAdminSchoolsActivity /></SA>} />
            <Route path="/dashboard/super-admin/subscriptions" element={<SA><SuperAdminSubscriptions /></SA>} />
            <Route path="/dashboard/super-admin/subscriptions/features" element={<SA><SuperAdminSubFeatures /></SA>} />
            <Route path="/dashboard/super-admin/subscriptions/trials" element={<SA><SuperAdminSubTrials /></SA>} />
            <Route path="/dashboard/super-admin/billing" element={<SA><SuperAdminBilling /></SA>} />
            <Route path="/dashboard/super-admin/billing/invoices" element={<SA><SuperAdminBillingInvoices /></SA>} />
            <Route path="/dashboard/super-admin/billing/gst" element={<SA><SuperAdminBillingGST /></SA>} />
            <Route path="/dashboard/super-admin/analytics" element={<SA><SuperAdminAnalytics /></SA>} />
            <Route path="/dashboard/super-admin/users" element={<SA><SuperAdminUsers /></SA>} />
            <Route path="/dashboard/super-admin/users/support" element={<SA><SuperAdminUsersSupport /></SA>} />
            <Route path="/dashboard/super-admin/users/permissions" element={<SA><SuperAdminUsersPermissions /></SA>} />
            <Route path="/dashboard/super-admin/support" element={<SA><SuperAdminSupport /></SA>} />
            <Route path="/dashboard/super-admin/support/chat" element={<SA><SuperAdminSupportChat /></SA>} />
            <Route path="/dashboard/super-admin/support/complaints" element={<SA><SuperAdminSupportComplaints /></SA>} />
            <Route path="/dashboard/super-admin/audit" element={<SA><SuperAdminAudit /></SA>} />
            <Route path="/dashboard/super-admin/usage" element={<SA><SuperAdminUsage /></SA>} />
            <Route path="/dashboard/super-admin/settings" element={<SA><SuperAdminSettings /></SA>} />

            {/* School Admin */}
            <Route path="/dashboard/school-admin" element={<SchA><SchoolAdminDashboard /></SchA>} />
            <Route path="/dashboard/school-admin/academics/classes" element={<SchA><SAAcademicClasses /></SchA>} />
            <Route path="/dashboard/school-admin/academics/subjects" element={<SchA><SAAcademicSubjects /></SchA>} />
            <Route path="/dashboard/school-admin/academics/year" element={<SchA><SAAcademicYear /></SchA>} />
            <Route path="/dashboard/school-admin/academics/curriculum" element={<SchA><SAAcademicCurriculum /></SchA>} />
            <Route path="/dashboard/school-admin/students" element={<SchA><SAStudents /></SchA>} />
            <Route path="/dashboard/school-admin/students/promote" element={<SchA><SAStudentPromote /></SchA>} />
            <Route path="/dashboard/school-admin/students/documents" element={<SchA><SAStudentDocuments /></SchA>} />
            <Route path="/dashboard/school-admin/students/idcards" element={<SchA><SAStudentIDCards /></SchA>} />
            <Route path="/dashboard/school-admin/students/alumni" element={<SchA><SAStudentAlumni /></SchA>} />
            <Route path="/dashboard/school-admin/teachers" element={<SchA><SATeachers /></SchA>} />
            <Route path="/dashboard/school-admin/staff/nonteaching" element={<SchA><SAStaffNonTeaching /></SchA>} />
            <Route path="/dashboard/school-admin/staff/payroll" element={<SchA><SAStaffPayroll /></SchA>} />
            <Route path="/dashboard/school-admin/staff/leave" element={<SchA><SAStaffLeave /></SchA>} />
            <Route path="/dashboard/school-admin/attendance" element={<SchA><SAAttendance /></SchA>} />
            <Route path="/dashboard/school-admin/attendance/reports" element={<SchA><SAAttendanceReports /></SchA>} />
            <Route path="/dashboard/school-admin/exams" element={<SchA><SAExams /></SchA>} />
            <Route path="/dashboard/school-admin/exams/marks" element={<SchA><SAExamMarks /></SchA>} />
            <Route path="/dashboard/school-admin/exams/reportcards" element={<SchA><SAExamReportCards /></SchA>} />
            <Route path="/dashboard/school-admin/exams/rankings" element={<SchA><SAExamRankings /></SchA>} />
            <Route path="/dashboard/school-admin/fees" element={<SchA><SAFees /></SchA>} />
            <Route path="/dashboard/school-admin/fees/payments" element={<SchA><SAFeePayments /></SchA>} />
            <Route path="/dashboard/school-admin/fees/due" element={<SchA><SAFeeDue /></SchA>} />
            <Route path="/dashboard/school-admin/fees/scholarships" element={<SchA><SAFeeScholarships /></SchA>} />
            <Route path="/dashboard/school-admin/timetable" element={<SchA><SATimetable /></SchA>} />
            <Route path="/dashboard/school-admin/communication/notices" element={<SchA><SACommNotices /></SchA>} />
            <Route path="/dashboard/school-admin/communication/broadcast" element={<SchA><SACommBroadcast /></SchA>} />
            <Route path="/dashboard/school-admin/communication/messaging" element={<SchA><SACommMessaging /></SchA>} />
            <Route path="/dashboard/school-admin/transport" element={<SchA><SATransport /></SchA>} />
            <Route path="/dashboard/school-admin/library" element={<SchA><SALibrary /></SchA>} />
            <Route path="/dashboard/school-admin/hostel" element={<SchA><SAHostel /></SchA>} />
            <Route path="/dashboard/school-admin/reports" element={<SchA><SAReports /></SchA>} />
            <Route path="/dashboard/school-admin/settings" element={<SchA><SASettings /></SchA>} />

            {/* Teacher */}
            <Route path="/dashboard/teacher" element={<T><TeacherDashboard /></T>} />
            <Route path="/dashboard/teacher/classes" element={<T><TeacherClasses /></T>} />
            <Route path="/dashboard/teacher/classes/students" element={<T><TeacherClassStudents /></T>} />
            <Route path="/dashboard/teacher/attendance" element={<T><TeacherAttendance /></T>} />
            <Route path="/dashboard/teacher/attendance/history" element={<T><TeacherAttendanceHistory /></T>} />
            <Route path="/dashboard/teacher/assignments" element={<T><TeacherAssignments /></T>} />
            <Route path="/dashboard/teacher/assignments/material" element={<T><TeacherStudyMaterial /></T>} />
            <Route path="/dashboard/teacher/assignments/review" element={<T><TeacherReviewSubmissions /></T>} />
            <Route path="/dashboard/teacher/exams" element={<T><TeacherExams /></T>} />
            <Route path="/dashboard/teacher/exams/results" element={<T><TeacherExamResults /></T>} />
            <Route path="/dashboard/teacher/timetable" element={<T><TeacherTimetable /></T>} />
            <Route path="/dashboard/teacher/messages" element={<T><TeacherMessages /></T>} />
            <Route path="/dashboard/teacher/messages/announcements" element={<T><TeacherAnnouncements /></T>} />
            <Route path="/dashboard/teacher/leave" element={<T><TeacherLeave /></T>} />

            {/* Student */}
            <Route path="/dashboard/student" element={<St><StudentDashboard /></St>} />
            <Route path="/dashboard/student/profile" element={<St><StudentProfile /></St>} />
            <Route path="/dashboard/student/profile/documents" element={<St><StudentProfileDocuments /></St>} />
            <Route path="/dashboard/student/profile/id" element={<St><StudentProfileID /></St>} />
            <Route path="/dashboard/student/attendance" element={<St><StudentAttendance /></St>} />
            <Route path="/dashboard/student/academics" element={<St><StudentAcademics /></St>} />
            <Route path="/dashboard/student/academics/materials" element={<St><StudentAcademicMaterials /></St>} />
            <Route path="/dashboard/student/assignments" element={<St><StudentAssignments /></St>} />
            <Route path="/dashboard/student/assignments/submit" element={<St><StudentAssignmentSubmit /></St>} />
            <Route path="/dashboard/student/assignments/grades" element={<St><StudentAssignmentGrades /></St>} />
            <Route path="/dashboard/student/exams" element={<St><StudentExams /></St>} />
            <Route path="/dashboard/student/exams/marks" element={<St><StudentExamMarks /></St>} />
            <Route path="/dashboard/student/exams/reportcard" element={<St><StudentExamReportCard /></St>} />
            <Route path="/dashboard/student/fees" element={<St><StudentFees /></St>} />
            <Route path="/dashboard/student/fees/pay" element={<St><StudentFeePay /></St>} />
            <Route path="/dashboard/student/fees/receipts" element={<St><StudentFeeReceipts /></St>} />
            <Route path="/dashboard/student/timetable" element={<St><StudentTimetable /></St>} />
            <Route path="/dashboard/student/notifications" element={<St><StudentNotifications /></St>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
