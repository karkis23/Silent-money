-- =================================================================================
-- FIX VISIBILITY ISSUES (RLS POLICIES)
-- =================================================================================

-- 1. Enable Public Visibility for Profiles (Required for Reviews to show Author Name)
-- Previous policy was "Users can view own profile". modifying to allow public read.
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- 2. Fix Franchise Reviews RLS
ALTER TABLE franchise_reviews ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to read reviews
DROP POLICY IF EXISTS "Public can view franchise reviews" ON franchise_reviews;
CREATE POLICY "Public can view franchise reviews"
  ON franchise_reviews FOR SELECT
  USING (true);

-- Allow AUTHENTICATED users to write reviews
DROP POLICY IF EXISTS "Authenticated users can insert franchise reviews" ON franchise_reviews;
CREATE POLICY "Authenticated users can insert franchise reviews"
  ON franchise_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow AUTHOR to update/delete their review
DROP POLICY IF EXISTS "Users can update own franchise reviews" ON franchise_reviews;
CREATE POLICY "Users can update own franchise reviews"
  ON franchise_reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own franchise reviews" ON franchise_reviews;
CREATE POLICY "Users can delete own franchise reviews"
  ON franchise_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Fix Income Idea Reviews RLS (Mirroring the above)
ALTER TABLE income_idea_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view idea reviews" ON income_idea_reviews;
CREATE POLICY "Public can view idea reviews"
  ON income_idea_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert idea reviews" ON income_idea_reviews;
CREATE POLICY "Authenticated users can insert idea reviews"
  ON income_idea_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own idea reviews" ON income_idea_reviews;
CREATE POLICY "Users can update own idea reviews"
  ON income_idea_reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own idea reviews" ON income_idea_reviews;
CREATE POLICY "Users can delete own idea reviews"
  ON income_idea_reviews FOR DELETE
  USING (auth.uid() = user_id);
