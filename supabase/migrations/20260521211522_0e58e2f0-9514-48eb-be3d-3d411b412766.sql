-- Revogar execução pública para funções críticas SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.process_audit_log FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_auth_company_id FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_action FROM PUBLIC;

-- Permitir apenas para a role autenticada (e service_role por padrão)
GRANT EXECUTE ON FUNCTION public.process_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_company_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_action TO authenticated;