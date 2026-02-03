-- Expert Audit Requests Table
CREATE TABLE IF NOT EXISTS expert_audit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    brand_name TEXT NOT NULL,
    brand_sector TEXT,
    website_url TEXT,
    investment_budget TEXT,
    location_target TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE expert_audit_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own audit requests"
ON expert_audit_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert their own audit requests"
ON expert_audit_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all audit requests"
ON expert_audit_requests FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Admins can update status
CREATE POLICY "Admins can update audit requests"
ON expert_audit_requests FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
