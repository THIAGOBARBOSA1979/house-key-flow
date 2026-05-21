-- Update properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS units_list JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update warranty_requests table
ALTER TABLE public.warranty_requests
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS problems JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updates JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS stage_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS sla_status TEXT DEFAULT 'on_track';

-- Create warranty_status_history table for better relational tracking (optional but recommended)
-- For now we stick to the JSONB fields used by the service to maintain compatibility

-- Ensure all tables have updated_at trigger
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('properties', 'warranty_requests', 'inspections', 'technicians', 'warranty_sla_configs')
    LOOP
        EXECUTE format('
            CREATE OR REPLACE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();', t, t);
    END LOOP;
END $$;
