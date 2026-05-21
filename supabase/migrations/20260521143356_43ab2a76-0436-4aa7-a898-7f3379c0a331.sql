-- Fix permissive RLS for audit_logs
DROP POLICY "Authenticated users insert audit logs" ON public.audit_logs;

CREATE POLICY "Users can insert audit logs for their company" ON public.audit_logs
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );
