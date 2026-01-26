-- FIX PROFILES AND RELATIONSHIPS
-- Run this in Supabase SQL Editor

-- 1. Enable Public Profile Viewing
-- Everyone (logged in or not) needs to see name and avatar to view authored content
DROP POLICY IF EXISTS "Anyone can view public profile info" ON profiles;
CREATE POLICY "Anyone can view public profile info"
ON profiles FOR SELECT
USING (true);

-- 2. Update Income Ideas author_id to point to profiles
-- This ensures Supabase JS client can automatically join
ALTER TABLE income_ideas 
DROP CONSTRAINT IF EXISTS income_ideas_author_id_fkey;

ALTER TABLE income_ideas 
ADD CONSTRAINT income_ideas_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Update Franchises author_id to point to profiles
ALTER TABLE franchises 
DROP CONSTRAINT IF EXISTS franchises_author_id_fkey;

ALTER TABLE franchises 
ADD CONSTRAINT franchises_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Ensure RLS on profiles allows updating own profile (check existing)
-- (Already handled in schema.sql, but good to reinforce)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 5. Give some default full_names to existing profiles if null
UPDATE profiles SET full_name = 'Anonymous Commander' WHERE full_name IS NULL;
