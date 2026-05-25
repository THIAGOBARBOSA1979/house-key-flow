-- Função helper para obter dados do usuário de forma segura
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (auth.jwt() -> 'user_metadata' ->> 'role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Corrigir políticas de planos
DROP POLICY IF EXISTS "Super admins gerenciam planos" ON public.plans;
CREATE POLICY "Super admins gerenciam planos" ON public.plans
    FOR ALL USING (
        public.get_auth_user_role() = 'super_admin'
    );

-- Corrigir políticas de assinaturas
DROP POLICY IF EXISTS "Usuários veem assinatura da própria empresa" ON public.company_subscriptions;
CREATE POLICY "Usuários veem assinatura da própria empresa" ON public.company_subscriptions
    FOR SELECT USING (
        company_id = public.get_auth_company_id()
    );

DROP POLICY IF EXISTS "Super admins veem todas assinaturas" ON public.company_subscriptions;
CREATE POLICY "Super admins veem todas assinaturas" ON public.company_subscriptions
    FOR SELECT USING (
        public.get_auth_user_role() = 'super_admin'
    );

-- Garantir que a função check_plan_limits use busca segura e obtenha dados corretamente
CREATE OR REPLACE FUNCTION public.check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
    company_plan public.plans%ROWTYPE;
    current_count INTEGER;
    v_company_id UUID;
BEGIN
    v_company_id := public.get_auth_company_id();
    
    IF v_company_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Obter detalhes do plano da empresa
    SELECT p.* INTO company_plan
    FROM public.plans p
    JOIN public.companies c ON c.plan_id = p.id
    WHERE c.id = v_company_id;

    -- Se for super_admin, ignora limites
    IF public.get_auth_user_role() = 'super_admin' THEN
        RETURN NEW;
    END IF;

    -- Verificar limite de propriedades
    IF TG_TABLE_NAME = 'properties' AND TG_OP = 'INSERT' THEN
        IF company_plan.max_properties > 0 THEN
            SELECT count(*) INTO current_count FROM public.properties WHERE company_id = v_company_id;
            IF current_count >= company_plan.max_properties THEN
                RAISE EXCEPTION 'Limite de propriedades atingido para o seu plano.';
            END IF;
        END IF;
    END IF;

    -- Verificar limite de usuários (profiles)
    IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN
        IF company_plan.max_users > 0 THEN
            SELECT count(*) INTO current_count FROM public.profiles WHERE company_id = v_company_id;
            IF current_count >= company_plan.max_users THEN
                RAISE EXCEPTION 'Limite de usuários atingido para o seu plano.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revogar execução pública de funções críticas (já feito parcialmente em migrations anteriores, garantindo aqui)
REVOKE EXECUTE ON FUNCTION public.get_auth_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_auth_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_company_id() TO authenticated;

-- Gatilhos de Auditoria para Empresa e Assinatura
-- (Assumindo que existam tabelas properties e profiles para exemplificar)
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
--         CREATE TRIGGER trigger_check_properties_limit
--         BEFORE INSERT ON public.properties
--         FOR EACH ROW EXECUTE FUNCTION public.check_plan_limits();
--     END IF;
-- END $$;
