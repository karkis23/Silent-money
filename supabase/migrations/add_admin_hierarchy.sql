-- Add admin_level column to profiles table
-- This creates a hierarchy: owner > super_admin > admin

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_level TEXT DEFAULT 'admin';

-- Add check constraint to ensure valid admin levels
ALTER TABLE profiles 
ADD CONSTRAINT valid_admin_level 
CHECK (admin_level IN ('owner', 'super_admin', 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_admin_level ON profiles(admin_level) WHERE is_admin = true;

-- Set the first admin as owner (if exists)
-- This ensures there's always at least one owner
DO $$
DECLARE
    first_admin_id UUID;
BEGIN
    SELECT id INTO first_admin_id
    FROM profiles
    WHERE is_admin = true
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF first_admin_id IS NOT NULL THEN
        UPDATE profiles
        SET admin_level = 'owner'
        WHERE id = first_admin_id;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.admin_level IS 'Admin hierarchy level: owner (highest), super_admin, admin (lowest). Only applies when is_admin=true';
