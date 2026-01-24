-- Additional Income Ideas
-- Run this in Supabase SQL Editor

-- 1. AI Faceless YouTube Channel (Content Creation)
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
  'AI Faceless YouTube Channel',
  'ai-faceless-youtube',
  (SELECT id FROM categories WHERE slug = 'content-creation'),
  'Create videos using AI tools without showing your face',
  'Leverage AI tools like ChatGPT (scripting), Midjourney (images), and ElevenLabs (voiceovers) to create high-quality documentary or explainer videos.
  
**How it works:**
1. Choose a niche (Mystery, History, Space, Tech)
2. Generate scripts with ChatGPT
3. Generate voiceover with ElevenLabs
4. Edit clips using stock footage or AI images
5. Upload consistently

**Real numbers:**
- 50k views/month = ₹1,500 - ₹5,000 (AdSense)
- Affiliate potential is higher than vlog channels
- Tools cost: ₹2,000 - ₹5,000/month

**Best for:** Introverts who love editing and storytelling.',
  2000,
  10000,
  0,
  50000,
  120,
  'active',
  'medium',
  20,
  'You are competing with thousands of other AI channels. YouTube can demonetize AI content if it looks like spam. Tools are recurring costs. Quality must be high—generic AI content fails.',
  ARRAY['Video Editing', 'Prompt Engineering', 'Storytelling'],
  10,
  false,
  false
);

-- 2. REITs (Real Estate Investment Trusts) - Investing
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
  'REITs (Real Estate Trusts)',
  'reits-investing',
  (SELECT id FROM categories WHERE slug = 'investments'),
  'Earn rental income from commercial properties with small capital',
  'Invest in REITs (like Embassy, Mindspace, Brookfield) listed on the stock exchange. They own IT parks and offices, collect rent, and distribute 90% of it to you.

**How it works:**
1. Open Demat account
2. Buy REIT units (min 1 unit, approx ₹300-400)
3. Receive quarterly payouts (Interest/Dividend)
4. Capital appreciation over time

**Real numbers:**
- Yield: 6-7% annually (distributed quarterly)
- Capital appreciation: 3-5% annually
- Total return: 9-12% conservative

**Best for:** Safe, steady income seekers.',
  500,
  1000000,
  100,
  50000,
  90,
  'passive',
  'low',
  95,
  'Growth is slow. Commercial real estate cycles affect prices. Interest rate hikes reduce REIT unit prices. Yield is taxable depending on the component (interest vs dividend).',
  ARRAY['Stock Market Basics', 'Patience'],
  0,
  false,
  true
);

-- 3. SaaS Affiliate Marketing (Affiliate)
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
  'SaaS Affiliate Marketing',
  'saas-affiliate',
  (SELECT id FROM categories WHERE slug = 'affiliate-marketing'),
  'Promote software subscriptions for recurring commissions',
  'Unlike Amazon (one-time fee), software companies pay you every month as long as the customer stays subscribed.

**How it works:**
1. Join affiliate programs (e.g., SEMrush, ConvertKit, Shopify)
2. Create content (tutorials, reviews, comparisons)
3. Drive traffic to your links
4. Earn 20-30% recurring commission

**Real numbers:**
- 10 referrals @ $100/mo product = $200-300/month profit
- Recurring revenue builds stability

**Best for:** Tech-savvy content creators.',
  0,
  10000,
  0,
  100000,
  90,
  'active',
  'high',
  15,
  'Extremely competitive. You need to rank for "best X tool" keywords which is hard. Verification for affiliate programs can be strict. You rely on the software staying popular.',
  ARRAY['SEO', 'Content Writing', 'Tech Knowledge'],
  10,
  false,
  true
);
