-- Índices para Properties
CREATE INDEX IF NOT EXISTS idx_properties_company_id ON public.properties (company_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_manager_id ON public.properties (manager_id);

-- Índices para Inspections
CREATE INDEX IF NOT EXISTS idx_inspections_company_id ON public.inspections (company_id);
CREATE INDEX IF NOT EXISTS idx_inspections_property_id ON public.inspections (property_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections (status);
CREATE INDEX IF NOT EXISTS idx_inspections_technician_id ON public.inspections (technician_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON public.inspections (date DESC);

-- Índices para Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles (company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);

-- Índices para Audit Logs (Tabela de alto crescimento)
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs (company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);

-- Verificar e criar para tabelas que podem existir mas não foram listadas no subset inicial
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'warranty_claims') THEN
        CREATE INDEX IF NOT EXISTS idx_warranty_claims_company_id ON public.warranty_claims (company_id);
        CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON public.warranty_claims (status);
        CREATE INDEX IF NOT EXISTS idx_warranty_claims_property_id ON public.warranty_claims (property_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointments') THEN
        CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON public.appointments (company_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
        CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date DESC);
    END IF;
END $$;