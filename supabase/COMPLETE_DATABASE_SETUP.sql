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

-- FRANCHISES TABLE
CREATE TABLE IF NOT EXISTS franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  investment_min INTEGER NOT NULL,
  investment_max INTEGER,
  roi_months_min INTEGER,
  roi_months_max INTEGER,
  space_required_sqft INTEGER,
  expected_profit_min INTEGER,
  expected_profit_max INTEGER,
  image_url TEXT,
  description TEXT NOT NULL,
  requirements TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SECURITY (RLS)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

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

-- Franchises Policies
DROP POLICY IF EXISTS "Anyone can view verified franchises" ON franchises;
CREATE POLICY "Anyone can view verified franchises" ON franchises FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert franchises" ON franchises;
CREATE POLICY "Authenticated users can insert franchises" ON franchises FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own franchises" ON franchises;
CREATE POLICY "Users can update own franchises" ON franchises FOR UPDATE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own franchises" ON franchises;
CREATE POLICY "Users can delete own franchises" ON franchises FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- ============================================
-- 3. SEED CONTENT
-- ============================================

-- Add Categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
('Investments', 'investments', '📈', 1),
('Content Creation', 'content-creation', '✍️', 2),
('Affiliate Marketing', 'affiliate-marketing', '🔗', 3),
('Digital Products', 'digital-products', '📱', 4),
('Rental Income', 'rental-income', '🏠', 5),
('Online Business', 'online-business', '🛒', 6),
('Freelancing', 'freelancing', '💼', 7),
('Automation', 'automation', '🤖', 8),
('Offline Business', 'offline-business', '🏪', 9)
ON CONFLICT (slug) DO NOTHING;

-- Add Initial Ideas
INSERT INTO income_ideas (
    title, slug, category_id, short_description, full_description, 
    initial_investment_min, monthly_income_min, effort_level, risk_level, 
    reality_check, is_featured, is_premium
)
VALUES 
(
    'Dividend Stock Investing', 'dividend-stock-investing', 
    (SELECT id FROM categories WHERE slug = 'investments'),
    'Invest in dividend-paying stocks for regular quarterly income',
    'Build a portfolio of dividend-paying Indian stocks that distribute profits to shareholders.',
    100000, 1000, 'passive', 'medium', 
    'Dividends are not guaranteed. Market crashes can reduce your capital value.',
    true, false
),
(
    'REITs (Real Estate Trusts)', 'reits-investing',
    (SELECT id FROM categories WHERE slug = 'investments'),
    'Earn rental income from commercial properties with small capital',
    'Invest in REITs which own IT parks and offices. They collect rent and distribute 90% to you.',
    500, 100, 'passive', 'low',
    'Commercial real estate cycles affect prices. Distribution varies.',
    true, false
),
(
    'SaaS Affiliate Marketing', 'saas-affiliate-marketing',
    (SELECT id FROM categories WHERE slug = 'affiliate-marketing'),
    'Promote software subscriptions for recurring commissions',
    'Sign up for SaaS affiliate programs like Shopify, Canva, or Bluehost and earn monthly recurring revenue.',
    0, 2000, 'active', 'high',
    'SaaS programs change terms often. You need high-quality traffic or a niche audience.',
    false, false
),
(
    'AI Faceless YouTube Channel', 'ai-faceless-youtube',
    (SELECT id FROM categories WHERE slug = 'content-creation'),
    'Create videos using AI tools without showing your face.',
    'Use ChatGPT for scripts and ElevenLabs for voiceovers to create educational content.',
    2000, 5000, 'semi-passive', 'medium',
    'YouTube monetization policies on AI content are strict. Quality is king.',
    true, false
),
(
    'Vending Machine Network', 'vending-machine-network', 
    (SELECT id FROM categories WHERE slug = 'offline-business'), 
    'Place snacks/drinks machines in offices, hospitals, or colleges.',
    'Purchase or lease vending machines and place them in high-footfall areas.',
    150000, 15000, 'passive', 'low',
    'Location is 90% of the game. Maintenance is critical.',
    true, false
),
(
    'Sell Notion Templates', 'sell-notion-templates',
    (SELECT id FROM categories WHERE slug = 'digital-products'),
    'Create and sell productivity templates on Gumroad or Notion marketplace.',
    'Build systems for project management or habit tracking and sell them globally.',
    0, 5000, 'semi-passive', 'medium',
    'Marketing is 80% of the work. You need to build a niche audience.',
    false, true
),
(
    'Residential Property Rental', 'residential-property-rental',
    (SELECT id FROM categories WHERE slug = 'rental-income'),
    'Buy a property and rent it out for monthly income.',
    'Purchase a residential apartment and rent it via brokers or apps.',
    2500000, 8000, 'semi-passive', 'medium',
    'Rental yields in India are low (2-4%). Maintenance eats into profits.',
    false, false
),
(
    'E-book Publishing (Amazon KDP)', 'amazon-kdp-publishing', 
    (SELECT id FROM categories WHERE slug = 'digital-products'), 
    'Self-publish niche notebooks or guides on Amazon globally.',
    'Create content once and earn royalties on every sale without handling shipping.',
    0, 2000, 'passive', 'medium',
    'You need multiple books to see results. Amazon keywords are vital.',
    false, false
),
(
    'EV Charging Point Owner', 'ev-charging-point', 
    (SELECT id FROM categories WHERE slug = 'offline-business'), 
    'Install a commercial EV charger in your vacant property.',
    'Monetize your parking space as the EV wave hits India.',
    50000, 5000, 'passive', 'low',
    'Utilization rates take time to grow. Upfront infrastructure cost.',
    false, false
),
(
    'Instagram Niche Page', 'instagram-niche-page',
    (SELECT id FROM categories WHERE slug = 'content-creation'),
    'Build a theme page and earn via shoutouts and affiliate links.',
    'Focus on a niche like Finance, Health or Motivation and grow an audience.',
    0, 10000, 'active', 'high',
    'Instagram algorithm changes frequently. Consistency is mandatory.',
    false, false
),
(
    'Indian Stock Photography', 'indian-stock-photography', 
    (SELECT id FROM categories WHERE slug = 'content-creation'), 
    'Sell authentic Indian life photos to global agencies.',
    'Global brands lack authentic Indian Context photos. Fill this gap on Shutterstock/Adobe Stock.',
    10000, 2000, 'passive', 'low',
    'Massive portfolio required to see recurring income. High quality is non-negotiable.',
    false, false
),
(
    'Drop-servicing Agency', 'drop-servicing-agency', 
    (SELECT id FROM categories WHERE slug = 'online-business'), 
    'Sell high-ticket services (Web dev, Ads) and outsource the work.',
    'Acting as the middleman between international clients and quality freelancers.',
    5000, 20000, 'active', 'medium',
    'Finding clients is the hardest part. Quality control is your main job.',
    true, false
)
ON CONFLICT (slug) DO NOTHING;

