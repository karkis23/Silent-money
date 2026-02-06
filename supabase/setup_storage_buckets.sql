-- Create storage buckets for various asset types
-- Ensure they are public for viewing but require authentication for uploading

-- 1. Create 'assets' bucket (default)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'franchises' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('franchises', 'franchises', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create 'proofs' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Standard Policies for Storage

-- Policy for 'assets'
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Policy for 'franchises'
CREATE POLICY "Franchise Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'franchises');
CREATE POLICY "Franchise Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'franchises' AND auth.role() = 'authenticated');
CREATE POLICY "Franchise Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'franchises' AND auth.role() = 'authenticated');

-- Policy for 'proofs'
CREATE POLICY "Proofs Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'proofs');
CREATE POLICY "Proofs Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proofs' AND auth.role() = 'authenticated');
CREATE POLICY "Proofs Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'proofs' AND auth.role() = 'authenticated');
