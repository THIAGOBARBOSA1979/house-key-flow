-- Create client_events table if not exists
CREATE TABLE IF NOT EXISTS public.client_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL, -- Reference to client_profiles.id
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.client_events ENABLE ROW LEVEL SECURITY;

-- Policies for client_events
CREATE POLICY "Users can view events for their company"
ON public.client_events FOR SELECT
USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE (raw_user_meta_data->>'company_id')::uuid = company_id
));

CREATE POLICY "Admins can manage events"
ON public.client_events FOR ALL
USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE (raw_user_meta_data->>'role') IN ('admin', 'super_admin')
));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_events;

-- Ensure client_profiles has necessary columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client_profiles' AND column_name='phone') THEN
        ALTER TABLE public.client_profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client_profiles' AND column_name='notes') THEN
        ALTER TABLE public.client_profiles ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client_profiles' AND column_name='governance_metadata') THEN
        ALTER TABLE public.client_profiles ADD COLUMN governance_metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
