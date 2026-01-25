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

-- RLS for Franchises
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view verified franchises" ON franchises;
CREATE POLICY "Anyone can view verified franchises" ON franchises FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert franchises" ON franchises;
CREATE POLICY "Authenticated users can insert franchises" ON franchises FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own franchises" ON franchises;
CREATE POLICY "Users can update own franchises" ON franchises FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- SEED FRANCHISE DATA
INSERT INTO franchises (name, slug, category, investment_min, investment_max, roi_months_min, roi_months_max, space_required_sqft, expected_profit_min, expected_profit_max, image_url, description, is_verified) VALUES
('Amul Ice Cream Parlour', 'amul-ice-cream', 'Food & Beverage', 200000, 600000, 12, 18, 300, 50000, 100000, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=1000', 'India''s most trusted dairy brand offering scoop parlours and retail outlets.', true),
('DTDC Courier', 'dtdc-courier', 'Logistics', 50000, 150000, 6, 9, 150, 30000, 60000, 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=1000', 'Highly scalable logistics franchise with minimal space requirements.', true),
('FirstCry', 'firstcry-retail', 'Retail', 1500000, 2500000, 24, 36, 1000, 200000, 500000, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000', 'Asia''s largest online store for baby and kids products now expanding offline.', true),
('Dr. Lal PathLabs', 'dr-lal-pathlabs', 'Healthcare', 300000, 500000, 18, 24, 300, 100000, 250000, 'https://images.unsplash.com/photo-1579152276503-7a9641775731?q=80&w=1000', 'Leading diagnostic chain in India with a wide network of collection centers.', true),
('MBA Chai Wala', 'mba-chai-wala', 'Food & Beverage', 300000, 1000000, 12, 18, 200, 100000, 300000, 'https://images.unsplash.com/photo-1544787210-22bbd906bc35?q=80&w=1000', 'Trending tea franchise focusing on youth and quality snacks.', true),
('Lenskart', 'lenskart-optical', 'Retail', 3000000, 3500000, 24, 30, 400, 300000, 600000, 'https://images.unsplash.com/photo-1511499767390-90342f568952?q=80&w=1000', 'Revolutionary eyewear brand with omni-channel retail presence.', true)
ON CONFLICT (slug) DO NOTHING;
