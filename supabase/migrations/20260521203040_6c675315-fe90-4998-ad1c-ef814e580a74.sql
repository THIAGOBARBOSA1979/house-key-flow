-- Create table for SLA configurations
CREATE TABLE IF NOT EXISTS public.warranty_sla_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    warranty_type TEXT NOT NULL,
    analysis_hours INTEGER NOT NULL DEFAULT 48,
    inspection_hours INTEGER NOT NULL DEFAULT 72,
    decision_hours INTEGER NOT NULL DEFAULT 24,
    execution_hours INTEGER NOT NULL DEFAULT 168,
    total_hours INTEGER NOT NULL DEFAULT 312,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id, warranty_type)
);

-- Enable RLS
ALTER TABLE public.warranty_sla_configs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "SLA configs are viewable by authenticated users"
ON public.warranty_sla_configs FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage SLA configs"
ON public.warranty_sla_configs FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'master')
));

-- Insert default configurations
INSERT INTO public.warranty_sla_configs (warranty_type, analysis_hours, inspection_hours, decision_hours, execution_hours, total_hours)
VALUES 
('Estrutura', 72, 120, 48, 720, 960),
('Instalações Hidráulicas', 48, 72, 24, 168, 312),
('Instalações Elétricas', 48, 72, 24, 168, 312),
('Impermeabilização', 72, 120, 48, 360, 600),
('Revestimentos e Acabamentos', 48, 72, 24, 120, 264),
('Esquadrias e Vidros', 48, 72, 24, 240, 384),
('Equipamentos e Máquinas', 48, 72, 24, 168, 312),
('Pintura', 48, 72, 24, 120, 264)
ON CONFLICT DO NOTHING;
