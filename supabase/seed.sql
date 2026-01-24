-- Silent Money Seed Data
-- Run this AFTER running schema.sql

-- ============================================
-- SEED CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Digital Products', 'digital-products', 'Create and sell digital assets like ebooks, templates, courses', '📱', 1),
  ('Content Creation', 'content-creation', 'YouTube, blogging, podcasting and other content monetization', '✍️', 2),
  ('Investments', 'investments', 'Stock market, mutual funds, REITs and other investment vehicles', '📈', 3),
  ('Rental Income', 'rental-income', 'Property rental, equipment leasing, vehicle rental', '🏠', 4),
  ('Affiliate Marketing', 'affiliate-marketing', 'Earn commissions by promoting products and services', '🔗', 5),
  ('Online Business', 'online-business', 'E-commerce, dropshipping, print-on-demand', '🛒', 6),
  ('Freelancing', 'freelancing', 'Offer services on platforms like Upwork, Fiverr', '💼', 7),
  ('Automation', 'automation', 'Automated systems, bots, SaaS products', '🤖', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED INCOME IDEAS (Realistic, India-focused)
-- ============================================

-- Idea 1: Stock Market Dividend Investing
INSERT INTO income_ideas (
  title, 
  slug, 
  category_id,
  short_description,
  full_description,
  initial_investment_min,
  initial_investment_max,
  monthly_income_min,
  monthly_income_max,
  time_to_first_income_days,
  effort_level,
  risk_level,
  success_rate_percentage,
  reality_check,
  skills_required,
  time_commitment_hours_per_week,
  is_premium,
  is_featured
) VALUES (
  'Dividend Stock Investing',
  'dividend-stock-investing',
  (SELECT id FROM categories WHERE slug = 'investments'),
  'Invest in dividend-paying stocks for regular quarterly income',
  'Build a portfolio of dividend-paying Indian stocks (like ITC, Coal India, ONGC) that distribute profits to shareholders quarterly. This is a long-term passive income strategy.

**How it works:**
1. Open a Demat account with Zerodha/Groww
2. Research high-dividend yield stocks (4-7% annual yield)
3. Invest ₹1-5 lakhs across 10-15 stocks
4. Receive dividends quarterly
5. Reinvest dividends for compound growth

**Real numbers:**
- ₹3 lakh investment at 5% yield = ₹15,000/year = ₹1,250/month
- Dividend income is taxable above ₹5,000/year

**Best for:** People with savings who want truly passive income and can wait 3-5 years for meaningful returns.',
  100000,
  500000,
  1000,
  5000,
  90,
  'passive',
  'medium',
  70,
  'Dividends are NOT guaranteed. Companies can cut dividends anytime. Stock prices fluctuate. You need ₹5+ lakhs to generate ₹2000+/month. This is a 5-10 year game, not quick money. Market crashes can wipe out 30-40% value temporarily.',
  ARRAY['Basic stock market knowledge', 'Patience', 'Risk tolerance'],
  2,
  false,
  true
);

-- Idea 2: YouTube Content Creation
INSERT INTO income_ideas (
  title, 
  slug, 
  category_id,
  short_description,
  full_description,
  initial_investment_min,
  initial_investment_max,
  monthly_income_min,
  monthly_income_max,
  time_to_first_income_days,
  effort_level,
  risk_level,
  success_rate_percentage,
  reality_check,
  skills_required,
  time_commitment_hours_per_week,
  is_premium,
  is_featured
) VALUES (
  'YouTube Channel (Hindi/Regional)',
  'youtube-channel-hindi',
  (SELECT id FROM categories WHERE slug = 'content-creation'),
  'Create educational or entertainment videos in Hindi/regional languages',
  'Start a YouTube channel in your native language on topics you know well - cooking, tech reviews, finance tips, farming, local news, comedy skits.

**How it works:**
1. Pick a niche you can create 100+ videos on
2. Record with smartphone (₹15k+ phone needed)
3. Upload 2-3 videos per week consistently
4. Reach 1000 subscribers + 4000 watch hours
5. Enable monetization
6. Earn from ads, sponsorships, affiliate links

**Real numbers:**
- 10,000 views/month = ₹500-2000 (₹0.05-0.20 per view in India)
- 100,000 views/month = ₹5,000-20,000
- Sponsorships pay ₹5,000-50,000 per video (if you have 50k+ subscribers)

**Best for:** People who enjoy creating content and can commit 1-2 years before seeing income.',
  5000,
  50000,
  0,
  50000,
  180,
  'active',
  'high',
  15,
  'Only 1-2% of channels make meaningful money. It takes 6-18 months to get monetized. You need to post 100+ videos before seeing traction. Algorithm is unpredictable. Income fluctuates wildly month-to-month. Not passive at all - requires constant content creation.',
  ARRAY['Video editing', 'Storytelling', 'Consistency', 'Patience'],
  15,
  false,
  true
);

-- Idea 3: Rental Property Income
INSERT INTO income_ideas (
  title, 
  slug, 
  category_id,
  short_description,
  full_description,
  initial_investment_min,
  initial_investment_max,
  monthly_income_min,
  monthly_income_max,
  time_to_first_income_days,
  effort_level,
  risk_level,
  success_rate_percentage,
  reality_check,
  skills_required,
  time_commitment_hours_per_week,
  is_premium,
  is_featured
) VALUES (
  'Residential Property Rental',
  'residential-property-rental',
  (SELECT id FROM categories WHERE slug = 'rental-income'),
  'Buy a property and rent it out for monthly income',
  'Purchase a residential property (flat/house) and rent it to tenants for monthly rental income.

**How it works:**
1. Buy property in Tier 2/3 city (₹25-50 lakhs)
2. Get it ready for rental (₹1-2 lakhs)
3. Find tenants via broker or online
4. Collect monthly rent
5. Handle maintenance and taxes

**Real numbers:**
- ₹30 lakh property in Tier 2 city = ₹8,000-12,000/month rent
- Annual yield: 3-4% (very low)
- After maintenance, tax, vacancy: 2-3% net yield
- Property value may appreciate 5-7% annually (not guaranteed)

**Best for:** People with ₹30+ lakh savings who want stable (but low) returns.',
  2500000,
  10000000,
  8000,
  40000,
  60,
  'semi-passive',
  'medium',
  80,
  'Rental yield in India is very low (2-4%). Tenants can default. Property can stay vacant for months. Maintenance costs eat into profits. Property prices can stagnate for years. Legal issues with tenants are common. Not liquid - hard to sell quickly.',
  ARRAY['Property knowledge', 'Legal awareness', 'Tenant management'],
  3,
  false,
  false
);

-- Idea 4: Notion Templates (PREMIUM)
INSERT INTO income_ideas (
  title, 
  slug, 
  category_id,
  short_description,
  full_description,
  initial_investment_min,
  initial_investment_max,
  monthly_income_min,
  monthly_income_max,
  time_to_first_income_days,
  effort_level,
  risk_level,
  success_rate_percentage,
  reality_check,
  skills_required,
  time_commitment_hours_per_week,
  is_premium,
  is_featured
) VALUES (
  'Sell Notion Templates',
  'sell-notion-templates',
  (SELECT id FROM categories WHERE slug = 'digital-products'),
  'Create and sell productivity templates on Gumroad/Notion marketplace',
  '**PREMIUM CONTENT - Full strategy, templates, and marketing guide**

Create beautiful, functional Notion templates and sell them on Gumroad, Notion Template Gallery, or your own website.

**Complete Strategy:**
1. Identify template needs (budgeting, habit tracking, project management)
2. Build 5-10 high-quality templates
3. Create demo videos and screenshots
4. List on Gumroad (₹0 to start)
5. Market on Twitter, Reddit, Instagram
6. Price templates at ₹99-999

**Real numbers from successful creators:**
- 10 sales/month at ₹299 = ₹2,990/month
- 50 sales/month at ₹499 = ₹24,950/month
- Top creators make ₹50k-2 lakh/month

**Marketing channels that work:**
- Twitter threads showing template features
- YouTube tutorials
- Reddit communities (r/Notion)
- Instagram reels
- Pinterest pins

**Best for:** Notion power users who understand productivity systems.',
  0,
  5000,
  0,
  200000,
  30,
  'semi-passive',
  'medium',
  25,
  'Market is getting saturated. You need design skills. Marketing is 80% of the work. Most templates sell 0-5 copies total. You need to build an audience first. Copycats will steal your designs. Income is very inconsistent.',
  ARRAY['Notion expertise', 'Design sense', 'Marketing', 'Copywriting'],
  10,
  true,
  false
);

-- Idea 5: Blog with Affiliate Marketing
INSERT INTO income_ideas (
  title, 
  slug, 
  category_id,
  short_description,
  full_description,
  initial_investment_min,
  initial_investment_max,
  monthly_income_min,
  monthly_income_max,
  time_to_first_income_days,
  effort_level,
  risk_level,
  success_rate_percentage,
  reality_check,
  skills_required,
  time_commitment_hours_per_week,
  is_premium,
  is_featured
) VALUES (
  'Niche Blog + Amazon Affiliate',
  'niche-blog-amazon-affiliate',
  (SELECT id FROM categories WHERE slug = 'affiliate-marketing'),
  'Write product reviews and earn commission when readers buy through your links',
  'Create a blog focused on product reviews (electronics, books, home appliances) and earn commissions through Amazon Associates.

**How it works:**
1. Buy domain + hosting (₹3000-5000/year)
2. Set up WordPress blog
3. Write 50-100 product review articles
4. Join Amazon Associates
5. Add affiliate links to products
6. Drive traffic via Google SEO

**Real numbers:**
- 10,000 visitors/month = ₹2,000-8,000 (if 2-3% click and buy)
- Amazon India commission: 1-10% depending on category
- Electronics: 1-3%, Books: 8-10%

**Best for:** People who enjoy writing and can commit 1-2 years to build traffic.',
  3000,
  20000,
  0,
  30000,
  180,
  'active',
  'medium',
  20,
  'Takes 6-12 months to rank on Google. Amazon commission rates are very low in India (1-3% for most items). You need 50,000+ monthly visitors to make ₹10k+. Google algorithm changes can kill your traffic overnight. Requires constant content creation.',
  ARRAY['SEO', 'Writing', 'WordPress', 'Patience'],
  12,
  false,
  false
);

-- Add more ideas as needed...
