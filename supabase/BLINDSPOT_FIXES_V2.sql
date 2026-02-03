-- 1. ENHANCED ASSET MANAGEMENT (REVISIONS & SOFT DELETES)
ALTER TABLE income_ideas ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
ALTER TABLE income_ideas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- Update existing posts to have a status
ALTER TABLE income_ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision', 'rejected'));

ALTER TABLE franchises ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision', 'rejected'));

-- 2. UPDATE EXISTING DATA BASED ON is_approved
UPDATE income_ideas SET status = 'approved' WHERE is_approved = true AND status = 'pending';
UPDATE franchises SET status = 'approved' WHERE is_approved = true AND status = 'pending';

-- 3. GLOBAL FETCH FILTER (SOFT DELETE PROTECTION)
-- We need to update existing SELECT policies to exclude deleted items
DROP POLICY IF EXISTS "Anyone can view free ideas" ON income_ideas;
CREATE POLICY "Anyone can view free ideas"
  ON income_ideas FOR SELECT
  TO authenticated, anon
  USING (is_premium = FALSE AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Premium users can view premium ideas" ON income_ideas;
CREATE POLICY "Premium users can view premium ideas"
  ON income_ideas FOR SELECT
  TO authenticated
  USING (
    is_premium = TRUE 
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_premium = TRUE 
      AND (profiles.premium_until IS NULL OR profiles.premium_until > NOW())
    )
  );

-- Admins can see everything including deleted for audit
DROP POLICY IF EXISTS "Admins can view all ideas" ON income_ideas;
CREATE POLICY "Admins can view all ideas" 
ON income_ideas FOR SELECT 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Similar for Franchises
DROP POLICY IF EXISTS "Anyone can view approved franchises" ON franchises;
CREATE POLICY "Anyone can view approved franchises"
  ON franchises FOR SELECT
  TO authenticated, anon
  USING (is_approved = TRUE AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can view all franchises" ON franchises;
CREATE POLICY "Admins can view all franchises" 
ON franchises FOR SELECT 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
