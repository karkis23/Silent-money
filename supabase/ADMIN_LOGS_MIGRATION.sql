-- ADMINISTRATIVE AUDIT INFRASTRUCTURE
-- High-level logging for all administrative actions within the Command Hub

CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'APPROVE_ASSET', 'REJECT_ASSET', 'MODIFY_CONTENT', 'DELETE_USER', 'UPDATE_SECTOR'
    target_type TEXT NOT NULL, -- 'idea', 'franchise', 'user', 'category'
    target_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all admin logs
CREATE POLICY "Admins can view admin logs"
ON admin_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Only system/admin can insert admin logs
CREATE POLICY "Admins can insert admin logs"
ON admin_logs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);
