-- Test script for Multi-tenant RLS isolation
BEGIN;

-- 1. Setup test data
INSERT INTO public.companies (id, name, slug, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Tenant A', 'tenant-a', 'active'),
       ('00000000-0000-0000-0000-000000000002', 'Tenant B', 'tenant-b', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, tenant_id)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'User A', 'admin', '00000000-0000-0000-0000-000000000001'),
       ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'User B', 'admin', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id, name, tenant_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'Property A', '00000000-0000-0000-0000-000000000001'),
       ('22222222-2222-2222-2222-222222222222', 'Property B', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 2. Test User A (Tenant A)
SET LOCAL auth.uid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET LOCAL role = 'authenticated';

DO $$
BEGIN
    IF (SELECT count(*) FROM public.properties) != 1 THEN
        RAISE EXCEPTION 'RLS Failure: User A should only see 1 property, saw %', (SELECT count(*) FROM public.properties);
    END IF;
    
    IF (SELECT name FROM public.properties LIMIT 1) != 'Property A' THEN
        RAISE EXCEPTION 'RLS Failure: User A saw wrong property: %', (SELECT name FROM public.properties LIMIT 1);
    END IF;
END $$;

-- 3. Test User B (Tenant B)
SET LOCAL auth.uid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

DO $$
BEGIN
    IF (SELECT count(*) FROM public.properties) != 1 THEN
        RAISE EXCEPTION 'RLS Failure: User B should only see 1 property, saw %', (SELECT count(*) FROM public.properties);
    END IF;
    
    IF (SELECT name FROM public.properties LIMIT 1) != 'Property B' THEN
        RAISE EXCEPTION 'RLS Failure: User B saw wrong property: %', (SELECT name FROM public.properties LIMIT 1);
    END IF;
END $$;

-- 4. Test Super Admin
SET LOCAL auth.uid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; -- Same user
UPDATE public.profiles SET is_super_admin = true WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

DO $$
BEGIN
    IF (SELECT count(*) FROM public.properties) < 2 THEN
        RAISE EXCEPTION 'RLS Failure: Super Admin should see all properties, saw %', (SELECT count(*) FROM public.properties);
    END IF;
END $$;

ROLLBACK;
SELECT 'Multi-tenant RLS tests passed successfully!' as result;
