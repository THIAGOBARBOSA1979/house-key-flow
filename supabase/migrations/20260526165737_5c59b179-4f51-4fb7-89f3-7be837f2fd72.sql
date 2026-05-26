-- Adicionar company_id em tabelas que faltam para isolamento direto
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.warranty_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.warranty_status_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.inspection_drafts ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Habilitar RLS em todas as tabelas críticas
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para extrair company_id do JWT com segurança
CREATE OR REPLACE FUNCTION public.get_auth_company_id() 
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'company_id', '')::uuid;
$$ LANGUAGE SQL STABLE;

-- Função auxiliar para checar se é Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin() 
RETURNS BOOLEAN AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'super_admin';
$$ LANGUAGE SQL STABLE;

-- Criar políticas genéricas de Tenant
-- Exemplo para 'properties'
DROP POLICY IF EXISTS "Tenant isolation for properties" ON public.properties;
CREATE POLICY "Tenant isolation for properties" 
ON public.properties FOR ALL 
TO authenticated 
USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Replicar política para outras tabelas
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY[
        'inspections', 'documents', 'support_tickets', 
        'support_messages', 'warranty_requests', 'warranty_items', 
        'technicians', 'checklist_templates', 'checklist_items',
        'profiles', 'audit_logs', 'client_events', 'client_profiles',
        'construction_updates', 'ticket_messages', 'warranty_history'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Tenant isolation for %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Tenant isolation for %I" ON public.%I FOR ALL TO authenticated USING (company_id = public.get_auth_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin())', t, t);
    END LOOP;
END $$;

-- Política para a tabela 'companies' (usuários só veem a sua)
DROP POLICY IF EXISTS "Tenant isolation for companies" ON public.companies;
CREATE POLICY "Tenant isolation for companies" 
ON public.companies FOR SELECT 
TO authenticated 
USING (id = public.get_auth_company_id() OR public.is_super_admin());

-- Garantir GRANTs
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
