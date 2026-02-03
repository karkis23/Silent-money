-- 1. STORAGE BUCKETS
-- Create buckets for assets and verification proof
-- Note: Run this in Supabase Dashboard if the extension isn't enabled
-- insert into storage.buckets (id, name, public) values ('assets', 'assets', true);
-- insert into storage.buckets (id, name, public) values ('proofs', 'proofs', false);

-- 2. ADD PROOF & ASSET COLUMNS
ALTER TABLE income_ideas ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE income_ideas ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS proof_url TEXT;
-- franchises already has image_url based on previous schema reviews

-- 3. ADMIN SECURITY TRIGGER
-- Prevent users from elevating their own status
CREATE OR REPLACE FUNCTION protect_user_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is NOT an admin, they cannot change is_admin or is_premium
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
        IF NEW.is_admin <> OLD.is_admin OR NEW.is_premium <> OLD.is_premium THEN
            NEW.is_admin = OLD.is_admin;
            NEW.is_premium = OLD.is_premium;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_protect_roles ON profiles;
CREATE TRIGGER on_profile_update_protect_roles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION protect_user_roles();

-- 4. RLS FOR PROOFS (Strict Access)
-- Only the author and admins can see proof_url
-- We enforce this by having proof_url in a separate private bucket, 
-- but we also add a policy for the columns if needed (not directly possible on columns in Postgres standard RLS, 
-- so we handle visibility in the bucket policies)

-- Storage Policies (Run in SQL Editor)
-- Policy for Assets Bucket (Public Read, Authenticated Insert)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'assets' );
-- CREATE POLICY "User Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'assets' AND auth.role() = 'authenticated' );

-- Policy for Proofs Bucket (Admin/Author ONLY)
-- CREATE POLICY "Admin/Author Proof Access" ON storage.objects FOR SELECT 
-- USING ( bucket_id = 'proofs' AND (auth.uid() = owner OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)));
