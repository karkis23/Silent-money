-- POLICY to allow users to add new ideas via the Admin functionality
-- Run this in Supabase SQL Editor

CREATE POLICY "Authenticated users can insert ideas"
ON income_ideas
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
