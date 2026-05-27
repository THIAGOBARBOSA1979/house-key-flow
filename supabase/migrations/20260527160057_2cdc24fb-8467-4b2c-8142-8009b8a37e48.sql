-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    frequency TEXT NOT NULL DEFAULT 'monthly',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_schedules TO authenticated;
GRANT ALL ON public.maintenance_schedules TO service_role;

-- RLS Policy
CREATE POLICY "Users can access their company's maintenance schedules"
ON public.maintenance_schedules
FOR ALL
TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_maintenance_schedules_updated_at
BEFORE UPDATE ON public.maintenance_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
