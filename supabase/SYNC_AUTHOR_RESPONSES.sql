-- FIX AND SYNC AUTHOR RESPONSES
-- Ensures both Idea and Franchise reviews support owner responses with proper RLS

-- 1. Infrastructure Sync for Franchise Reviews
ALTER TABLE franchise_reviews ADD COLUMN IF NOT EXISTS author_response TEXT;
ALTER TABLE franchise_reviews ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- 2. Robust RLS Policy for Income Idea Reviews
DROP POLICY IF EXISTS "Authors can respond to reviews" ON income_idea_reviews;
CREATE POLICY "Authors can respond to reviews"
ON income_idea_reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM income_ideas 
    WHERE income_ideas.id = income_idea_reviews.idea_id 
    AND income_ideas.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM income_ideas 
    WHERE income_ideas.id = income_idea_reviews.idea_id 
    AND income_ideas.author_id = auth.uid()
  )
);

-- 3. Robust RLS Policy for Franchise Reviews
DROP POLICY IF EXISTS "Franchise owners can respond to reviews" ON franchise_reviews;
CREATE POLICY "Franchise owners can respond to reviews"
ON franchise_reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM franchises 
    WHERE franchises.id = franchise_reviews.franchise_id 
    AND franchises.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM franchises 
    WHERE franchises.id = franchise_reviews.franchise_id 
    AND franchises.author_id = auth.uid()
  )
);
