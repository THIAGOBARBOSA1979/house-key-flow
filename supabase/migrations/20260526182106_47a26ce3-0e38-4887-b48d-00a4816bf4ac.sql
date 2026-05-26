CREATE OR REPLACE FUNCTION public.audit_tenant_log_v3()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_data := to_jsonb(OLD);
    ELSE
        v_data := to_jsonb(NEW);
    END IF;

    -- Try to get tenant_id from the record, fallback to company_id, then to auth user's tenant
    BEGIN
        v_tenant_id := (v_data->>'tenant_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_tenant_id := NULL;
    END;

    IF v_tenant_id IS NULL THEN
        BEGIN
            v_tenant_id := (v_data->>'company_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_tenant_id := NULL;
        END;
    END IF;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := public.get_auth_tenant();
    END IF;
    
    INSERT INTO public.audit_logs (
        user_id,
        tenant_id,
        action,
        entity_type,
        entity_id,
        payload,
        created_at
    ) VALUES (
        auth.uid(),
        v_tenant_id,
        TG_OP,
        TG_TABLE_NAME,
        v_data->>'id',
        v_data,
        now()
    );
    
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;