-- 1. População de Role Permissions (RBAC)
-- Limpar role_permissions existentes para evitar duplicatas
DELETE FROM public.role_permissions;

-- Admin: Acesso total ao tenant
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions WHERE name IN ('users.manage', 'users.view', 'maintenance.manage', 'maintenance.view', 'maintenance.create', 'reports.view', 'settings.manage');

-- Manager: Acesso quase total
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions WHERE name IN ('users.view', 'maintenance.manage', 'maintenance.view', 'maintenance.create', 'reports.view', 'settings.manage');

-- Staff: Operacional
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'staff', id FROM public.permissions WHERE name IN ('maintenance.view', 'maintenance.create', 'maintenance.manage');

-- Technical: Técnico de campo
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'technical', id FROM public.permissions WHERE name IN ('maintenance.view', 'maintenance.manage');

-- User: Cliente final
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'user', id FROM public.permissions WHERE name IN ('maintenance.view', 'maintenance.create');


-- 2. Tabela de Não Conformidades (ISO 9001 / ABNT)
CREATE TABLE IF NOT EXISTS public.non_conformities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    origin TEXT NOT NULL, -- 'inspection', 'warranty', 'audit', 'customer_complaint'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'corrective_action', 'closed'
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    root_cause TEXT,
    corrective_action TEXT,
    prevention_plan TEXT,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS e permissões
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.non_conformities TO authenticated;
GRANT ALL ON public.non_conformities TO service_role;

-- Políticas de RLS
CREATE POLICY "Users can view their company non_conformities" 
ON public.non_conformities FOR SELECT 
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage non_conformities" 
ON public.non_conformities FOR ALL 
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));


-- 3. Tabela de Indicadores de Qualidade e SLA
CREATE TABLE IF NOT EXISTS public.quality_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    target_value NUMERIC,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.quality_indicators ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.quality_indicators TO authenticated;
GRANT ALL ON public.quality_indicators TO service_role;

CREATE POLICY "Users can view their company indicators" 
ON public.quality_indicators FOR SELECT 
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));


-- 4. Adicionar triggers de auditoria para as novas tabelas
-- Assumindo que a função audit_trigger_func já existe (padrão do sistema)
-- Caso contrário, vamos criar uma simples
CREATE OR REPLACE FUNCTION public.audit_new_records()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.log_audit_action(
        TG_OP, 
        TG_TABLE_NAME, 
        NEW.id::text, 
        row_to_json(NEW)::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_non_conformities
AFTER INSERT OR UPDATE ON public.non_conformities
FOR EACH ROW EXECUTE FUNCTION public.audit_new_records();


-- 5. Garantir que a tabela de companies tenha subdomínio e domínio customizado únicos
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_subdomain_key;
ALTER TABLE public.companies ADD CONSTRAINT companies_subdomain_key UNIQUE (subdomain);
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_custom_domain_key;
ALTER TABLE public.companies ADD CONSTRAINT companies_custom_domain_key UNIQUE (custom_domain);

-- Index para busca rápida de tenant
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON public.companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_custom_domain ON public.companies(custom_domain);
