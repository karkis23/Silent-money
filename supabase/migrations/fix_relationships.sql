-- =================================================================================
-- FIX: FOREIGN KEY RELATIONSHIPS
-- Purpose: Remap review tables to reference 'profiles' instead of 'auth.users'
-- because Supabase JS client requires explicit relationship for joins.
-- =================================================================================

-- 1. Fix Franchise Reviews
ALTER TABLE franchise_reviews
  DROP CONSTRAINT IF EXISTS franchise_reviews_user_id_fkey;

ALTER TABLE franchise_reviews
  ADD CONSTRAINT franchise_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 2. Fix Income Idea Reviews
ALTER TABLE income_idea_reviews
  DROP CONSTRAINT IF EXISTS income_idea_reviews_user_id_fkey;

ALTER TABLE income_idea_reviews
  ADD CONSTRAINT income_idea_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;
