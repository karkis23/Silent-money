-- USER SAVED FRANCHISES
CREATE TABLE IF NOT EXISTS user_saved_franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, franchise_id)
);

-- Enable RLS
ALTER TABLE user_saved_franchises ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own saved franchises" ON user_saved_franchises;
CREATE POLICY "Users can view own saved franchises" ON user_saved_franchises FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved franchises" ON user_saved_franchises;
CREATE POLICY "Users can insert own saved franchises" ON user_saved_franchises FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved franchises" ON user_saved_franchises;
CREATE POLICY "Users can delete own franchises" ON user_saved_franchises FOR DELETE TO authenticated USING (auth.uid() = user_id);
