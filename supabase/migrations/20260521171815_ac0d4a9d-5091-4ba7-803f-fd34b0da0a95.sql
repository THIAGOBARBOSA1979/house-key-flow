-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('inspections-photos', 'inspections-photos', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;

-- Policies for inspections-photos
CREATE POLICY "Allow authenticated users to upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inspections-photos');

CREATE POLICY "Allow users to view their own company photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'inspections-photos');

-- Policies for documents
CREATE POLICY "Allow authenticated users to manage documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents');
