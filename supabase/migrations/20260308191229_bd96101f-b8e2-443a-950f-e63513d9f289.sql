
-- =============================================
-- NEXTROVA EDUCORE - COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  student_count INTEGER NOT NULL DEFAULT 0,
  teacher_count INTEGER NOT NULL DEFAULT 0,
  max_students INTEGER NOT NULL DEFAULT 500,
  max_teachers INTEGER NOT NULL DEFAULT 50,
  admin_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 6. Academic years
CREATE TABLE public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- 7. Classes
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section TEXT,
  academic_year_id UUID REFERENCES public.academic_years(id),
  class_teacher_id UUID,
  capacity INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 8. Subjects
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- 9. Students
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  admission_no TEXT,
  roll_no TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  blood_group TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  admitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 10. Teachers
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject_specialization TEXT,
  qualification TEXT,
  date_of_joining DATE,
  salary NUMERIC(12,2),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- 11. Attendance
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  marked_by UUID,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 12. Exams
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'mid_term',
  academic_year_id UUID REFERENCES public.academic_years(id),
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- 13. Exam results
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(5,2),
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- 14. Fee structure
CREATE TABLE public.fee_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  class_id UUID REFERENCES public.classes(id),
  academic_year_id UUID REFERENCES public.academic_years(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- 15. Fee payments
CREATE TABLE public.fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structures(id),
  amount NUMERIC(12,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL DEFAULT 'cash',
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  receipt_no TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- 16. Assignments
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  subject_id UUID REFERENCES public.subjects(id),
  teacher_id UUID REFERENCES public.teachers(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  total_marks NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 17. Assignment submissions
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  marks NUMERIC(5,2),
  grade TEXT,
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- 18. Timetable
CREATE TABLE public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  teacher_id UUID REFERENCES public.teachers(id),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- 19. Notices
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT,
  is_global BOOLEAN NOT NULL DEFAULT false,
  published_by UUID,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 20. Leave requests
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'casual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- 21. Subscription plans (platform-level)
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  max_students INTEGER NOT NULL DEFAULT 500,
  max_teachers INTEGER NOT NULL DEFAULT 50,
  max_storage_gb INTEGER NOT NULL DEFAULT 10,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trial_days INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 22. Billing transactions
CREATE TABLE public.billing_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  amount NUMERIC(12,2) NOT NULL,
  gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  invoice_no TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  billing_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- 23. Support tickets
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 24. Audit logs
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TIMESTAMP UPDATE TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles: users see own, super_admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Schools
CREATE POLICY "Anyone authenticated can view schools" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins can manage schools" ON public.schools FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School admins can update own school" ON public.schools FOR UPDATE USING (admin_user_id = auth.uid());

-- Academic years, classes, subjects: school members can view
CREATE POLICY "Authenticated can view academic_years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage academic_years" ON public.academic_years FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Authenticated can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage classes" ON public.classes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Authenticated can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage subjects" ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Students
CREATE POLICY "School members can view students" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage students" ON public.students FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Teachers
CREATE POLICY "School members can view teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage teachers" ON public.teachers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Attendance
CREATE POLICY "Authenticated can view attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers and admins manage attendance" ON public.attendance FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'school_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- Exams
CREATE POLICY "Authenticated can view exams" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage exams" ON public.exams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Exam results
CREATE POLICY "Authenticated can view exam_results" ON public.exam_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers and admins manage exam_results" ON public.exam_results FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'school_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- Fee structures
CREATE POLICY "Authenticated can view fee_structures" ON public.fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage fee_structures" ON public.fee_structures FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Fee payments
CREATE POLICY "Authenticated can view fee_payments" ON public.fee_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage fee_payments" ON public.fee_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Assignments
CREATE POLICY "Authenticated can view assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'school_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- Assignment submissions
CREATE POLICY "Authenticated can view submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students and teachers manage submissions" ON public.assignment_submissions FOR ALL USING (
  public.has_role(auth.uid(), 'student') OR public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'school_admin')
);

-- Timetable
CREATE POLICY "Authenticated can view timetable" ON public.timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "School admins manage timetable" ON public.timetable FOR ALL USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Notices
CREATE POLICY "Authenticated can view notices" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage notices" ON public.notices FOR ALL USING (
  public.has_role(auth.uid(), 'school_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- Leave requests
CREATE POLICY "Users can view own leave" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own leave" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all leave" ON public.leave_requests FOR SELECT USING (
  public.has_role(auth.uid(), 'school_admin') OR public.has_role(auth.uid(), 'super_admin')
);
CREATE POLICY "Admins can manage leave" ON public.leave_requests FOR UPDATE USING (
  public.has_role(auth.uid(), 'school_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- Subscription plans: publicly viewable
CREATE POLICY "Anyone can view plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Super admins manage plans" ON public.subscription_plans FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Billing transactions
CREATE POLICY "Super admins view all billing" ON public.billing_transactions FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School admins view own billing" ON public.billing_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND admin_user_id = auth.uid())
);
CREATE POLICY "Super admins manage billing" ON public.billing_transactions FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Support tickets
CREATE POLICY "Users view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins manage tickets" ON public.support_tickets FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Audit logs: super admins only
CREATE POLICY "Super admins view audit_logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "System can insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
