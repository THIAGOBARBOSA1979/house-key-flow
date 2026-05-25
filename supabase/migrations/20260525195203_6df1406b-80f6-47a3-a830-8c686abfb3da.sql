-- 1. Limpeza de tabelas para garantir consistência (conforme erro anterior de criação parcial)
DROP TABLE IF EXISTS public.webhook_endpoints CASCADE;
DROP TABLE IF EXISTS public.ticket_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.whatsapp_configs CASCADE;

-- 2. Criação das Tabelas
CREATE TABLE public.whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('evolution', 'meta')),
    api_url TEXT,
    api_key TEXT,
    instance_name TEXT,
    phone_number_id TEXT,
    verify_token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id)
);

CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol TEXT NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id),
    property_id UUID REFERENCES public.properties(id),
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'analyzing', 'executing', 'waiting_provider', 'resolved', 'reopened')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES public.profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('staff', 'client', 'system', 'ia')),
    content TEXT NOT NULL,
    whatsapp_message_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] DEFAULT '{}'::text[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Tenant (Isolamento)
CREATE POLICY "Tenant config access" ON public.whatsapp_configs FOR ALL USING (company_id = public.get_auth_company_id());
CREATE POLICY "Tenant ticket access" ON public.support_tickets FOR ALL USING (company_id = public.get_auth_company_id());
CREATE POLICY "Tenant message access" ON public.ticket_messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets t 
        WHERE t.id = ticket_messages.ticket_id 
        AND t.company_id = public.get_auth_company_id()
    )
);
CREATE POLICY "Tenant webhook access" ON public.webhook_endpoints FOR ALL USING (company_id = public.get_auth_company_id());

-- 5. Função para gerar protocolo único
CREATE OR REPLACE FUNCTION public.generate_ticket_protocol()
RETURNS TRIGGER AS $$
DECLARE
    v_year TEXT;
    v_seq TEXT;
BEGIN
    v_year := to_char(now(), 'YYYY');
    SELECT lpad((count(*) + 1)::text, 6, '0') INTO v_seq FROM public.support_tickets WHERE to_char(created_at, 'YYYY') = v_year;
    NEW.protocol := v_year || '-' || v_seq;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Trigger para Protocolo
CREATE TRIGGER trigger_generate_protocol
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_protocol();
