-- ADD AUTHOR RESPONSE CAPABILITY
-- Run this in Supabase SQL Editor

-- 1. Add author_response and responded_at columns to reviews
ALTER TABLE income_idea_reviews ADD COLUMN IF NOT EXISTS author_response TEXT;
ALTER TABLE income_idea_reviews ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- 2. Create policy to allow authors to update reviews (only for their responses)
-- First, we need to know who the author of the idea is.
-- This requires a join or a subquery.
DROP POLICY IF EXISTS "Authors can respond to reviews" ON income_idea_reviews;
CREATE POLICY "Authors can respond to reviews"
ON income_idea_reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM income_ideas 
    WHERE income_ideas.id = idea_id 
    AND income_ideas.author_id = auth.uid()
  )
);
