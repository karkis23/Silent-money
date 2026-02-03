-- Upgrade Expert Audit Requests for Admin Command Center
ALTER TABLE expert_audit_requests ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
ALTER TABLE expert_audit_requests ADD COLUMN IF NOT EXISTS report_url TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_requests_user_id ON expert_audit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_requests_status ON expert_audit_requests(status);
