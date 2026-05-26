-- 1. Melhorar a tabela de empresas para suporte a Multi-tenant e White Label
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{"primary": "#0f172a", "secondary": "#64748b", "radius": "0.5rem"}'::jsonb;

-- Criar índices para busca rápida de tenant
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON public.companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_custom_domain ON public.companies(custom_domain);

-- 2. Sistema de Permissões (RBAC)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- ex: 'users.create'
    description TEXT,
    module TEXT NOT NULL, -- ex: 'users', 'maintenance'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL, -- 'admin', 'manager', 'staff', etc.
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    UNIQUE(role, permission_id)
);

-- Inserir permissões básicas
INSERT INTO public.permissions (name, description, module) VALUES
('users.view', 'Ver usuários', 'users'),
('users.manage', 'Gerenciar usuários', 'users'),
('maintenance.view', 'Ver chamados', 'maintenance'),
('maintenance.create', 'Criar chamados', 'maintenance'),
('maintenance.manage', 'Gerenciar chamados', 'maintenance'),
('reports.view', 'Ver relatórios', 'reports'),
('settings.manage', 'Gerenciar configurações da empresa', 'settings'),
('saas.admin', 'Acesso total ao Super Admin', 'system')
ON CONFLICT (name) DO NOTHING;

-- 3. Garantir GRANTs para as novas tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

-- 4. Melhorar Rastreabilidade (Audit Logs)
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.companies(id);

-- 5. Atualizar chamados para conformidade SLA (ISO 9001)
-- Assumindo que a tabela de chamados se chama 'maintenance_requests' ou similar
-- Vou verificar se existe e adicionar campos de SLA
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'maintenance_requests') THEN
        ALTER TABLE public.maintenance_requests 
        ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS sla_status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS quality_rating INTEGER,
        ADD COLUMN IF NOT EXISTS non_conformity_record TEXT;
    END IF;
END $$;

-- 6. Habilitar RLS e criar políticas de Tenant
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissões visíveis por todos autenticados" 
ON public.permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mapeamento de roles visível por todos autenticados" 
ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- Política Global de Tenant para tabelas existentes (Exemplo para companies)
-- Usuários só veem sua própria empresa, Super Admin vê todas
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Tenant isolation for companies" 
ON public.companies FOR SELECT 
TO authenticated 
USING (
    id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);
