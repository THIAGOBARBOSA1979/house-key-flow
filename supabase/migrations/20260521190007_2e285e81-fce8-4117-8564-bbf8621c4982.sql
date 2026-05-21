-- Create client_profiles table
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  current_stage TEXT NOT NULL DEFAULT 'registered',
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_name TEXT,
  unit_number TEXT,
  block TEXT,
  floor TEXT,
  stage_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for client_profiles
CREATE POLICY "Super Admins can do everything on client_profiles"
ON public.client_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admins can manage their company client_profiles"
ON public.client_profiles
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Users can view their own client profile"
ON public.client_profiles
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Indexes
CREATE INDEX idx_client_profiles_company ON public.client_profiles(company_id);
CREATE INDEX idx_client_profiles_user ON public.client_profiles(user_id);
CREATE INDEX idx_client_profiles_property ON public.client_profiles(property_id);

-- Updated at trigger
CREATE TRIGGER handle_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
