-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    category TEXT NOT NULL DEFAULT 'other',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own company tickets"
ON public.support_tickets
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE company_id = support_tickets.company_id 
        AND (role IN ('admin', 'manager', 'staff') OR is_super_admin = true)
    )
    OR auth.uid() = client_id
);

CREATE POLICY "Clients can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their company tickets"
ON public.support_tickets
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE company_id = support_tickets.company_id 
        AND (role IN ('admin', 'manager', 'staff') OR is_super_admin = true)
    )
    OR auth.uid() = client_id
);

-- Add updated_at trigger
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
