-- Add policy for clients to view their property's maintenance schedules
CREATE POLICY "Clients can view maintenance schedules for their property" 
ON public.maintenance_schedules 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.client_profiles 
        WHERE client_profiles.user_id = auth.uid() 
        AND client_profiles.property_id = maintenance_schedules.property_id
    )
);

GRANT SELECT ON public.maintenance_schedules TO authenticated;
