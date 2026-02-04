-- ASSET AUDIT LOGS INFRASTRUCTURE
-- Institutional tracking for blueprint and brand evolution

CREATE TABLE IF NOT EXISTS asset_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('idea', 'franchise')),
    modified_by UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'STATUS_CHANGE', 'REVISION_REQUEST', 'DECOMMISSION', 'AUTHORIZATION'
    previous_status TEXT,
    new_status TEXT,
    feedback TEXT, -- Strategic feedback provided during action
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE asset_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all audit logs"
ON asset_audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Authors can view logs for their own assets
CREATE POLICY "Authors can view logs for their assets"
ON asset_audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM income_ideas 
        WHERE income_ideas.id = asset_audit_logs.asset_id 
        AND income_ideas.author_id = auth.uid()
        AND asset_audit_logs.asset_type = 'idea'
    )
    OR
    EXISTS (
        SELECT 1 FROM franchises 
        WHERE franchises.id = asset_audit_logs.asset_id 
        AND franchises.author_id = auth.uid()
        AND asset_audit_logs.asset_type = 'franchise'
    )
);

-- Only system/admin can insert logs
CREATE POLICY "Admins can insert audit logs"
ON asset_audit_logs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);
