-- 1. Função genérica para garantir o company_id baseado no perfil do usuário logado
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'company_id')::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Garantir que todas as tabelas tenham RLS habilitado (Auditoria de Segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 3. Refatoração de Políticas RLS para Isolamento Estrito (Exemplo em tabelas críticas)

-- Profiles: Usuários só veem membros da sua própria empresa
DROP POLICY IF EXISTS "Users can view their own company members" ON public.profiles;
CREATE POLICY "Users can view their own company members" ON public.profiles
FOR SELECT USING (
  company_id = public.get_auth_company_id() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);

-- Documents: Isolamento total de arquivos por tenant
DROP POLICY IF EXISTS "Documents are tenant-isolated" ON public.documents;
CREATE POLICY "Documents are tenant-isolated" ON public.documents
FOR ALL USING (
  company_id = public.get_auth_company_id() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);

-- 4. Automação de Auditoria via Triggers (Removendo dependência do Frontend)
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB := NULL;
    new_data JSONB := NULL;
    entity_id UUID;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        entity_id := OLD.id;
    ELSIF (TG_OP = 'INSERT') THEN
        new_data := to_jsonb(NEW);
        entity_id := NEW.id;
    ELSIF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        entity_id := OLD.id;
    END IF;

    INSERT INTO public.audit_logs (
        company_id,
        user_id,
        action,
        entity_type,
        entity_id,
        payload,
        previous_values
    ) VALUES (
        COALESCE(new_data->>'company_id', old_data->>'company_id')::UUID,
        auth.uid(),
        LOWER(TG_OP),
        TG_TABLE_NAME,
        entity_id,
        new_data,
        old_data
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar gatilho de auditoria em tabelas estratégicas
DROP TRIGGER IF EXISTS tr_audit_properties ON public.properties;
CREATE TRIGGER tr_audit_properties AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS tr_audit_inspections ON public.inspections;
CREATE TRIGGER tr_audit_inspections AFTER INSERT OR UPDATE OR DELETE ON public.inspections
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS tr_audit_warranty ON public.warranty_requests;
CREATE TRIGGER tr_audit_warranty AFTER INSERT OR UPDATE OR DELETE ON public.warranty_requests
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
