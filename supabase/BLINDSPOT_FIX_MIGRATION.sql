-- 0. ADMIN ROLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 1. EXPAND FRANCHISES TABLE FOR DATA AUTHENTICITY
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS unit_model TEXT DEFAULT 'FOCO / FOFO Configuration';
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS market_maturity TEXT DEFAULT 'High - National Leader';
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS corporate_support TEXT DEFAULT 'Full Lifecycle Assistance';
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS operator_retention INTEGER DEFAULT 94;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS network_density INTEGER DEFAULT 82;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS asset_grade TEXT DEFAULT 'AAA+';
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS risk_profile TEXT DEFAULT 'Low';

-- 2. UPDATE ROI_CALCULATIONS TO SUPPORT FRANCHISES
ALTER TABLE roi_calculations ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE;

-- 3. CREATE NOTIFICATIONS SYSTEM
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'approval', 'reply', 'system'
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4. CREATE FUNCTION FOR SYSTEM NOTIFICATIONS (Trigger placeholder)
-- This can be used later by edge functions or triggers
CREATE OR REPLACE FUNCTION notify_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (NEW.user_id, 'New Activity', 'Someone interacted with your post.', 'system', '/dashboard');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
