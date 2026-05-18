-- Fix search_path for SECURITY DEFINER function
ALTER FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) SET search_path = public;

-- Revoke execute from public and anon, grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) TO authenticated;

-- Policies for roles_permissions
CREATE POLICY "Super admins access all roles_permissions" ON public.roles_permissions FOR ALL USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Admins view tenant roles_permissions" ON public.roles_permissions FOR SELECT USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR company_id IS NULL);

-- Refine audit_logs insert policy
DROP POLICY IF EXISTS "Public insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
