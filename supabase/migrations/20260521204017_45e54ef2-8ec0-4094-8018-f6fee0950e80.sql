-- Fix client_events policies (remove metadata dependency)
DROP POLICY IF EXISTS "Users can view events for their company" ON public.client_events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.client_events;

CREATE POLICY "Users can view events for their company"
ON public.client_events FOR SELECT
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage events"
ON public.client_events FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'master', 'super_admin')
    AND (is_super_admin = true OR company_id = client_events.company_id)
));

-- Fix warranty_sla_configs policies
DROP POLICY IF EXISTS "SLA configs are viewable by authenticated users" ON public.warranty_sla_configs;
DROP POLICY IF EXISTS "Only admins can manage SLA configs" ON public.warranty_sla_configs;

CREATE POLICY "Users can view their company SLA configs"
ON public.warranty_sla_configs FOR SELECT
USING (
    company_id IS NULL OR -- Default configs
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can manage company SLA configs"
ON public.warranty_sla_configs FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'master')
    AND (is_super_admin = true OR company_id = warranty_sla_configs.company_id)
));

-- Fix functions search_path and security
ALTER FUNCTION public.process_audit_log() SET search_path = public;
ALTER FUNCTION public.get_auth_company_id() SET search_path = public;

-- Ensure SECURITY DEFINER functions are not excessively exposed
REVOKE EXECUTE ON FUNCTION public.get_auth_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_company_id() TO service_role;

REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;
