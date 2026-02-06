-- Enable DELETE operation for Admins on income_ideas and franchises tables
-- This fixes the issue where "Permanent Delete" would silently fail due to RLS policies

-- 1. Policy for income_ideas
DROP POLICY IF EXISTS "Admins can delete income_ideas" ON income_ideas;
CREATE POLICY "Admins can delete income_ideas"
ON income_ideas
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 2. Policy for franchises
DROP POLICY IF EXISTS "Admins can delete franchises" ON franchises;
CREATE POLICY "Admins can delete franchises"
ON franchises
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 3. Policy for categories (already exists? let's ensure it)
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
ON categories
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 4. Policy for stories (success stories)
DROP POLICY IF EXISTS "Admins can delete stories" ON stories;
CREATE POLICY "Admins can delete stories"
ON stories
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
