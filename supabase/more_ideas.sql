-- Add Offline Category
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Offline Business', 'offline-business', 'Local physical businesses with passive potential', '🏪', 9)
ON CONFLICT (slug) DO NOTHING;

-- Add more ideas
INSERT INTO income_ideas (
  title, slug, category_id, short_description, full_description, 
  initial_investment_min, initial_investment_max, monthly_income_min, monthly_income_max, 
  time_to_first_income_days, effort_level, risk_level, success_rate_percentage, 
  reality_check, skills_required, time_commitment_hours_per_week, is_premium, is_featured
) VALUES 
-- Offline: Vending Machines
(
  'Vending Machine Network', 
  'vending-machine-network', 
  (SELECT id FROM categories WHERE slug = 'offline-business'), 
  'Place snacks/drinks machines in offices, hospitals, or colleges.',
  'Purchase or lease vending machines and place them in high-footfall areas. Restocking is once a week.
  
  **How it works:**
  1. Identify 5-10 locations (Offices/Hospitals)
  2. Negotiate space rent (usually 10% of sales)
  3. Buy machines (₹1.5L - ₹3L each)
  4. Partner with distributors for inventory
  5. Restock weekly and collect cash/UPI payments.',
  150000, 1500000, 15000, 150000, 30, 'passive', 'low', 85,
  'Location is 90% of the game. If footfall is low, you lose money on electricity and rent. Maintenance can be annoying if machines are cheap.',
  ARRAY['Basic maintenance', 'Negotiation', 'Logistics'], 5, false, true
),
-- Offline: EV Charging Point
(
  'EV Charging Point Owner', 
  'ev-charging-point', 
  (SELECT id FROM categories WHERE slug = 'offline-business'), 
  'Install an EV charging station in your parking or shop.',
  'As India shifts to EVs, charging infra is in demand. You can install a commercial charger and earn per unit.
  
  **How it works:**
  1. Have a commercial parking space
  2. Apply for EV tariff electricity connection
  3. Buy a 7kW or 22kW charger (₹50k - ₹2L)
  4. List on apps like Tata Power, Statq, or Bolt.Earth',
  50000, 250000, 5000, 20000, 45, 'passive', 'low', 90,
  'Utilization rates are currently low in many areas. It will take 1-2 years for enough EVs to exist to make this highly profitable. Electricity cost vs revenue margin is tight.',
  ARRAY['Basic electrical knowledge', 'Smart device usage'], 2, false, false
),
-- Content: Stock Photos
(
  'Indian Stock Photography', 
  'indian-stock-photography', 
  (SELECT id FROM categories WHERE slug = 'content-creation'), 
  'Sell authentic Indian life photos to global agencies.',
  'Global brands lack authentic "Indian Context" photos. You can fill this gap on Shutterstock, Adobe Stock, or Getty.
  
  **Focus:** Real people, local festivals, Indian street food, typical offices.',
  10000, 100000, 2000, 25000, 90, 'passive', 'low', 40,
  'You need a massive portfolio (500+ high quality shots) to see recurring income. Competition is global. Payouts are in cents initially.',
  ARRAY['Photography', 'Keywording', 'Editing'], 8, false, false
),
-- Digital: Amazon KDP
(
  'Amazon KDP Publishing', 
  'amazon-kdp-publishing', 
  (SELECT id FROM categories WHERE slug = 'digital-products'), 
  'Self-publish low-content books (journals, planners) on Amazon.',
  'Create journals, coloring books, or niche notebooks once and earn royalties forever.
  
  No printing costs, Amazon handles everything.',
  0, 10000, 0, 50000, 60, 'passive', 'medium', 30,
  'Most people make ₹0. It requires niche research. You need to create 50+ books to find 1 winner. Keywords and covers are critical.',
  ARRAY['Graphic design (Canva)', 'Keyword research'], 10, false, false
),
-- Online Business: Drop-servicing
(
  'Drop-servicing Agency', 
  'drop-servicing-agency', 
  (SELECT id FROM categories WHERE slug = 'online-business'), 
  'Sell high-ticket services (Web dev, Ads) and outsource the work.',
  'Acting as the middleman between clients and freelancers. Keep the margin.
  
  **How it works:**
  1. Build a professional website
  2. Find high-quality offshore freelancers
  3. Sell services to US/UK clients
  4. Pay the freelancer and keep 50% margin.',
  5000, 20000, 20000, 200000, 30, 'active', 'medium', 50,
  'Finding clients is extremely hard. If your freelancer disappears, you are responsible. Quality control is a full-time job.',
  ARRAY['Sales', 'Project Management', 'Communication'], 20, false, true
);
