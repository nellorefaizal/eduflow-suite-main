
-- Fix the permissive audit_logs INSERT policy
DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
