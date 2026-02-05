-- INSTRUCTIONS:
-- 1. Replace 'YOUR_EMAIL_HERE@gmail.com' with the actual email of the user you want to make an Admin.
-- 2. Run this script in your Supabase SQL Editor.

UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL_HERE@gmail.com'
);

-- Verification Query (Run this after to confirm):
-- SELECT * FROM profiles WHERE is_admin = true;
