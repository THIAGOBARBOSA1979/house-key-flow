-- Revoke all on sensitive functions from public/anon
REVOKE EXECUTE ON FUNCTION public.generate_ticket_protocol() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_plan_limits() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_auth_user_role() FROM anon;

-- Grant execute to authenticated users where appropriate
GRANT EXECUTE ON FUNCTION public.get_auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_ticket_protocol() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_plan_limits() TO authenticated;

-- Ensure audit functions are restricted
-- Note: log_audit_action has 5 arguments: p_action text, p_entity_type text, p_entity_id text, p_payload jsonb, p_previous_values jsonb
-- But some versions might have 4. Let's check both if needed or use the one from pg_proc.
-- Based on previous query: proargtypes: 25 25 25 3802 3802 (5 args)
REVOKE EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;
