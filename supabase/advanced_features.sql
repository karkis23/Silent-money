-- 📦 ADVANCED FEATURES SETUP
-- Run this in your Supabase SQL Editor

-- 1. PROFILE ENHANCEMENTS
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- 2. UPVOTING SYSTEM
CREATE TABLE IF NOT EXISTS income_ideas_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES income_ideas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

ALTER TABLE income_ideas_votes ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can vote
DROP POLICY IF EXISTS "Users can view all votes" ON income_ideas_votes;
CREATE POLICY "Users can view all votes" ON income_ideas_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote for ideas" ON income_ideas_votes;
CREATE POLICY "Users can vote for ideas" ON income_ideas_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their vote" ON income_ideas_votes;
CREATE POLICY "Users can remove their vote" ON income_ideas_votes FOR DELETE USING (auth.uid() = user_id);

-- 3. UPDATING INCOME IDEAS FOR VOTE COUNTS (Performance)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='income_ideas' AND column_name='upvotes_count') THEN
    ALTER TABLE income_ideas ADD COLUMN upvotes_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. TRIGGER TO SYNC VOTE COUNT
CREATE OR REPLACE FUNCTION update_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE income_ideas SET upvotes_count = upvotes_count + 1 WHERE id = NEW.idea_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE income_ideas SET upvotes_count = upvotes_count - 1 WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_change ON income_ideas_votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON income_ideas_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_upvotes_count();
