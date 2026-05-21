-- Redefine get_auth_company_id to be secure and metadata-free
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view their own company members" ON public.profiles;
CREATE POLICY "Users can view their own company members"
ON public.profiles FOR SELECT
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
    OR 
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Fix documents policies
DROP POLICY IF EXISTS "Documents are tenant-isolated" ON public.documents;
CREATE POLICY "Documents are tenant-isolated"
ON public.documents FOR SELECT
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR 
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Fix log_audit_action permissions and search_path
ALTER FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) SET search_path = public;

-- Revoke public execution for all sensitive security definer functions
REVOKE EXECUTE ON FUNCTION public.get_auth_company_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_auth_company_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) TO authenticated, service_role;
