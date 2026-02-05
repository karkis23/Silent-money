-- ENRICH USER PROFILES WITH INVESTOR INTELLIGENCE
-- Adds fields for personalized recommendations and automated asset matching.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS investment_budget TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
ADD COLUMN IF NOT EXISTS preferred_sectors TEXT[],
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"audits": true, "new_assets": true, "system": true}'::jsonb,
ADD COLUMN IF NOT EXISTS income_goal NUMERIC DEFAULT 100000;

-- TACTICAL FLEET STATUS TRACKING
-- Adds mission-critical status states to saved assets for lifecycle management.

-- 1. FIX USER_SAVED_IDEAS (Drop old check constraint if exists and update status column)
-- The original table had a lowercase-only check constraint. We normalize to capitalized states for the new HUD.
ALTER TABLE user_saved_ideas DROP CONSTRAINT IF EXISTS user_saved_ideas_status_check;
ALTER TABLE user_saved_ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Interested';

-- 2. FIX USER_SAVED_FRANCHISES (Add status column and update policy)
ALTER TABLE user_saved_franchises ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Interested';

-- Ensure RLS allows the user to update their own saved franchises (Missing in original setup)
DROP POLICY IF EXISTS "Users can update own saved franchises" ON user_saved_franchises;
CREATE POLICY "Users can update own saved franchises" ON user_saved_franchises 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

-- Ensure RLS allows the user to update their own saved ideas (Reinforce existing)
DROP POLICY IF EXISTS "Users can update own saved ideas" ON user_saved_ideas;
CREATE POLICY "Users can update own saved ideas" ON user_saved_ideas 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

-- Ensure existing statuses are normalized if needed
UPDATE user_saved_ideas SET status = 'Interested' WHERE status IS NULL;
UPDATE user_saved_franchises SET status = 'Interested' WHERE status IS NULL;
