-- Add author_id to income_ideas table
ALTER TABLE income_ideas ADD COLUMN author_id UUID REFERENCES auth.users(id);

-- Update RLS policies for deletion
-- Allow users to delete their own ideas
CREATE POLICY "Users can delete own ideas"
ON income_ideas
FOR DELETE
USING (auth.uid() = author_id);

-- Allow users to update their own ideas (optional, but good to have)
CREATE POLICY "Users can update own ideas"
ON income_ideas
FOR UPDATE
USING (auth.uid() = author_id);
