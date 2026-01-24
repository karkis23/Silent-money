-- 🤫 SILENT MONEY MASTER DATABASE SETUP
-- This script handles Tables, Security Policies, and Seed Data safely.
-- Run this in your Supabase SQL Editor.

-- ============================================
-- 1. EXTENSIONS & TABLES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INCOME IDEAS
CREATE TABLE IF NOT EXISTS income_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  initial_investment_min INTEGER DEFAULT 0,
  initial_investment_max INTEGER,
  monthly_income_min INTEGER DEFAULT 0,
  monthly_income_max INTEGER,
  time_to_first_income_days INTEGER,
  effort_level TEXT,
  risk_level TEXT,
  success_rate_percentage INTEGER,
  reality_check TEXT NOT NULL,
  skills_required TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER SAVED IDEAS
CREATE TABLE IF NOT EXISTS user_saved_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES income_ideas(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'interested',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- ============================================
-- 2. SECURITY (RLS)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_ideas ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO authenticated, anon USING (true);

-- Ideas Policies
DROP POLICY IF EXISTS "Anyone can view free ideas" ON income_ideas;
CREATE POLICY "Anyone can view free ideas" ON income_ideas FOR SELECT TO authenticated, anon USING (is_premium = FALSE);

DROP POLICY IF EXISTS "Authenticated users can insert ideas" ON income_ideas;
CREATE POLICY "Authenticated users can insert ideas" ON income_ideas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own ideas" ON income_ideas;
CREATE POLICY "Users can delete own ideas" ON income_ideas FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Saved Ideas Policies
DROP POLICY IF EXISTS "Users can view own saved ideas" ON user_saved_ideas;
CREATE POLICY "Users can view own saved ideas" ON user_saved_ideas FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved ideas" ON user_saved_ideas;
CREATE POLICY "Users can insert own saved ideas" ON user_saved_ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. SEED CONTENT
-- ============================================

-- Add Categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
('Investments', 'investments', '📈', 1),
('Content Creation', 'content-creation', '✍️', 2),
('Affiliate Marketing', 'affiliate-marketing', '🔗', 3),
('Digital Products', 'digital-products', '📱', 4)
ON CONFLICT (slug) DO NOTHING;

-- Add Initial Ideas
INSERT INTO income_ideas (
    title, slug, category_id, short_description, full_description, 
    initial_investment_min, monthly_income_min, effort_level, risk_level, 
    reality_check, is_featured
)
VALUES 
(
    'Dividend Stock Investing', 'dividend-stock-investing', 
    (SELECT id FROM categories WHERE slug = 'investments'),
    'Invest in dividend-paying stocks for regular quarterly income',
    'Build a portfolio of dividend-paying Indian stocks that distribute profits to shareholders.',
    100000, 1000, 'passive', 'medium', 
    'Dividends are not guaranteed. Market crashes can reduce your capital value.',
    true
),
(
    'REITs (Real Estate Trusts)', 'reits-investing',
    (SELECT id FROM categories WHERE slug = 'investments'),
    'Earn rental income from commercial properties with small capital',
    'Invest in REITs which own IT parks and offices. They collect rent and distribute 90% to you.',
    500, 100, 'passive', 'low',
    'Commercial real estate cycles affect prices. Distribution varies.',
    true
)
ON CONFLICT (slug) DO NOTHING;
