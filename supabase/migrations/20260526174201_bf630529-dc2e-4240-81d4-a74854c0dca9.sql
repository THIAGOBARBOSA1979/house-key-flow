-- 1. Funções de Identidade
CREATE OR REPLACE FUNCTION public.get_auth_tenant()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND is_super_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Garantir coluna tenant_id em todas as tabelas operacionais
DO $$ 
DECLARE
    t_name TEXT;
BEGIN 
    FOR t_name IN SELECT unnest(ARRAY['properties', 'inspections', 'non_conformities', 'quality_indicators', 'client_profiles', 'checklist_templates', 'documents', 'notifications', 'warranty_requests']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t_name) THEN
            -- Adicionar tenant_id se não existir
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'tenant_id') THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN tenant_id UUID REFERENCES public.companies(id)', t_name);
                -- Migrar dados de company_id se existir
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'company_id') THEN
                    EXECUTE format('UPDATE public.%I SET tenant_id = company_id', t_name);
                END IF;
            END IF;
        END IF;
    END LOOP;
END $$;

-- 3. Aplicação Universal de RLS
CREATE OR REPLACE FUNCTION public.apply_tenant_isolation(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = p_table_name) THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.%I', p_table_name);
        EXECUTE format('CREATE POLICY "Tenant Isolation Policy" ON public.%I FOR ALL USING (public.is_super_admin() OR tenant_id = public.get_auth_tenant())', p_table_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Executar para as tabelas principais
SELECT public.apply_tenant_isolation('properties');
SELECT public.apply_tenant_isolation('inspections');
SELECT public.apply_tenant_isolation('non_conformities');
SELECT public.apply_tenant_isolation('quality_indicators');
SELECT public.apply_tenant_isolation('client_profiles');
SELECT public.apply_tenant_isolation('checklist_templates');
SELECT public.apply_tenant_isolation('documents');
SELECT public.apply_tenant_isolation('notifications');
SELECT public.apply_tenant_isolation('warranty_requests');

-- 4. Triggers de Auditoria ISO 9001
CREATE OR REPLACE FUNCTION public.audit_tenant_log_v3()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := COALESCE(NEW.tenant_id, NEW.company_id, public.get_auth_tenant());
    
    INSERT INTO public.audit_logs (
        user_id,
        tenant_id,
        company_id,
        action,
        entity_type,
        entity_id,
        payload,
        created_at
    ) VALUES (
        auth.uid(),
        v_tenant_id,
        v_tenant_id,
        TG_OP,
        TG_TABLE_NAME,
        NEW.id::text,
        row_to_json(NEW)::jsonb,
        now()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar triggers em tabelas críticas
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['properties', 'inspections', 'non_conformities', 'warranty_requests', 'companies']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            EXECUTE format('DROP TRIGGER IF EXISTS tr_audit_v3_%I ON public.%I', t, t);
            EXECUTE format('CREATE TRIGGER tr_audit_v3_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_tenant_log_v3()', t, t);
        END IF;
    END LOOP;
END $$;
