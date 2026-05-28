-- Create client_invoices table
CREATE TABLE public.client_invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    unit_number TEXT,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    invoice_url TEXT,
    barcode TEXT,
    pix_code TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Use GRANT to set permissions for different roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_invoices TO authenticated;
GRANT ALL ON public.client_invoices TO service_role;

-- Enable Row Level Security
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for client access
CREATE POLICY "Clients can view their own invoices" 
ON public.client_invoices 
FOR SELECT 
USING (auth.uid() = client_id);

-- Create policies for admin access (via company_id)
-- Note: Assuming the user's profile linked to the company has admin/manager role
-- Using a subquery on profiles to check role
CREATE POLICY "Admins can manage all invoices for their company" 
ON public.client_invoices 
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.company_id = client_invoices.company_id
        AND profiles.role IN ('admin', 'manager', 'staff')
    )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_invoices_updated_at
BEFORE UPDATE ON public.client_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
