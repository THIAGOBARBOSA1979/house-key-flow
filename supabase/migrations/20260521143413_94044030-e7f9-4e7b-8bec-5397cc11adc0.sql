-- Revoke public execution of security definer functions to satisfy linter
REVOKE EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) FROM authenticated;

-- Allow service_role to execute it if needed for background jobs, 
-- or specific authorized roles if we decide later.
GRANT EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) TO service_role;
