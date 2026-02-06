-- Enable RLS on franchise_reviews
ALTER TABLE franchise_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
DROP POLICY IF EXISTS "Public can view franchise reviews" ON franchise_reviews;
CREATE POLICY "Public can view franchise reviews"
ON franchise_reviews FOR SELECT
USING (true);

-- Allow authenticated users to insert reviews
DROP POLICY IF EXISTS "Authenticated users can insert franchise reviews" ON franchise_reviews;
CREATE POLICY "Authenticated users can insert franchise reviews"
ON franchise_reviews FOR INSERT
to authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
DROP POLICY IF EXISTS "Users can update own franchise reviews" ON franchise_reviews;
CREATE POLICY "Users can update own franchise reviews"
ON franchise_reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete own franchise reviews" ON franchise_reviews;
CREATE POLICY "Users can delete own franchise reviews"
ON franchise_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Repeat for income_idea_reviews just in case
ALTER TABLE income_idea_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view idea reviews" ON income_idea_reviews;
CREATE POLICY "Public can view idea reviews"
ON income_idea_reviews FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert idea reviews" ON income_idea_reviews;
CREATE POLICY "Authenticated users can insert idea reviews"
ON income_idea_reviews FOR INSERT
to authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own idea reviews" ON income_idea_reviews;
CREATE POLICY "Users can update own idea reviews"
ON income_idea_reviews FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own idea reviews" ON income_idea_reviews;
CREATE POLICY "Users can delete own idea reviews"
ON income_idea_reviews FOR DELETE
USING (auth.uid() = user_id);
