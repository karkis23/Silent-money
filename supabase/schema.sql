-- =================================================================================
-- SILENT MONEY: MASTER DATABASE SCHEMA
-- 2025 Institutional Grade Wealth Platform
-- 
-- ARCHITECTURE:
-- - All tables use Row Level Security (RLS) for multi-tenant data isolation.
-- - Identity is managed via auth.users linked to the custom profiles table.
-- - Post-deployment triggers track asset upvotes and user participation ranks.
-- =================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================
-- 👤 PROFILES TABLE
-- Stores user metadata, financial goals, and institutional ranking tags.
-- =================================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================
-- INCOME IDEAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS income_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Content
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  
  -- Financial metrics
  initial_investment_min INTEGER DEFAULT 0,
  initial_investment_max INTEGER,
  monthly_income_min INTEGER DEFAULT 0,
  monthly_income_max INTEGER,
  time_to_first_income_days INTEGER,
  effort_level TEXT CHECK (effort_level IN ('passive', 'semi-passive', 'active')),
  
  -- Risk and reality
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  success_rate_percentage INTEGER CHECK (success_rate_percentage >= 0 AND success_rate_percentage <= 100),
  reality_check TEXT NOT NULL, -- Honest assessment
  
  -- Requirements
  skills_required TEXT[], -- Array of skills
  time_commitment_hours_per_week INTEGER,
  
  -- Content flags
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_india_specific BOOLEAN DEFAULT TRUE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Tracking
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE income_ideas ENABLE ROW LEVEL SECURITY;

-- Policies for income_ideas
CREATE POLICY "Anyone can view free ideas"
  ON income_ideas FOR SELECT
  TO authenticated, anon
  USING (is_premium = FALSE);

CREATE POLICY "Premium users can view premium ideas"
  ON income_ideas FOR SELECT
  TO authenticated
  USING (
    is_premium = TRUE 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_premium = TRUE 
      AND (profiles.premium_until IS NULL OR profiles.premium_until > NOW())
    )
  );

-- ============================================
-- USER SAVED IDEAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_saved_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES income_ideas(id) ON DELETE CASCADE NOT NULL,
  
  -- User tracking
  status TEXT CHECK (status IN ('interested', 'researching', 'started', 'active', 'paused', 'stopped')) DEFAULT 'interested',
  notes TEXT,
  started_at TIMESTAMPTZ,
  
  -- Progress tracking
  investment_made INTEGER DEFAULT 0,
  income_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, idea_id)
);

-- Enable RLS
ALTER TABLE user_saved_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved ideas"
  ON user_saved_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved ideas"
  ON user_saved_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved ideas"
  ON user_saved_ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved ideas"
  ON user_saved_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ROI CALCULATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roi_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES income_ideas(id) ON DELETE CASCADE,
  
  -- Input values
  initial_investment INTEGER NOT NULL,
  monthly_income_expected INTEGER NOT NULL,
  monthly_expenses INTEGER DEFAULT 0,
  time_horizon_months INTEGER NOT NULL,
  
  -- Calculated values
  total_income INTEGER,
  net_profit INTEGER,
  roi_percentage DECIMAL(10, 2),
  break_even_months INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculations"
  ON roi_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON roi_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON roi_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORIES TABLE (Success/Reality Stories)
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES income_ideas(id) ON DELETE CASCADE,
  
  -- Story content
  title TEXT NOT NULL,
  author_name TEXT, -- Can be anonymous
  story_text TEXT NOT NULL,
  
  -- Metrics
  initial_investment INTEGER,
  current_monthly_income INTEGER,
  time_taken_months INTEGER,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  is_success BOOLEAN DEFAULT TRUE, -- TRUE for success, FALSE for reality check/failure
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified stories"
  ON stories FOR SELECT
  TO authenticated, anon
  USING (is_verified = TRUE);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Subscription details
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  
  -- Payment
  amount_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_provider TEXT, -- 'razorpay' or 'stripe'
  payment_id TEXT,
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_ideas_updated_at
  BEFORE UPDATE ON income_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_saved_ideas_updated_at
  BEFORE UPDATE ON user_saved_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_income_ideas_category ON income_ideas(category_id);
CREATE INDEX IF NOT EXISTS idx_income_ideas_premium ON income_ideas(is_premium);
CREATE INDEX IF NOT EXISTS idx_income_ideas_featured ON income_ideas(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_saved_ideas_user ON user_saved_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_ideas_idea ON user_saved_ideas(idea_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_user ON roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_idea ON stories(idea_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
