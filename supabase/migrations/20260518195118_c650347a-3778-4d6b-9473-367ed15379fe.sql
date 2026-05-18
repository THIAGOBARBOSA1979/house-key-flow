-- Add columns to profiles safely
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_super_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
        ALTER TABLE public.profiles ADD COLUMN company_id UUID;
    END IF;
END $$;

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    subscription_plan TEXT NOT NULL DEFAULT 'basic',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Core business tables association
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'company_id') THEN
        ALTER TABLE public.properties ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inspections' AND column_name = 'company_id') THEN
        ALTER TABLE public.inspections ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
    DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
    DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
    DROP POLICY IF EXISTS "Super admins can manage all properties" ON public.properties;
    DROP POLICY IF EXISTS "Users can manage properties in their company" ON public.properties;
    DROP POLICY IF EXISTS "Super admins can manage all inspections" ON public.inspections;
    DROP POLICY IF EXISTS "Users can manage inspections in their company" ON public.inspections;
END $$;

-- Create policies
CREATE POLICY "Super admins can manage all companies" ON public.companies USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Super admins can manage all profiles" ON public.profiles USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view profiles in their company" ON public.profiles FOR SELECT USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Super admins can manage all properties" ON public.properties USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage properties in their company" ON public.properties USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Super admins can manage all inspections" ON public.inspections USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage inspections in their company" ON public.inspections USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));