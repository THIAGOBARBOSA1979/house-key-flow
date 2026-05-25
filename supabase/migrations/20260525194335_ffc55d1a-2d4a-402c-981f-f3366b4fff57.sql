-- Tabela de Planos
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    max_properties INTEGER NOT NULL DEFAULT 0, -- 0 = ilimitado
    max_users INTEGER NOT NULL DEFAULT 0,
    max_storage_mb INTEGER NOT NULL DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para planos
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Planos são visíveis para todos (público)
CREATE POLICY "Planos são visíveis para todos" ON public.plans
    FOR SELECT USING (true);

-- Apenas super admins podem gerenciar planos
CREATE POLICY "Super admins gerenciam planos" ON public.plans
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- Atualizar a tabela de empresas para incluir o plano atual
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'suspended'));
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Tabela de Assinaturas (Histórico e Detalhes de Pagamento)
CREATE TABLE public.company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para assinaturas
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver a assinatura da sua própria empresa
CREATE POLICY "Usuários veem assinatura da própria empresa" ON public.company_subscriptions
    FOR SELECT USING (
        company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
    );

-- Super admins veem tudo
CREATE POLICY "Super admins veem todas assinaturas" ON public.company_subscriptions
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- Inserir planos iniciais
INSERT INTO public.plans (name, description, price_monthly, price_yearly, max_properties, max_users, max_storage_mb, features)
VALUES 
('Trial', 'Período de teste gratuito', 0.00, 0.00, 5, 2, 500, '["Suporte básico", "Gestão de propriedades"]'),
('Essencial', 'Para pequenas administradoras', 199.00, 1990.00, 50, 5, 5000, '["Suporte prioritário", "Gestão de propriedades", "Vistorias ilimitadas"]'),
('Profissional', 'Para empresas em crescimento', 499.00, 4990.00, 200, 15, 20000, '["Suporte 24/7", "Personalização de marca", "Relatórios avançados"]'),
('Enterprise', 'Solução completa sob medida', 999.00, 9990.00, 0, 0, 0, '["Tudo ilimitado", "Gerente de conta dedicado", "API Access"]');

-- Função para verificar limites do plano
CREATE OR REPLACE FUNCTION public.check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
    company_plan public.plans%ROWTYPE;
    current_count INTEGER;
    company_id UUID;
BEGIN
    -- Obter o company_id do contexto (metadados do JWT)
    company_id := (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid;
    
    IF company_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Obter detalhes do plano da empresa
    SELECT p.* INTO company_plan
    FROM public.plans p
    JOIN public.companies c ON c.plan_id = p.id
    WHERE c.id = company_id;

    -- Se for super_admin, ignora limites
    IF (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' THEN
        RETURN NEW;
    END IF;

    -- Verificar limite de propriedades
    IF TG_TABLE_NAME = 'properties' AND TG_OP = 'INSERT' THEN
        IF company_plan.max_properties > 0 THEN
            SELECT count(*) INTO current_count FROM public.properties WHERE company_id = company_id;
            IF current_count >= company_plan.max_properties THEN
                RAISE EXCEPTION 'Limite de propriedades atingido para o seu plano.';
            END IF;
        END IF;
    END IF;

    -- Verificar limite de usuários
    IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN
        IF company_plan.max_users > 0 THEN
            SELECT count(*) INTO current_count FROM public.profiles WHERE company_id = company_id;
            IF current_count >= company_plan.max_users THEN
                RAISE EXCEPTION 'Limite de usuários atingido para o seu plano.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar gatilhos para validar limites (exemplo para propriedades)
-- Nota: Supondo que a tabela seja 'properties' e tenha 'company_id'
-- CREATE TRIGGER trigger_check_properties_limit
-- BEFORE INSERT ON public.properties
-- FOR EACH ROW EXECUTE FUNCTION public.check_plan_limits();
