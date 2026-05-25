-- Upgrade audit_logs table with enterprise fields
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS correlation_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS trace_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info',
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production',
ADD COLUMN IF NOT EXISTS service_name TEXT DEFAULT 'web-platform',
ADD COLUMN IF NOT EXISTS module_name TEXT,
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'web',
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS event_hash TEXT,
ADD COLUMN IF NOT EXISTS is_system_event BOOLEAN DEFAULT false;

-- Create indexes for performance and traceability
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON public.audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_trace_id ON public.audit_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Ensure immutability via RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Remove old policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their company logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs are immutable" ON public.audit_logs;

-- Re-create policies
CREATE POLICY "Users can view their company logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE company_id = audit_logs.company_id 
    AND (role = 'admin' OR role = 'super_admin')
  )
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Allow authenticated inserts" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Explicitly deny updates and deletes (though absence of policy also denies)
CREATE POLICY "Audit logs are immutable" 
ON public.audit_logs 
FOR ALL
USING (false)
WITH CHECK (false);

-- Cryptographic integrity trigger
CREATE OR REPLACE FUNCTION public.fn_audit_log_integrity()
RETURNS TRIGGER AS $$
DECLARE
    prev_hash TEXT;
BEGIN
    -- Get hash of the most recent log for chaining
    SELECT event_hash INTO prev_hash FROM public.audit_logs ORDER BY created_at DESC LIMIT 1;
    
    -- Generate hash for the new record
    NEW.event_hash := md5(concat(
        NEW.id::text, 
        COALESCE(NEW.company_id::text, 'system'),
        COALESCE(NEW.user_id::text, 'system'),
        NEW.action, 
        NEW.entity_type, 
        COALESCE(NEW.payload::text, '{}'), 
        COALESCE(prev_hash, 'genesis')
    ));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_log_integrity
BEFORE INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_log_integrity();

-- Improved log_audit_action function
CREATE OR REPLACE FUNCTION public.log_audit_action(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT DEFAULT NULL,
    p_payload JSONB DEFAULT NULL,
    p_previous_values JSONB DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'info',
    p_module_name TEXT DEFAULT NULL,
    p_correlation_id UUID DEFAULT NULL,
    p_trace_id UUID DEFAULT NULL,
    p_origin TEXT DEFAULT 'web'
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_log_id UUID;
BEGIN
    -- Resolve company_id from current user session
    SELECT company_id INTO v_company_id FROM public.profiles WHERE id = auth.uid();
    
    INSERT INTO public.audit_logs (
        company_id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        payload, 
        previous_values,
        category,
        severity,
        module_name,
        correlation_id,
        trace_id,
        origin
    )
    VALUES (
        v_company_id, 
        auth.uid(), 
        p_action, 
        p_entity_type, 
        p_entity_id, 
        p_payload, 
        p_previous_values,
        p_category,
        p_severity,
        p_module_name,
        COALESCE(p_correlation_id, gen_random_uuid()),
        COALESCE(p_trace_id, gen_random_uuid()),
        p_origin
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function for automatic change tracking
CREATE OR REPLACE FUNCTION public.fn_track_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_user_id UUID;
    v_action TEXT;
    v_entity_id TEXT;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_payload JSONB;
BEGIN
    v_user_id := auth.uid();
    v_action := TG_OP;
    
    IF (TG_OP = 'INSERT') THEN
        v_new_data := to_jsonb(NEW);
        v_entity_id := (v_new_data->>'id')::text;
        -- Try to get company_id from NEW row
        v_company_id := (v_new_data->>'company_id')::uuid;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_entity_id := (v_new_data->>'id')::text;
        v_company_id := (v_new_data->>'company_id')::uuid;
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        v_entity_id := (v_old_data->>'id')::text;
        v_company_id := (v_old_data->>'company_id')::uuid;
    END IF;

    -- If company_id couldn't be resolved from row, try session
    IF v_company_id IS NULL AND v_user_id IS NOT NULL THEN
        SELECT company_id INTO v_company_id FROM public.profiles WHERE id = v_user_id;
    END IF;

    v_payload := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'operation', TG_OP,
        'timestamp', now()
    );

    INSERT INTO public.audit_logs (
        company_id,
        user_id,
        action,
        entity_type,
        entity_id,
        payload,
        previous_values,
        category,
        severity,
        is_system_event
    )
    VALUES (
        v_company_id,
        v_user_id,
        lower(v_action),
        TG_TABLE_NAME,
        v_entity_id,
        v_payload || COALESCE(v_new_data, '{}'::jsonb),
        v_old_data,
        'data_change',
        CASE WHEN TG_OP = 'DELETE' THEN 'warning' ELSE 'info' END,
        false
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to core tables
-- properties
DROP TRIGGER IF EXISTS tr_audit_properties ON public.properties;
CREATE TRIGGER tr_audit_properties
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();

-- inspections
DROP TRIGGER IF EXISTS tr_audit_inspections ON public.inspections;
CREATE TRIGGER tr_audit_inspections
AFTER INSERT OR UPDATE OR DELETE ON public.inspections
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();

-- warranty_requests
DROP TRIGGER IF EXISTS tr_audit_warranty_requests ON public.warranty_requests;
CREATE TRIGGER tr_audit_warranty_requests
AFTER INSERT OR UPDATE OR DELETE ON public.warranty_requests
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();

-- profiles
DROP TRIGGER IF EXISTS tr_audit_profiles ON public.profiles;
CREATE TRIGGER tr_audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();

-- support_tickets
DROP TRIGGER IF EXISTS tr_audit_support_tickets ON public.support_tickets;
CREATE TRIGGER tr_audit_support_tickets
AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();

-- checklist_templates
DROP TRIGGER IF EXISTS tr_audit_checklist_templates ON public.checklist_templates;
CREATE TRIGGER tr_audit_checklist_templates
AFTER INSERT OR UPDATE OR DELETE ON public.checklist_templates
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();

-- system_settings
DROP TRIGGER IF EXISTS tr_audit_system_settings ON public.system_settings;
CREATE TRIGGER tr_audit_system_settings
AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.fn_track_table_changes();