-- SEED FRANCHISE DATA
INSERT INTO franchises (name, slug, category, investment_min, investment_max, roi_months_min, roi_months_max, space_required_sqft, expected_profit_min, expected_profit_max, image_url, description, is_verified) VALUES
('Amul Ice Cream Parlour', 'amul-ice-cream', 'Food & Beverage', 200000, 600000, 12, 18, 300, 50000, 100000, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=1000', 'India''s most trusted dairy brand offering scoop parlours and retail outlets.', true),
('DTDC Courier', 'dtdc-courier', 'Logistics', 50000, 150000, 6, 9, 150, 30000, 60000, 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=1000', 'Highly scalable logistics franchise with minimal space requirements.', true),
('FirstCry', 'firstcry-retail', 'Retail', 1500000, 2500000, 24, 36, 1000, 200000, 500000, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000', 'Asia''s largest online store for baby and kids products now expanding offline.', true),
('Dr. Lal PathLabs', 'dr-lal-pathlabs', 'Healthcare', 300000, 500000, 18, 24, 300, 100000, 250000, 'https://images.unsplash.com/photo-1579152276503-7a9641775731?q=80&w=1000', 'Leading diagnostic chain in India with a wide network of collection centers.', true),
('MBA Chai Wala', 'mba-chai-wala', 'Food & Beverage', 300000, 1000000, 12, 18, 200, 100000, 300000, 'https://images.unsplash.com/photo-1544787210-22bbd906bc35?q=80&w=1000', 'Trending tea franchise focusing on youth and quality snacks.', true),
('Lenskart', 'lenskart-optical', 'Retail', 3000000, 3500000, 24, 30, 400, 300000, 600000, 'https://images.unsplash.com/photo-1511499767390-90342f568952?q=80&w=1000', 'Revolutionary eyewear brand with omni-channel retail presence.', true)
ON CONFLICT (slug) DO NOTHING;
