-- Assets table (ISO 55001)
CREATE TABLE public.assets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    installation_date TIMESTAMP WITH TIME ZONE,
    warranty_expiration TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active',
    last_maintenance_date TIMESTAMP WITH TIME ZONE,
    next_maintenance_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view assets for their company" ON public.assets FOR SELECT TO authenticated USING (company_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text)::uuid);
CREATE POLICY "Admins can manage assets" ON public.assets FOR ALL TO authenticated USING (company_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text)::uuid);

-- Invoices table
CREATE TABLE public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    plan_name TEXT NOT NULL,
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invoices for their company" ON public.invoices FOR SELECT TO authenticated USING (company_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text)::uuid);

-- Usage Metrics table
CREATE TABLE public.usage_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    metric_name TEXT NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    limit_value INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.usage_metrics TO authenticated;
GRANT ALL ON public.usage_metrics TO service_role;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view usage metrics for their company" ON public.usage_metrics FOR SELECT TO authenticated USING (company_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text)::uuid);
