-- Create warranty_items table if not exists
CREATE TABLE IF NOT EXISTS public.warranty_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID,
    property_name TEXT,
    unit_number TEXT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativa',
    warranty_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.warranty_items ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own warranty items' AND tablename = 'warranty_items') THEN
        CREATE POLICY "Users can view their own warranty items"
            ON public.warranty_items FOR SELECT
            USING (auth.uid() = client_id OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')
            ));
    END IF;
END $$;

-- Table warranty_requests might already exist, ensure columns are correct
DO $$ 
BEGIN
    -- Only create if not exists, but handle potential existing table from previous partial migration
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warranty_requests' AND table_schema = 'public') THEN
        CREATE TABLE public.warranty_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
            client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            warranty_item_id UUID REFERENCES public.warranty_items(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'opened',
            stage_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            assigned_technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            sla_deadline TIMESTAMP WITH TIME ZONE,
            estimated_cost DECIMAL(12,2),
            actual_cost DECIMAL(12,2),
            internal_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        ALTER TABLE public.warranty_requests ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own requests' AND tablename = 'warranty_requests') THEN
        CREATE POLICY "Users can view their own requests"
            ON public.warranty_requests FOR SELECT
            USING (auth.uid() = client_id OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND (profiles.role IN ('admin', 'master') OR profiles.id = assigned_technician_id)
            ));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own requests' AND tablename = 'warranty_requests') THEN
        CREATE POLICY "Users can create their own requests"
            ON public.warranty_requests FOR INSERT
            WITH CHECK (auth.uid() = client_id);
    END IF;
END $$;

-- Create problem breakdown table
CREATE TABLE IF NOT EXISTS public.warranty_problem_breakdown (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.warranty_requests(id) ON DELETE CASCADE,
    category TEXT,
    location TEXT,
    description TEXT,
    severity TEXT,
    status TEXT DEFAULT 'pending',
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.warranty_problem_breakdown ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Access to problem breakdown follows request policy' AND tablename = 'warranty_problem_breakdown') THEN
        CREATE POLICY "Access to problem breakdown follows request policy"
            ON public.warranty_problem_breakdown FOR ALL
            USING (EXISTS (
                SELECT 1 FROM public.warranty_requests
                WHERE warranty_requests.id = request_id AND (
                    warranty_requests.client_id = auth.uid() OR 
                    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
                )
            ));
    END IF;
END $$;

-- Create status history table
CREATE TABLE IF NOT EXISTS public.warranty_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.warranty_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    is_automatic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.warranty_status_history ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Access to history follows request policy' AND tablename = 'warranty_status_history') THEN
        CREATE POLICY "Access to history follows request policy"
            ON public.warranty_status_history FOR SELECT
            USING (EXISTS (
                SELECT 1 FROM public.warranty_requests
                WHERE warranty_requests.id = request_id AND (
                    warranty_requests.client_id = auth.uid() OR 
                    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
                )
            ));
    END IF;
END $$;

-- Triggers for updated_at (using DROP IF EXISTS to be safe)
DROP TRIGGER IF EXISTS update_warranty_items_updated_at ON public.warranty_items;
CREATE TRIGGER update_warranty_items_updated_at BEFORE UPDATE ON public.warranty_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warranty_requests_updated_at ON public.warranty_requests;
CREATE TRIGGER update_warranty_requests_updated_at BEFORE UPDATE ON public.warranty_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warranty_problem_breakdown_updated_at ON public.warranty_problem_breakdown;
CREATE TRIGGER update_warranty_problem_breakdown_updated_at BEFORE UPDATE ON public.warranty_problem_breakdown FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
