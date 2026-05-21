-- Fix for Function Search Path Mutable (Audit Log Function)
ALTER FUNCTION public.log_audit_action(text, text, text, jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Additional RLS Policies for missing tables

-- Checklist Items
CREATE POLICY "Users can view checklist items of their company templates" ON public.checklist_items
    FOR SELECT USING (
        template_id IN (SELECT id FROM public.checklist_templates WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    );

CREATE POLICY "Admins can manage checklist items" ON public.checklist_items
    FOR ALL USING (
        template_id IN (SELECT id FROM public.checklist_templates WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
    );

-- Technicians
CREATE POLICY "Users can view technicians of their company" ON public.technicians
    FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage technicians" ON public.technicians
    FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Construction Updates (Non-Select policies)
CREATE POLICY "Admins can manage construction updates" ON public.construction_updates
    FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Warranty History
CREATE POLICY "Users can view history of their accessible warranty requests" ON public.warranty_history
    FOR SELECT USING (
        request_id IN (SELECT id FROM public.warranty_requests WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    );

CREATE POLICY "System/Admins can insert history" ON public.warranty_history
    FOR INSERT WITH CHECK (
        request_id IN (SELECT id FROM public.warranty_requests WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    );

-- Support Messages
CREATE POLICY "Users can view messages of their company" ON public.support_messages
    FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can send messages" ON public.support_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Fix for potentially permissive policies
-- Ensure Documents management is restricted
CREATE POLICY "Admins can manage documents" ON public.documents
    FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
