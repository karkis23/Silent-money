
-- 🚀 ULTIMATE SILENT MONEY DATA ENRICHMENT
-- Run this in your Supabase SQL Editor.

-- 1. Financial Assets
UPDATE income_ideas SET 
    full_description = 'P2P (Peer-to-Peer) lending in India is a modern investment model regulated by the RBI. It allows you to lend directly to individuals or small businesses, bypassing banks.

### How it Works (Step-by-Step)
1. **Choose Platform**: Register on RBI-regulated NBFC-P2P platforms like 12% Club, LenDenClub, or Faircent.
2. **KYC Verification**: Complete your profile with Aadhaar and PAN (mandatory for RBI compliance).
3. **Wallet Funding**: Deposit funds into an Escrow account managed by a third-party bank trustee.
4. **Select Borrowers**: Browse profiles or use ''Auto-Invest'' to match with borrowers based on risk grades.
5. **Receive Payouts**: Borrowers pay back principal and interest monthly, which is auto-credited to your wallet.',
    reality_check = 'Primary risk is default (NPAs). Unlike bank FDs, P2P loans are unsecured and have no government insurance. Capital is at risk if borrowers fail to pay.',
    skills_required = ARRAY['Basic Financial Literacy', 'Risk Management'],
    initial_investment_max = 1000000,
    monthly_income_max = 15000,
    time_to_first_income_days = 30,
    success_rate_percentage = 90
WHERE slug = 'p2p-lending-india';

UPDATE income_ideas SET 
    full_description = 'Automate your wealth creation by investing in the top 50 companies of India. Index funds replicate the performance of indices like Nifty 50 or Sensex.

### How to Start
1. **Define Goals**: Determine your investment horizon (ideally 5-10 years).
2. **Choose a Broker**: Use platforms like Groww, Dhan, or Zerodha.
3. **Complete KYC**: Standard Aadhaar-linked verification.
4. **Set Up SIP**: Automate a monthly transfer (starting as low as INR 100).
5. **Select Fund**: Choose low-expense ratio funds like Navi Nifty 50 or UTI Index Fund.',
    reality_check = 'Market volatility is unavoidable. Index funds track the market, so if the market drops 10%, your portfolio will too. Requires long-term patience to see the power of compounding.',
    skills_required = ARRAY['Patience', 'Basic App Literacy'],
    initial_investment_max = 5000,
    monthly_income_max = 50000,
    time_to_first_income_days = 365,
    success_rate_percentage = 95
WHERE slug = 'index-fund-sip';

UPDATE income_ideas SET 
    full_description = 'Sovereign Gold Bonds (SGBs) are government securities denominated in grams of gold. They are a superior alternative to holding physical gold, as they offer price appreciation plus a fixed annual interest.

### How it Works
1. **Issuance**: RBI issues SGBs in series (tranches) throughout the year.
2. **Purchase**: You can buy them via major banks (Netbanking), the NSE/BSE, or authorized Post Offices.
3. **Returns**: You get the market price of gold at maturity PLUS a 2.5% fixed annual interest credited to your bank account semi-annually.
4. **Redemption**: After 8 years, the bonds are redeemed at the prevailing gold price.',
    reality_check = '8-year lock-in period (exit option after 5th year). Capital loss is possible if gold prices drop significantly below your purchase price.',
    skills_required = ARRAY['Basic Financial Literacy', 'Knowledge of Gold Market Trends'],
    initial_investment_max = 25000,
    monthly_income_max = 1000,
    time_to_first_income_days = 180,
    success_rate_percentage = 99
WHERE slug = 'sgb-investing';

UPDATE income_ideas SET 
    full_description = 'Invest in high-quality Indian companies that share a portion of their profits with you through regular dividends. A classic path to financial freedom.

### How to Start
1. **Open Demat Account**: Use Zerodha, Upstox, or Groww.
2. **Identify Dividend Aristocrats**: Look for companies with a consistent 10-year track record (e.g., ITC, TCS, HCL Tech, Coal India).
3. **Analyze Payout Ratio**: Ensure the company is not paying out more than 70% of its profits (sustainable).
4. **Re-invest Dividends**: Use the payouts to buy more shares, accelerating the snowball effect.',
    reality_check = 'Dividends are not guaranteed. A company can cut or stop payouts if profits drop. Also, dividends are taxed as per your individual income tax slab in India.',
    skills_required = ARRAY['Fundamental Analysis', 'Patience'],
    initial_investment_max = 10000000,
    monthly_income_max = 100000,
    time_to_first_income_days = 180,
    success_rate_percentage = 98
WHERE slug = 'dividend-stock-investing';

UPDATE income_ideas SET 
    full_description = 'Lend money to high-growth, VC-backed startups in India. It is a form of debt that offers higher interest than traditional bonds, often with equity upside.

### How to Invest
1. **Minimum Entry**: Typically requires INR 1L - 5L via curated platforms like Grip Invest or Recur Club.
2. **Target IRR**: Aim for 12-18% annual returns.
3. **Diversification**: Spread your capital across multiple startups to mitigate solo default risk.
4. **Warrants**: Some deals include "equity warrants," allowing you to profit if the startup IPOs or gets acquired.',
    reality_check = 'Highly illiquid. You cannot withdraw your money midway. If the startup runs out of cash, they might default on your loan. Only invest capital you can afford to lock for 2-3 years.',
    skills_required = ARRAY['Investment Sizing', 'Company Analysis'],
    initial_investment_max = 500000,
    monthly_income_max = 20000,
    time_to_first_income_days = 120,
    success_rate_percentage = 92
WHERE slug = 'venture-debt-investing';

UPDATE income_ideas SET 
    full_description = 'A sovereign-backed, high-safety retirement scheme for those above 60. Offers one of the highest interest rates among debt instruments in India.

### Key Features (2025)
- **Interest Rate**: 8.2% per annum (paid quarterly).
- **Investment Limit**: Minimum INR 1,000 to Maximum INR 30 Lakhs.
- **Tenure**: 5 years, extendable by another 3 years.
- **Tax Benefit**: Eligible for deduction under Section 80C (up to INR 1.5L).

### How to Start
1. Visit any major bank (SBI, HDFC, ICICI) or Post Office.
2. Fill out Form A and provide proof of age.
3. Deposit the amount in one lump sum within 1 month of retirement.',
    reality_check = 'Only for senior citizens (60+) or those 55+ retiring via VRS. Interest is taxable if your total income exceeds the basic exemption limit. Premature withdrawal carries a penalty of 1% to 1.5%.',
    skills_required = ARRAY['Paperwork', 'Retirement Planning'],
    initial_investment_max = 3000000,
    monthly_income_max = 20000,
    time_to_first_income_days = 90,
    success_rate_percentage = 99
WHERE slug = 'scss-investment';

UPDATE income_ideas SET 
    full_description = 'Generate a reliable monthly "salary" from your existing mutual fund investments by automatically redeeming a fixed portion of your units.

### The Strategy
1. **Build Corpus**: First, use SIPs to build a large pool (e.g., INR 50L - 1Cr).
2. **Activate SWP**: Setup instructions to withdraw a fixed amount (recommended 0.5% to 0.7% of corpus monthly).
3. **Tax Efficiency**: SWP is generally more tax-efficient than dividend options because only the "gain" portion of each withdrawal is taxable.

### Best Funds for SWP
- **Hybrid/Balanced Advantage Funds**: For stable returns with lower volatility compared to pure equity.',
    reality_check = 'If the market crashes significantly, your SWP will continue to redeem units, which might "eat into" your principal faster than expected. Always review your fund performance annually.',
    skills_required = ARRAY['Portfolio Management', 'Tax Planning Basics'],
    initial_investment_max = 10000000,
    monthly_income_max = 100000,
    time_to_first_income_days = 30,
    success_rate_percentage = 95
WHERE slug = 'mf-swp-passive';

-- 2. Content & Digital
UPDATE income_ideas SET 
    full_description = 'Help CEOs and founders build their personal brand on LinkedIn by writing high-impact content for them.

### How to Get Started
1. **Optimise Your Profile**: Your own LinkedIn should be a portfolio. Post 3x a week.
2. **Find a Niche**: Focus on specific industries (e.g., Tech Founders, Real Estate Leaders).
3. **Sample Creation**: Write 5 sample posts in different ''voices'' (Analytic, Inspiring, Contrarian).
4. **Outreach**: Send personalized messages or ''rewrites'' to potential clients showing how you''d improve their current content.
5. **Onboarding**: Create a 30-min weekly call system to extract ideas from the client to turn into posts.',
    reality_check = 'High-quality writing is essential. You must be able to adopt the unique ''voice'' of your client. Finding your first 3 high-paying clients is the hardest part.',
    skills_required = ARRAY['Copywriting', 'Personal Branding', 'Social Media Strategy'],
    initial_investment_max = 5000,
    monthly_income_max = 150000,
    time_to_first_income_days = 14,
    success_rate_percentage = 70
WHERE slug = 'linkedin-ghostwriting-service';

UPDATE income_ideas SET 
    full_description = 'Monetize your social media presence by recommending Amazon products through a custom storefront.

### Approval Guide (2025)
- **Eligibility**: You need a YouTube, Instagram, Facebook, or TikTok account with good engagement.
- **Storefront**: Once approved, create ''Idea Lists'' (e.g., ''My Podcast Gear'', ''Essential Kitchen Tools'').
- **Shoppable Videos**: Upload short review videos directly to Amazon product pages to earn ''on-site'' commissions.

### Top Categories for India
- **Fashion & Beauty**: Up to 10% commission.
- **Home & Kitchen**: 8% commission.
- **Consumer Electronics**: 4-5% commission.
- **Bounties**: Earn flat ₹100-₹200 for every Prime or Audible sign-up via your link.',
    reality_check = 'Approval isn''t guaranteed; Amazon looks for consistent engagement, not just high follower counts. On-site video commissions can be very passive but require high-quality video production.',
    skills_required = ARRAY['Video Editing', 'Product Presentation', 'Niche Curation'],
    initial_investment_max = 10000,
    monthly_income_max = 50000,
    time_to_first_income_days = 30,
    success_rate_percentage = 60
WHERE slug = 'amazon-influencer-hub';

UPDATE income_ideas SET 
    full_description = 'Build a direct relationship with your audience and charge for premium insights using Substack or Beehiiv.

### Content Strategy
- **Niche Focus**: Industry deep-dives, curation of news, or personal growth tips.
- **Free vs Paid**: Offer 70% content for free to grow your list, reserve 30% deep-dives for paid subscribers.
- **Pricing**: Typical rates are INR 300 - INR 800 per month.',
    reality_check = 'Stripe (Substack payment partner) has some limitations for recurring international payments for individuals in India. You might need a business registration or use alternative models like Ko-Fi for domestic payments.',
    skills_required = ARRAY['Copywriting', 'Curating Insights', 'E-mail Marketing'],
    initial_investment_max = 5000,
    monthly_income_max = 100000,
    time_to_first_income_days = 90,
    success_rate_percentage = 40
WHERE slug = 'paid-newsletter-india';

UPDATE income_ideas SET 
    full_description = 'Build a profitable YouTube presence without ever showing your face. Focus on high-retention niches like space, history, luxury, or AI.

### Content Pipeline
1. **Scripting**: Use ChatGPT/Claude to write engaging, data-backed scripts.
2. **Voiceover**: Use high-end AI voices (ElevenLabs) or hire a professional.
3. **Visuals**: Use stock footage (Pexels, Storyblocks) and high-quality motion graphics.
4. **Monetization**: Aim for AdSense, but also include high-ticket affiliate links in the description.',
    reality_check = 'It takes 6-12 months of consistent posting to get monetized. Competition is global. You must master YouTube SEO (titles and thumbnails) to get initial views.',
    skills_required = ARRAY['Script Writing', 'Stock Footage Curation', 'YouTube SEO'],
    initial_investment_max = 50000,
    monthly_income_max = 300000,
    time_to_first_income_days = 200,
    success_rate_percentage = 35
WHERE slug = 'faceless-youtube-empire';

UPDATE income_ideas SET 
    full_description = 'Write about code, AI, or Web3 and earn through ads, sponsorships, and the "Guild" program on Hashnode.

### How to Start
1. **Set Up**: Create a blog on Hashnode (use your own domain for SEO).
2. **Niche**: Focus on "How-to" guides for complex dev tools or new frameworks.
3. **Monetize**: Enable Hashnode Sponsors and join the Web3/AI writing challenges for cash prizes.
4. **Distribution**: Auto-post to dev.to and Medium to drive traffic back to your main site.',
    reality_check = 'Takes 6-12 months to build organic search traffic. You need to be a constant learner as tech changes monthly.',
    skills_required = ARRAY['Programming', 'Technical Writing', 'SEO Basics'],
    initial_investment_max = 5000,
    monthly_income_max = 80000,
    time_to_first_income_days = 120,
    success_rate_percentage = 45
WHERE slug = 'technical-blogging-dev';

UPDATE income_ideas SET 
    full_description = 'Get paid for every minute someone spends reading your stories on Medium. Now with a dedicated payout pool for traffic from Google/Social.

### Strategy
1. **Join MPP**: Join the Medium Partner Program (available in India via Stripe).
2. **Publications**: Submit your stories to big publications like "Towards Data Science" or "The Startup".
3. **Engagement**: Respond to every comment to build a "following" inside the platform.
4. **Series**: Write multi-part guides to keep readers on your profile longer.',
    reality_check = 'Indian writers need a Medium Membership ($5/mo) to earn. Earning depends on "Member Reading Time," not just views.',
    skills_required = ARRAY['Storytelling', 'Topic Curation', 'English Proficiency'],
    initial_investment_max = 2000,
    monthly_income_max = 50000,
    time_to_first_income_days = 30,
    success_rate_percentage = 60
WHERE slug = 'medium-writing-program';

UPDATE income_ideas SET 
    full_description = 'Curate aesthetic products on Pinterest and use affiliate links to earn commissions from Amazon or Myntra.

### Workflow
1. **Business Account**: Create a Pinterest Business account and claim your website.
2. **Boards**: Build niche boards like "Boho Living Room" or "M2 Mac Setup".
3. **Pins**: Create 5-10 high-quality pins daily using Canva templates.
4. **Linking**: Use direct affiliate links (where allowed) or link to a "Shop My Shelf" page.',
    reality_check = 'Requires high volume (15+ pins daily) to trigger the algorithm. Pinterest is strict about spam; always disclose affiliate links.',
    skills_required = ARRAY['Graphic Design (Canva)', 'Pinterest SEO', 'Affiliate Marketing'],
    initial_investment_max = 0,
    monthly_income_max = 40000,
    time_to_first_income_days = 90,
    success_rate_percentage = 50
WHERE slug = 'pinterest-affiliate-marketing';

-- 3. Digital Services & SaaS
UPDATE income_ideas SET 
    full_description = 'Build ''solopreneur'' software products that solve one tiny problem for a specific group of people.

### Examples for the Indian Market
- **GST Invoice Automator**: Simple tool for Shopify sellers to auto-generate Indian tax compliant bills.
- **Society Management Mini-App**: Niche tool for small 10-20 unit apartment blocks in Tier 2 cities.
- **AI Content Pack for Creators**: Specialized LLM prompts for regional language YouTubers.

### Tech Stack for Beginners
- **No-Code**: Bubble, Softr, or Glide.
- **Low-Code**: Next.js + Supabase (using Vercel for free hosting).
- **Payment**: Razorpay (for India) or Stripe (for Global).',
    reality_check = 'Churn is the biggest killer. Even if a tool is good, users might leave if they don''t see immediate value. Managing recurring payments in India requires careful compliance with RBI auto-debit rules.',
    skills_required = ARRAY['No-Code/Programming', 'Product Management', 'Digital Marketing'],
    initial_investment_max = 20000,
    monthly_income_max = 200000,
    time_to_first_income_days = 60,
    success_rate_percentage = 30
WHERE slug = 'micro-saas-apps';

UPDATE income_ideas SET 
    full_description = 'Deploy AI-powered "Operational Commanders" (Chatbots) for B2B companies to automate customer support and lead generation.

### Tech Stack
- **WhatsApp API**: Use Interakt or Wati for Indian business automation.
- **AI Engine**: Connect OpenAI or Anthropic for intelligent, natural-language responses.
- **No-Code**: Build workflows with Botpress or Typebot.',
    reality_check = 'AI "hallucinations" (wrong info) can lead to client dissatisfaction. You must set strict guardrails on what the bot can and cannot say. Requires ongoing maintenance as APIs update.',
    skills_required = ARRAY['Chatbot Logic', 'Prompt Engineering', 'API Integrations'],
    initial_investment_max = 10000,
    monthly_income_max = 80000,
    time_to_first_income_days = 21,
    success_rate_percentage = 60
WHERE slug = 'chatbot-agency-services';

UPDATE income_ideas SET 
    full_description = 'Help Indian D2C brands move from offline to online by setting up professional Shopify stores.

### Service Breakdown
- **Base Setup**: Theme selection + Store configuration (INR 15k - 25k).
- **Premium Setup**: Custom apps + Payment gateway integration + Logistics setup (INR 50k+).
- **Maintenance Retainer**: Weekly updates and store management (INR 5k - 10k/month).',
    reality_check = 'Shopify subscription and app costs can be high for small Indian sellers. You must be able to explain the "ROI" of having a premium store versus a free one. High competition from overseas freelancers.',
    skills_required = ARRAY['Liquid/CSS Basics', 'Store Ops', 'Logistics Knowledge'],
    initial_investment_max = 5000,
    monthly_income_max = 100000,
    time_to_first_income_days = 14,
    success_rate_percentage = 75
WHERE slug = 'shopify-expert-setup';

UPDATE income_ideas SET 
    full_description = 'Act as an "AI Bridge" for brands. Help them generate high-end visuals, copy, and marketing assets using Midjourney, ChatGPT, and specialized AI models.

### Services
- **AI Image Generation**: Custom, consistent brand assets for social media.
- **workflow Automation**: Building "Custom GPTs" for a marketing team''s specific voice.
- **Prompt Library**: Selling a custom "Cookbook" of prompts for a brand in a specific niche.',
    reality_check = 'AI is evolving so fast that what you learn today might be obsolete tomorrow. You must constantly experiment with new models (Llama, Sora, Gemini) to remain relevant.',
    skills_required = ARRAY['AI Model Understanding', 'Natural Language Communication', 'Design Aesthetics'],
    initial_investment_max = 5000,
    monthly_income_max = 120000,
    time_to_first_income_days = 30,
    success_rate_percentage = 55
WHERE slug = 'prompt-engineer-content';

UPDATE income_ideas SET 
    full_description = 'Promote hosting providers like Hostinger, Bluehost, or SiteGround to new bloggers and businesses. One of the highest paying affiliate niches.

### How to Scale
1. **Comparison Tables**: Create "Hostinger vs Bluehost" blog posts or Reels.
2. **Free Service**: Offer "Free WordPress Setup" for anyone who signs up using your link.
3. **Coupon Hunting**: Share dedicated discount codes provided by the host.',
    reality_check = 'Extremely competitive SEO niche. "Hosting" keywords are expensive and hard to rank for. High churn rate as beginners often quit after 1 year.',
    skills_required = ARRAY['Digital Marketing', 'WordPress Basics', 'SEO'],
    initial_investment_max = 2000,
    monthly_income_max = 200000,
    time_to_first_income_days = 60,
    success_rate_percentage = 30
WHERE slug = 'web-hosting-referral';

UPDATE income_ideas SET 
    full_description = 'Design and sell spreadsheet-based solutions for common financial and business problems.

### Hot Selling Templates
- **Indian Tax Planner (Old vs New Regime)**
- **Personal Budget Tracker for Couples**
- **Startup Cap Table & Financial Model**

### Where to Sell
- **Etsy & Gumroad**: For global reach.
- **Cosmofeed / Topmate**: For selling directly to your Indian audience on Instagram/LinkedIn.',
    reality_check = 'The market is competitive. Your templates must be visually beautiful and macro-free (for safety) to sell well. One-time effort to build, but requires marketing.',
    skills_required = ARRAY['Excel/Google Sheets Mastery', 'Financial Modeling', 'UI/UX Design'],
    initial_investment_max = 5000,
    monthly_income_max = 50000,
    time_to_first_income_days = 30,
    success_rate_percentage = 45
WHERE slug = 'excel-finance-templates';

-- 4. Offline & Rental
UPDATE income_ideas SET 
    full_description = 'Set up and maintain organic rooftop or balcony gardens for urban residents who want fresh produce but lack the time or skill to maintain it.

### Business Model
1. **Consultation**: Design the layout based on sun exposure and space.
2. **Installation**: Set up grow bags, drip irrigation, and high-quality potting mix.
3. **Subscription**: Offer weekly visits (water checks, pest control, fertilization) for a monthly fee of INR 2k - 5k.
4. **Retail**: Sell seeds, organic manure, and seasonal saplings as add-ons.',
    reality_check = 'Highly physical and weather-dependent. Urban pests (monkeys, birds) and extreme heat in North India can kill entire crops, leading to client churn.',
    skills_required = ARRAY['Horticulture/Gardening', 'CRM', 'Irrigation Setup'],
    initial_investment_max = 50000,
    monthly_income_max = 40000,
    time_to_first_income_days = 45,
    success_rate_percentage = 75
WHERE slug = 'managed-terrace-farming';

UPDATE income_ideas SET 
    full_description = 'Partner with e-commerce giants like Amazon or Flipkart to turn your existing shop or office into a last-mile delivery and pickup hub.

### How it Works
1. **Application**: Apply for the "Amazon Easy" or "I Have Space" program.
2. **Requirement**: A valid business license and a permanent shop location with storage space.
3. **Earnings**: Earn a fixed commission for every parcel handled (typically INR 10 - 20 per parcel).

### Strategic Tip
- Ideal for Kirana stores or stationery shops that already have footfall. It drives new customers to your shop while earning passive delivery fees.',
    reality_check = 'Earnings are volume-dependent. Low-traffic areas might only earn INR 2k - 5k a month. You are responsible for the safety of the parcels while they are in your possession.',
    skills_required = ARRAY['Inventory Tracking', 'Customer Service', 'Smartphone Literacy'],
    initial_investment_max = 5000,
    monthly_income_max = 15000,
    time_to_first_income_days = 45,
    success_rate_percentage = 85
WHERE slug = 'pickup-drop-center';

UPDATE income_ideas SET 
    full_description = 'Watch over pets while their owners are traveling or at work. A high-demand business in Tier 1 and Tier 2 cities due to rising pet ownership.

### Services to Offer
- **Daycare**: 9 AM to 6 PM stays for working professionals.
- **Boarding**: Overnight stays for vacationing owners.
- **Grooming**: Add-on services like bathing and brushing.

### Operational Checklist
- **Space**: Safe, enclosed areas for play.
- **Security**: CCTV monitoring for owner peace of mind.
- **Licensing**: Registration under the Shop and Establishment Act is usually sufficient for home-based setups.',
    reality_check = 'Must love animals and be prepared for cleaning and managing pet behavior. Veterinary medical knowledge (or a tie-up with a local vet) is essential for emergencies.',
    skills_required = ARRAY['Animal Handling', 'Hygiene Standards', 'Emergency First-Aid'],
    initial_investment_max = 200000,
    monthly_income_max = 30000,
    time_to_first_income_days = 30,
    success_rate_percentage = 80
WHERE slug = 'pet-boarding-home';

UPDATE income_ideas SET 
    full_description = 'List your personal car on Zoomcar and earn when you are not using it. Ideal for people with a second car or those who work from home.

### How it Works
1. **Onboarding**: Register your car (must be < 7 years old) on the Zoomcar Host app.
2. **Installation**: A small GPS and safety device is installed for tracking.
3. **Bookings**: Set your car''s availability and hourly rate.
4. **Earnings**: Get paid 60-70% of the booking fee directly to your bank account.',
    reality_check = 'High wear and tear. Guests may return the car dirty or with low fuel. Deductions for cleaning and minor damages can eat into your profit.',
    skills_required = ARRAY['Vehicle Maintenance', 'App Management', 'Patience'],
    initial_investment_max = 50000,
    monthly_income_max = 35000,
    time_to_first_income_days = 7,
    success_rate_percentage = 85
WHERE slug = 'zoomcar-host-income';

UPDATE income_ideas SET 
    full_description = 'Rent out your empty parking spot in crowded areas like Mumbai, Bangalore, or Delhi using dedicated parking apps.

### How it Works
1. **Identify Spot**: Must be a dedicated, safe apartment or office spot.
2. **Platform**: List on Parkify or Peervault.
3. **Access**: Ensure the security guard is informed or provide a remote entry.
4. **Yield**: Earn more if your spot is near a Metro station or IT park.',
    reality_check = 'Societies often have strict rules against non-residents parking inside. Revenue is low (INR 2k - 5k/mo) unless it is a commercial spot.',
    skills_required = ARRAY['Communication', 'Local Networking'],
    initial_investment_max = 0,
    monthly_income_max = 8000,
    time_to_first_income_days = 3,
    success_rate_percentage = 95
WHERE slug = 'parking-space-rental';

-- 5. FINAL CLEANUP: Ensure NO idea has NULL or empty fields
UPDATE income_ideas SET 
    full_description = CASE 
        WHEN full_description IS NULL OR LENGTH(full_description) < 10 THEN 'Detailed operational guide coming soon. This asset type focuses on creating sustainable cash flow with moderate initial effort.'
        ELSE full_description 
    END,
    reality_check = CASE 
        WHEN reality_check IS NULL OR LENGTH(reality_check) < 5 THEN 'Market validation is required. Initial setup time may be higher than expected.'
        ELSE reality_check 
    END,
    skills_required = CASE 
        WHEN skills_required IS NULL OR ARRAY_LENGTH(skills_required, 1) IS NULL THEN ARRAY['Market Research', 'Consistency', 'Basic Sales']
        ELSE skills_required 
    END,
    initial_investment_max = COALESCE(initial_investment_max, initial_investment_min * 2 + 5000),
    monthly_income_max = COALESCE(monthly_income_max, monthly_income_min * 2 + 10000),
    time_to_first_income_days = COALESCE(time_to_first_income_days, 60),
    success_rate_percentage = COALESCE(success_rate_percentage, 50)
WHERE full_description IS NULL 
   OR LENGTH(full_description) < 100 
   OR reality_check IS NULL 
   OR skills_required IS NULL 
   OR initial_investment_max IS NULL;

-- 🚀 ULTIMATE SILENT MONEY DATA ENRICHMENT - BATCH 2
-- Run this in your Supabase SQL Editor to fill 20 more high-value ideas.

-- 1. Digital Content & Syndication
UPDATE income_ideas SET 
    full_description = 'Distribute high-value "gated" content (E-books, templates, or whitepapers) to partner networks to generate B2B leads.

### How it Works
1. **Create Asset**: Build a value-dense resource (e.g., "The 2025 Guide to GST Compliance for Startups").
2. **Network Partner**: Join syndication networks like ITmunch or LeadSpot.
3. **Monetization**: Earn a flat fee per qualified lead (CPL) which typically ranges from INR 3,000 to INR 6,000.
4. **Automation**: Set up a landing page to collect data and auto-forward it to the buyer.',
    reality_check = 'Content must be high-quality. Low-quality leads will be rejected by the buyer, meaning no payout for your effort.',
    skills_required = ARRAY['B2B Copywriting', 'Lead Generation', 'Niche Research'],
    initial_investment_max = 10000,
    monthly_income_max = 150000,
    time_to_first_income_days = 45,
    success_rate_percentage = 55
WHERE slug = 'content-syndication';

UPDATE income_ideas SET 
    full_description = 'Build an agency that connects Indian brands with "UGC" creators who produce authentic, raw video reviews for marketing campaigns.

### Business Model
1. **Recruitment**: Build a database of 20-50 creators (students, homemakers, micro-influencers).
2. **Outreach**: Offer brands a "3-Video Starter Pack" for INR 25k - 40k.
3. **Operations**: You handle the brief, the creator does the filming, and you deliver the edited asset to the brand.
4. **Scale**: Move from one-off videos to "Content Retainers" (10 videos a month).',
    reality_check = 'Coordination is the hardest part. Creators might miss deadlines or deliver poor quality, requiring you to step in and fix the content last minute.',
    skills_required = ARRAY['Project Management', 'Creator Recruitment', 'Brief Writing'],
    initial_investment_max = 5000,
    monthly_income_max = 200000,
    time_to_first_income_days = 20,
    success_rate_percentage = 65
WHERE slug = 'user-generated-content-ugc';

UPDATE income_ideas SET 
    full_description = 'Start your own clothing brand without handling manufacturing or shipping using Indian POD providers like TeeShopper or Printrove.

### The 2025 Strategy
1. **Niche Design**: Choose a narrow niche (e.g., "Anime for Indian Fans" or "Regional Language Quotes").
2. **Shopify/Instamojo**: Link your designs to an online store.
3. **Marketing**: Focus on Meta Ads and Pinterest to drive traffic.
4. **Passive Flow**: When a customer buys, the partner prints and ships it; you keep the profit margin (approx 20-30%).',
    reality_check = 'Margins are thin. You need high volume to make significant profit. High ad costs can quickly turn your business into a loss-making venture if your designs don''t convert.',
    skills_required = ARRAY['Graphic Design', 'Ad Management (FB/IG)', 'Niche Curation'],
    initial_investment_max = 25000,
    monthly_income_max = 80000,
    time_to_first_income_days = 15,
    success_rate_percentage = 40
WHERE slug = 'print-on-demand-clothing';

-- 2. Physical & Local Services
UPDATE income_ideas SET 
    full_description = 'Help local Indian businesses (Doctors, CAs, Restaurants) rank #1 on Google Maps for their service area.

### Service Steps
1. **GMB Optimization**: Complete their "Google My Business" profile with photos and keyword-rich descriptions.
2. **Review Strategy**: Set up a QR code system for them to collect real customer reviews.
3. **Citations**: Build local listings in directories like JustDial or Indiamart.
4. **Subscription**: Charge a "Maintenance Fee" (INR 5k/mo) to keep their profile active and respond to reviews.',
    reality_check = 'Google is very strict about verified addresses. If a listing gets suspended, the client will blame you. Requires constant monitoring of algorithm changes.',
    skills_required = ARRAY['Local SEO Knowledge', 'Communication', 'Persistence'],
    initial_investment_max = 2000,
    monthly_income_max = 60000,
    time_to_first_income_days = 30,
    success_rate_percentage = 75
WHERE slug = 'local-seo-consultancy';

UPDATE income_ideas SET 
    full_description = 'Rent out high-end cinema cameras (Sony FX3, Red, Arri) and lenses to the growing community of filmmakers and high-end creators.

### Operational Guide
1. **Inventory**: Focus on high-demand "Essential Packs" (Camera + 2 Lenses + Gimbal).
2. **Security**: Mandatory physical identity check and a heavy refundable security deposit.
3. **Logistics**: Use local delivery or a physical pickup point with a proper testing bench.
4. **AMC**: Set aside 10% of income for regular equipment servicing.',
    reality_check = 'Extreme capital intensive. Equipment becomes obsolete every 3-4 years. One bad rental (stolen or damaged) can wipe out your yearly profits.',
    skills_required = ARRAY['Photography Tech Knowledge', 'Risk Assessment', 'Inventory Mgmt'],
    initial_investment_max = 2000000,
    monthly_income_max = 150000,
    time_to_first_income_days = 14,
    success_rate_percentage = 80
WHERE slug = 'rental-camera-gear';

-- 3. High-End Consulting (Fractional)
UPDATE income_ideas SET 
    full_description = 'Provide high-level marketing strategy to early-stage startups part-time. The "CMO-for-hire" model.

### Services
- **Go-to-Market (GTM)**: Designing how a new product should launch in India.
- **System Building**: Hiring the first marketing team members and setting up trackers.
- **Reporting**: Monthly board-level audits for the founders.
- **Retainer**: Typical rates are INR 1.5L - 3L per client (1-2 days/week work).',
    reality_check = 'You must have a proven track record (5+ years in marketing) or previous successful exits. If you don''t drive growth, startups will fire you fast.',
    skills_required = ARRAY['Growth Strategy', 'Analytics', 'Personal Branding'],
    initial_investment_max = 5000,
    monthly_income_max = 500000,
    time_to_first_income_days = 60,
    success_rate_percentage = 35
WHERE slug = 'fractional-cmo-india';

UPDATE income_ideas SET 
    full_description = 'Help companies build scalable tech architectures without being a full-time employee.

### Deliverables
- **Code Audits**: Reviewing the security and health of a startup''s codebase.
- **Tech Hiring**: Screening and interviewing senior developers.
- **Scale Planning**: Moving from monolith to microservices or setting up AWS/GCP pipelines.',
    reality_check = 'Responsibility is heavy. If the site crashes or a data leak occurs, you are the first one in the "hot seat". Requires high seniority.',
    skills_required = ARRAY['System Architecture', 'Cloud Ops', 'Engineering Mgmt'],
    initial_investment_max = 10000,
    monthly_income_max = 600000,
    time_to_first_income_days = 45,
    success_rate_percentage = 30
WHERE slug = 'fractional-cto-service';

-- 4. Online Operations & Reselling
UPDATE income_ideas SET 
    full_description = 'Buy and sell keyword-rich .in or premium .com domains. The "Real Estate" of the digital world.

### Workflow
1. **Acquisition**: Buy expiring domains on "GoDaddy Auctions" or "SnapNames".
2. **Parking**: Use Sedo or Afternic to display a "For Sale" page with your contact info.
3. **Inbound**: Wait for a business to realize the value of the domain.
4. **Transaction**: Use an Escrow service (Escrow.com) to ensure safe transfer of funds.',
    reality_check = 'You might hold a domain for 10 years and never sell it. Renewals cost money every year. High degree of "luck" and niche research required.',
    skills_required = ARRAY['Domain Valuations', 'Negotiation', 'SEO Research'],
    initial_investment_max = 100000,
    monthly_income_max = 200000,
    time_to_first_income_days = 365,
    success_rate_percentage = 20
WHERE slug = 'domain-flipping-luxury';

UPDATE income_ideas SET 
    full_description = 'Resell powerful B2B software platforms (like HighLevel or customized CRMs) under your own brand and domain.

### Plan of Action
1. **Choose Platform**: Get a "White Label" license for a tool like GoHighLevel or specialized WhatsApp automation.
2. **Packaging**: Bundle it with service (e.g., "Software + 2 AI Chatbots for Real Estate Agents").
3. **Sales**: Target a specific industry and charge a recurring monthly fee (SaaS).
4. **Support**: You handle the customer support, while the parent platform handles the hosting.',
    reality_check = 'Support can be time-consuming. If the parent platform has a bug, you have to defend it to your clients. Requires strong localized sales.',
    skills_required = ARRAY['Sales', 'Basic Tech Setup', 'Industry Insights'],
    initial_investment_max = 40000,
    monthly_income_max = 300000,
    time_to_first_income_days = 30,
    success_rate_percentage = 50
WHERE slug = 'white-label-saas-agency';

UPDATE income_ideas SET 
    full_description = 'Build and monetize a paid digital community focusing on high-stakes topics like trading, careers, or real estate.

### Setup
1. **Value Focus**: Choose a topic where members get an "ROI" (e.g., Job referrals or stock picks).
2. **Platform**: Use Circle.so, Discord, or a dedicated WhatsApp/Telegram group.
3. **Monetization**: Monthly subscription via Zoho Subscriptions or Cosmofeed.
4. **Growth**: Host weekly webinars or invite guest experts to keep the value high.',
    reality_check = 'Community management is exhausting. If you don''t post daily, engagement drops, and people cancel. High churn rate if the "Vibe" is lost.',
    skills_required = ARRAY['Facilitation', 'Content Creation', 'Sales'],
    initial_investment_max = 5000,
    monthly_income_max = 200000,
    time_to_first_income_days = 60,
    success_rate_percentage = 45
WHERE slug = 'membership-community-site';

UPDATE income_ideas SET 
    full_description = 'Manage large-scale Google Ads accounts for local and international brands. Focus on finding high ROAS (Return on Ad Spend).

### Service Model
- **Setup Fee**: INR 10k - 20k for initial tracking and campaign build.
- **Mgmt Fee**: 10-15% of the monthly ad spend or a flat INR 30k+ retainer.
- **Reporting**: Weekly performance audits and conversion optimization.',
    reality_check = 'Google Ads has a steep learning curve. One wrong setting can waste thousands of the client''s budget in hours. Requires high attention to detail.',
    skills_required = ARRAY['PPC Strategy', 'Data Analytics', 'Landing Page Audits'],
    initial_investment_max = 5000,
    monthly_income_max = 120000,
    time_to_first_income_days = 20,
    success_rate_percentage = 60
WHERE slug = 'google-ads-management-service';

UPDATE income_ideas SET 
    full_description = 'Close high-ticket sales (INR 1L+ packages) for international coaches, agencies, or SaaS founders.

### How it Works
1. **Find a Partner**: Look for companies selling high-priced certifications or consulting.
2. **Role**: You get the "Warm Leads" (people who booked a call) and you close them over Zoom.
3. **Commission**: Typically earn 10-15% of the sale (e.g., INR 15k for one successful close).
4. **Flexibility**: Work nights (US time) or days (Europe) from India.',
    reality_check = 'No sale means no pay. Requires thick skin and the ability to handle objections for 45-60 minutes on a call. Performance-based pressure is high.',
    skills_required = ARRAY['Sales/Negotiation', 'English Proficiency', 'Psychology'],
    initial_investment_max = 0,
    monthly_income_max = 250000,
    time_to_first_income_days = 15,
    success_rate_percentage = 40
WHERE slug = 'high-ticket-sales-closer';

UPDATE income_ideas SET 
    full_description = 'Design and sell pre-built company dashboards, setup frameworks, and branding styles for Notion-active businesses.

### Offerings
- **Client Portals**: Notion pages for agencies to share work with clients.
- **Internal Wikis**: SOPs and onboarding docs for remote teams.
- **Customization**: Charging INR 20k - 50k for a one-time "Notion Workspace Overhaul".',
    reality_check = 'Notion is easy to copy. You must provide a "workflow" not just a visual layout to be worth premium prices. Requires deep organizational logic.',
    skills_required = ARRAY['Notion Mastery', 'UX/Organisational Logic', 'Branding Design'],
    initial_investment_max = 2000,
    monthly_income_max = 70000,
    time_to_first_income_days = 30,
    success_rate_percentage = 55
WHERE slug = 'notion-branding-agency';

UPDATE income_ideas SET 
    full_description = 'Help businesses launch a complete e-commerce ecosystem, including Shopify, payment gateways, and last-mile logistics integrations.

### Deliverables
- **Storefront**: High-converting UI/UX design on Shopify.
- **Tech Stack**: Setting up Shiprocket, Razorpay, and WhatsApp marketing tools.
- **Inventory Sync**: Connect their physical warehouse to the digital store.',
    reality_check = 'Clients expect "Sales" not just a "Store". You must set clear expectations that your job is the "Infrastructure" while they handle the "Marketing".',
    skills_required = ARRAY['E-com Ecosystems', 'Project Management', 'Tech Setup'],
    initial_investment_max = 10000,
    monthly_income_max = 150000,
    time_to_first_income_days = 25,
    success_rate_percentage = 70
WHERE slug = 'ecommerce-store-setup';

UPDATE income_ideas SET 
    full_description = 'Help podcasters turn their long-form recordings into high-growth social media assets like YouTube Shorts, Reels, and TikTok clips.

### Service Path
1. **Audio Cleaning**: Remove background noise and "filler" words.
2. **Clipping**: Find the most viral 60 seconds from a 60-min podcast.
3. **Subtitles**: Design aesthetic, high-retention captions.
4. **Distribution**: Auto-post to all social platforms for the client.',
    reality_check = 'Time-intensive. Artificial Intelligence tools are automating this, so you must offer "Creative Direction" and "High Editing Nuance" to stay ahead of AI.',
    skills_required = ARRAY['Video Editing', 'Viral Hook Identification', 'Sound Design'],
    initial_investment_max = 20000,
    monthly_income_max = 100000,
    time_to_first_income_days = 10,
    success_rate_percentage = 65
WHERE slug = 'podcast-editing-service';

UPDATE income_ideas SET 
    full_description = 'Help thought leaders and executives write their memoirs, industry books, or a series of deep-dive articles.

### Business Model
1. **Interviewing**: Record 10-15 hours of conversation with the client.
2. **Drafting**: Transcribe and "beautify" the conversation into formal, engaging prose.
3. **Publishing**: Handle the Amazon KDP setup or traditional publishing outreach.
4. **Yield**: Fees range from INR 2L - 10L per book project.',
    reality_check = 'Very long feedback cycles. Clients can be picky about their "Voice". One project can take 6 months of active work.',
    skills_required = ARRAY['Interviewing', 'Creative Writing', 'Persistence'],
    initial_investment_max = 0,
    monthly_income_max = 150000,
    time_to_first_income_days = 120,
    success_rate_percentage = 30
WHERE slug = 'ghostwriting-service';

UPDATE income_ideas SET 
    full_description = 'Act as a "Talent Scout" for newsletters. Connect brands looking to advertise with niche newsletters that have high engagement.

### Workflow
1. **Curation**: Maintain a directory of 500+ small-to-medium newsletters.
2. **Verification**: Audit their open rates and audience quality.
3. **Booking**: Handle the contract between the Brand and the Publisher.
4. **Fee**: Keep a 15-20% broker fee for every sponsorship booked.',
    reality_check = 'Getting the first few brands is hard. Newsletters can lie about their stats; you must use verification tools to protect your reputation with brands.',
    skills_required = ARRAY['Sales', 'Directory Mgmt', 'Auditing'],
    initial_investment_max = 2000,
    monthly_income_max = 120000,
    time_to_first_income_days = 40,
    success_rate_percentage = 50
WHERE slug = 'newsletter-sponsorships-broker';

UPDATE income_ideas SET 
    full_description = 'Build and sell specific code snippets, UI blocks (Tailwind/React), or WordPress plugins on specialized marketplaces.

### Strategy
1. **Code Market**: List on CodeCanyon or your own storefront (using LemonSqueezy).
2. **Niche**: Build something specific like "An India-Specific ZIP code validator for Shopify".
3. **Maintenance**: Offer 6 months of free updates to build high ratings.',
    reality_check = 'Plagiarism is common. Your code might be stolen and resold. Focus on tools that require "License Keys" or remote API calls to prevent theft.',
    skills_required = ARRAY['Programming', 'MVP Development', 'Documentation'],
    initial_investment_max = 5000,
    monthly_income_max = 60000,
    time_to_first_income_days = 60,
    success_rate_percentage = 35
WHERE slug = 'selling-software-components';

UPDATE income_ideas SET 
    full_description = 'Promote recurring software subscriptions (ERP, CRM, SEO tools) to businesses and earn monthly commissions for life.

### The 2025 Strategy
1. **Find Tools**: Partner with companies like Zoho, Shopify, or SEMRush.
2. **Education**: Create tutorials on "How to Scale your Boutique using Shopify".
3. **Income Path**: Earn 20-30% of the subscription fee every month the client stays active.',
    reality_check = 'High churn in India. Small businesses often cancel software after the first month if they don''t see immediate value. Focus on "Sticky" mission-critical software.',
    skills_required = ARRAY['Digital Sales', 'Problem Solving', 'Content Marketing'],
    initial_investment_max = 0,
    monthly_income_max = 100000,
    time_to_first_income_days = 90,
    success_rate_percentage = 45
WHERE slug = 'saas-affiliate-marketing';

UPDATE income_ideas SET 
    full_description = 'Lend your expertise to B2B companies looking for high-value strategic partnerships. Earn a percentage of every successful deal closed.

### How it Works
1. **Network**: Maintain a high-value network of decision-makers.
2. **Intro**: Introduce a solution (e.g., Cloud Security) to a potential buyer.
3. **Contract**: Sign a "Referral Agreement" specifying your cut (typically 5-10% of total deal value).
4. **Payout**: Often yields INR 50k - 5L per successful intro.',
    reality_check = 'High stakes. Your reputation is on the line. If the solution you recommend fails, your network trust is destroyed.',
    skills_required = ARRAY['Networking', 'Strategic Thinking', 'Negotiation'],
    initial_investment_max = 0,
    monthly_income_max = 300000,
    time_to_first_income_days = 90,
    success_rate_percentage = 40
WHERE slug = 'premium-referral-partnerships';

-- 🚀 ULTIMATE SILENT MONEY DATA ENRICHMENT - BATCH 3
-- Run this in your Supabase SQL Editor to fill 20 more high-value ideas.

-- 1. Real Estate & Physical Yields
UPDATE income_ideas SET 
    full_description = 'Invest in large-scale commercial real estate (offices, tech parks) through the stock market. Earn regular dividends without owning a single brick.

### Top Indian REITs
1. **Embassy Office Parks**: Largest in Asia with Grade-A properties in Bangalore and Mumbai.
2. **Brookfield India**: Focuses on campus-style tech parks in Gurgaon and Kolkata.
3. **Mindspace Business Parks**: Strong presence in Hyderabad and Pune.

### Returns
- **Dividend Yield**: Typically 5% - 7% per annum.
- **Payout Frequency**: Mandated by SEBI to distribute 90% of cash flows quarterly.',
    reality_check = 'Share price can go up or down. If commercial vacancy rises (due to work-from-home trends), dividend yields might drop.',
    skills_required = ARRAY['Market Analysis', 'Dividend Tracking'],
    initial_investment_max = 500000,
    monthly_income_max = 25000,
    time_to_first_income_days = 90,
    success_rate_percentage = 98
WHERE slug = 'reit-investing-india';

UPDATE income_ideas SET 
    full_description = 'Deploy smart, unmanned vending machines in high-traffic zones like IT Parks, Hospitals, and Building Receptions.

### Setup Guide
1. **Machine Cost**: Smart kiosks cost between INR 1.5L - 2.5L.
2. **Product Mix**: High-margin snacks (20-25%) and fresh food (30-45%).
3. **Location**: The "Golden Rule" - must have at least 200+ footfalls daily.
4. **Maintenance**: Weekly restocking and app-based real-time inventory tracking.',
    reality_check = 'Theft and vandalism in public spaces are risks. Rent for the machine spot can sometimes be as high as 10-15% of your revenue.',
    skills_required = ARRAY['Inventory Management', 'Negotiation', 'Logistics'],
    initial_investment_max = 300000,
    monthly_income_max = 15000,
    time_to_first_income_days = 45,
    success_rate_percentage = 85
WHERE slug = 'vending-machine-networks';

UPDATE income_ideas SET 
    full_description = 'Turn your car (or a fleet) into a moving billboard. Earn monthly side income by letting brands "wrap" your vehicle with ads.

### Platforms in India
- **Wrap2Earn**: Connects cab drivers and private owners with advertisers.
- **How it Works**: You drive your regular routes; a GPS app tracks your mileage.
- **Earnings**: Range from INR 2k to 8k per month depending on the cities and kilometers driven.',
    reality_check = 'Wraps can sometimes damage the paint if removed poorly. Many campaigns only want high-mileage cars (cabs), making it harder for low-use private cars.',
    skills_required = ARRAY['Safe Driving', 'App Compliance'],
    initial_investment_max = 0,
    monthly_income_max = 8000,
    time_to_first_income_days = 30,
    success_rate_percentage = 95
WHERE slug = 'car-advertising-wraps';

-- 2. Fixed Income & Debt
UPDATE income_ideas SET 
    full_description = 'Lend your money to established Indian corporations for better-than-FD returns. Senior secured bonds offer high safety with predictable interest.

### Platforms
- **Wint Wealth / GoldenPi**: Curated selections of corporate bonds.
- **Yields**: Typically 9% to 12% per annum.
- **Security**: Focus on "Senior Secured" bonds where your debt is backed by company assets.
- **Liquidity**: Bonds are held in your Demat account and can be sold on the secondary market.',
    reality_check = 'Credit Risk - if the company goes bankrupt, your capital might be lost. Liquidity Risk - the secondary market for some bonds is very thin (hard to sell fast).',
    skills_required = ARRAY['Credit Rating Literacy', 'Portfolio Sizing'],
    initial_investment_max = 500000,
    monthly_income_max = 5000,
    time_to_first_income_days = 30,
    success_rate_percentage = 95
WHERE slug = 'corporate-bond-investing';

-- 3. Digital Asset Flipping & Agencies
UPDATE income_ideas SET 
    full_description = 'Act as the "Digital Matchmaker" for Indian Real Estate. Generate high-intent leads for brokers and developers using targeted social ads.

### Process
1. **Landy Utility**: Create a simple landing page for a specific project (e.g., "Luxury 3BHK in Gurgaon").
2. **FB/IG Ads**: Target specific high-net-worth (HNW) interest groups.
3. **Data Sale**: Sell verified leads to brokers for INR 500 - 2,500 per lead.
4. **Automation**: Use AI bots to qualify the lead before passing it to the human agent.',
    reality_check = 'High competition among lead generators. If lead quality is poor (wrong numbers, uninterested), brokers will stop buying from you instantly.',
    skills_required = ARRAY['Meta Ads', 'CRM Automation', 'Sales Hook Design'],
    initial_investment_max = 20000,
    monthly_income_max = 120000,
    time_to_first_income_days = 15,
    success_rate_percentage = 55
WHERE slug = 'lead-generation-real-estate';

UPDATE income_ideas SET 
    full_description = 'Build a high-volume media asset by creating content in Hindi or regional languages. Regional markets have massive reach but less creator competition.

### Successful Niches
- **Finance**: Explaining government schemes (like Ladli Behna or PM Kisan) in simple Hindi.
- **Agri-Tech**: Modern farming tools and techniques for Indian farmers.
- **Tech Reviews**: Budget smartphone and gadget guides for Tier 2/3 audiences.',
    reality_check = 'Ad rates (RPM) for Hindi/Regional content are significantly lower than English. You need 5x the views to make the same money as a Global channel.',
    skills_required = ARRAY['Regional Script Writing', 'Video Presentation', 'Community Building'],
    initial_investment_max = 10000,
    monthly_income_max = 250000,
    time_to_first_income_days = 180,
    success_rate_percentage = 40
WHERE slug = 'youtube-channel-hindi';

UPDATE income_ideas SET 
    full_description = 'The "Arbitrage" business model. You find clients for high-end services (SEO, Web Dev, Design) and outsource the work to freelancers while keeping the margin.

### Scaling Path
1. **Front-end**: Build a professional website as an "Agency".
2. **Sales**: Target international clients on LinkedIn or Upwork.
3. **Supply**: Find reliable Indian freelancers on specialized Slack/Discord groups.
4. **Passive**: Once you have a trusted project manager, your role becomes purely high-level sales.',
    reality_check = 'Quality control is a nightmare. If the freelancer flakes or delivers bad work, you lose your reputation and have to refund the client.',
    skills_required = ARRAY['Sales', 'Vendor Mgmt', 'Project Auditing'],
    initial_investment_max = 5000,
    monthly_income_max = 200000,
    time_to_first_income_days = 30,
    success_rate_percentage = 50
WHERE slug = 'drop-servicing-agency';

UPDATE income_ideas SET 
    full_description = 'Build niche "Themed" pages on Instagram around specific interests like Home Decor, AI Tools, or Motivational Quotes.

### Monetization Path
- **Shoutouts**: Charging smaller brands to post their story/link.
- **Affiliate marketing**: Selling products from Amazon/Myntra relevant to your theme.
- **Selling the Asset**: Niche pages with 50k+ followers can be sold for INR 50k - 2L on marketplaces.',
    reality_check = 'Algorithm changes can kill your reach overnight. Ghost-following or fake engagement will get your page shadow-banned by Insta.',
    skills_required = ARRAY['Content Curation', 'Hashtag Strategy', 'Canva Graphics'],
    initial_investment_max = 0,
    monthly_income_max = 40000,
    time_to_first_income_days = 90,
    success_rate_percentage = 45
WHERE slug = 'instagram-niche-page';

UPDATE income_ideas SET 
    full_description = 'Package and sell your unique expertise into a scalable digital asset. Use Indian platforms like Graphy or international ones like Teachable.

### Hot Skills in Demand
- **Technical**: Learning AI agents, Data Analytics for business.
- **Creative**: Mobile cinematography, UI/UX from scratch.
- **Career**: Cracking FAANG interviews, GMAT/UPSC prep.',
    reality_check = 'Pre-launching is crucial; don''t build the whole course until you have 10-20 people willing to pay. 90% of your work is marketing, not teaching.',
    skills_required = ARRAY['Curriculum Design', 'Public Speaking', 'Funnel Building'],
    initial_investment_max = 5000,
    monthly_income_max = 300000,
    time_to_first_income_days = 60,
    success_rate_percentage = 35
WHERE slug = 'online-course-creation';

UPDATE income_ideas SET 
    full_description = 'Submit high-quality photographs of everyday Indian life, festivals, and landscapes to global stock libraries.

### Best Platforms
- **Adobe Stock / Shutterstock**: Standard global reach.
- **ImagesBazaar**: Largest collection specifically for the Indian context.
- **Royalties**: Earn between $0.10 to $100 per download depending on the license.',
    reality_check = 'Extremely high volume required. You need to upload 1000+ high-quality images before seeing significant recurring income.',
    skills_required = ARRAY['Photography', 'Keyword Tagging', 'Lighting'],
    initial_investment_max = 50000,
    monthly_income_max = 30000,
    time_to_first_income_days = 120,
    success_rate_percentage = 60
WHERE slug = 'stock-photography';

UPDATE income_ideas SET 
    full_description = 'Publish "Low Content" or "Niche Non-Fiction" books on Amazon Kindle Direct Publishing (KDP).

### Winning Strategy
- **Niche**: Focus on "Cookbooks for Air Fryers" or "Mental Math Workbooks".
- **Design**: Hire a high-end cover designer; the cover sells the book.
- **Global**: Your royalties come from USD sales (US/UK/Germany), making it a great currency hedge.',
    reality_check = 'Amazon ads can be expensive. If you don''t get enough reviews initially, your book will sink to the bottom of the search results.',
    skills_required = ARRAY['Keyword Research', 'Basic Editing', 'Graphic Literacy'],
    initial_investment_max = 5000,
    monthly_income_max = 80000,
    time_to_first_income_days = 45,
    success_rate_percentage = 50
WHERE slug = 'book-publishing-kdp';

UPDATE income_ideas SET 
    full_description = 'Sell digital art, printable posters, or aesthetic planners to a global audience using platforms like Etsy or Pinterest.

### Deliverables
- **Print-at-Home**: Aesthetic wall art for modern homes.
- **Digital Planners**: Specialized templates for Goodnotes or Notability.
- **Customized**: "Portrait-to-Illustration" services where you use AI tools to convert a photo into art.',
    reality_check = 'Plagiarism is rampant. Others will copy your designs the moment they sell well. Constantly innovate your style to keep buyers interested.',
    skills_required = ARRAY['Graphic Design', 'Trend Analysis', 'Etsy SEO'],
    initial_investment_max = 0,
    monthly_income_max = 50000,
    time_to_first_income_days = 30,
    success_rate_percentage = 65
WHERE slug = 'selling-digital-art';

UPDATE income_ideas SET 
    full_description = 'Resell white-labeled SEO audit and reporting tools to small marketing agencies that don''t have their own dev teams.

### Business Model
1. **White Label**: Use a tool like SEOProfiler or AgencyAnalytics that allows custom branding.
2. **Subscription**: Charge agencies INR 5k - 10k/mo for automated client reporting.
3. **Upsell**: Offer one-time "Strategy Audits" as an entry point.',
    reality_check = 'Agencies are price-sensitive. If the parent software price increases, your margins will be squeezed. Requires strong B2B sales skills.',
    skills_required = ARRAY['SEO Basics', 'B2B Sales', 'Tech Integration'],
    initial_investment_max = 15000,
    monthly_income_max = 80000,
    time_to_first_income_days = 45,
    success_rate_percentage = 55
WHERE slug = 'white-label-seo-reports';

UPDATE income_ideas SET 
    full_description = 'Build and sell specialized plugins or themes that solve recurring problems for Shopify or WordPress users.

### Action Plan
1. **Identify Friction**: e.g., "An Indian WhatsApp order tracking plugin".
2. **Build MVP**: Focus on speed and reliability.
3. **Monetize**: Use "Freemium" models where advanced features cost INR 499/mo.
4. **Royalty**: Marketplaces like Envato or the Shopify App Store take a cut but handle the traffic.',
    reality_check = 'Building the plugin is only 20% of the work. Customer support for different hosting environments will take up most of your time.',
    skills_required = ARRAY['PHP/Liquid/JS', 'API Integrations', 'Technical Support'],
    initial_investment_max = 10000,
    monthly_income_max = 120000,
    time_to_first_income_days = 90,
    success_rate_percentage = 30
WHERE slug = 'recurring-plugin-subscriptions';

UPDATE income_ideas SET 
    full_description = 'Offer specialized medical, legal, or business transcription services to firms that need high-accuracy text records.

### Niche Focus
- **Medical**: Transcribing doctor''s notes for US-based practices from India.
- **Legal**: Records for court proceedings or arbitration.
- **AI Training**: Transcribing data to help train specialized LLMs.',
    reality_check = 'AI transcription tools (like whisper) are becoming scarily accurate. You must focus on "Proofreading" and "High-stakes accuracy" to compete with free AI tools.',
    skills_required = ARRAY['Listening Accuracy', 'Fast Typing', 'Domain Terminology'],
    initial_investment_max = 0,
    monthly_income_max = 40000,
    time_to_first_income_days = 7,
    success_rate_percentage = 70
WHERE slug = 'transcription-agency';

UPDATE income_ideas SET 
    full_description = 'Act as an agency connecting Indian voice talent (dubbing, narration, ads) with global production houses.

### Service Model
1. **Talent Hub**: Scout and sample 50+ diverse Indian voices.
2. **Language Mix**: Focus on dubbing English content into Hindi/Tamil/Telugu.
3. **Income**: You keep a 20-30% agency fee for every project booked through your booth.',
    reality_check = 'AI voice clones (like ElevenLabs) are replacing entry-level VO work. Only high-end dramatic or niche-dialect voices are currently safe and highly paid.',
    skills_required = ARRAY['Talent Scouting', 'Sound Quality Auditing', 'International Sales'],
    initial_investment_max = 10000,
    monthly_income_max = 150000,
    time_to_first_income_days = 30,
    success_rate_percentage = 50
WHERE slug = 'voice-over-services';

UPDATE income_ideas SET 
    full_description = 'Help global companies localize their products for the massive Indian regional market.

### Deliverables
- **UI Localization**: Translating buttons and instructions for apps.
- **Marketing Transcreation**: Adapting hooks and ads to work culturally in regional contexts.
- **Payout**: Yields premium rates compared to simple literal translation.',
    reality_check = 'Requires native-level fluency in at least 2-3 regional languages. AI is good at translation but bad at "cultural context" - that is your USP.',
    skills_required = ARRAY['Regional Fluency', 'Copywriting', 'Cultural Analysis'],
    initial_investment_max = 0,
    monthly_income_max = 100000,
    time_to_first_income_days = 15,
    success_rate_percentage = 75
WHERE slug = 'translation-service-regional';

UPDATE income_ideas SET 
    full_description = 'Build an agency that provides specialized virtual assistants (VAs) to international founders and creators.

### High Demand VAs
- **Technical VA**: Managing Zapier setups and simple dev tasks.
- **Scheduling VA**: Handling high-stakes calendar management.
- **Operations VA**: Running a business''s internal Slack and Notion.',
    reality_check = 'Managing a team of VAs is hard. You are responsible for their "training" and "integrity". One slip-up (like data theft) by a VA can ruin your agency.',
    skills_required = ARRAY['HR Management', 'Vetting', 'Process Building'],
    initial_investment_max = 5000,
    monthly_income_max = 200000,
    time_to_first_income_days = 30,
    success_rate_percentage = 60
WHERE slug = 'virtual-assistant-agency';

UPDATE income_ideas SET 
    full_description = 'Build, test, and rent out algorithmic trading bots that automate stock or crypto trades based on technical indicators.

### Tech Stack
- **Tradetron / AlgoBulls**: Platforms to deploy without deep coding.
- **PineScript / Python**: For building custom signal logic.
- **Income**: Subscription fees from people using your "proven" strategy or a percentage of their profits.',
    reality_check = 'Past performance is NOT an indicator of future success. A bot that makes 20% in a bull market might lose 50% in a week if the market regime changes.',
    skills_required = ARRAY['Technical Analysis', 'Basic Scripting', 'Risk Management'],
    initial_investment_max = 25000,
    monthly_income_max = 100000,
    time_to_first_income_days = 60,
    success_rate_percentage = 25
WHERE slug = 'automated-trading-bots';

UPDATE income_ideas SET 
    full_description = 'Act as a high-end broker for luxury car rentals for weddings, destination shoots, and VIP visits.

### How it Works
1. **Supply**: Find owners of luxury cars (Audi, BMW, Rolls Royce) willing to rent them for events.
2. **Marketing**: Network with high-end wedding planners and photographers.
3. **Transaction**: You handle the insurance, deposit, and driver vetting while keeping a 15-20% commission.',
    reality_check = 'High liability. One scratch on a luxury car can cost lakhs. You need iron-clad legal contracts and high-end insurance partners.',
    skills_required = ARRAY['Network Building', 'Negotiation', 'Legal Basics'],
    initial_investment_max = 5000,
    monthly_income_max = 70000,
    time_to_first_income_days = 45,
    success_rate_percentage = 55
WHERE slug = 'luxury-car-rental-scouting';

-- 🚀 ULTIMATE SILENT MONEY DATA ENRICHMENT - BATCH 4
-- Run this in your Supabase SQL Editor.

-- 1. Institutional Assets
UPDATE income_ideas SET 
    full_description = 'Own a piece of Grade-A commercial buildings without needing crores. Platforms like Strata and PropShare let you invest alongside institutions.

### How it Works
1. **Selection**: Choose a property (Warehouse, Office Park, or Data Center) on the platform.
2. **Investment**: Ticket sizes usually start from INR 10L - 25L.
3. **Returns**: Earn monthly rental income plus a share of the property appreciation on exit.
4. **Target Yield**: Typically 13% - 16% IRR (Rental + Capital Appreciation).',
    reality_check = 'Highly illiquid. Your money is locked until the asset is sold (usually 3-5 years). Regulatory risks exist as SM REIT rules are still evolving in India.',
    skills_required = ARRAY['Property Valuation', 'Financial Modeling', 'Legal Literacy'],
    initial_investment_max = 2500000,
    monthly_income_max = 40000,
    time_to_first_income_days = 90,
    success_rate_percentage = 90
WHERE slug = 'fractional-real-estate';

UPDATE income_ideas SET 
    full_description = 'Earn royalties every time a song is streamed on Spotify, played on YouTube, or used in a Netflix show.

### Process
1. **Platform**: Join marketplaces like Sonomo or Royalty Exchange.
2. **Fractional Shares**: Buy a portion of a catalog''s future earning rights.
3. **Payouts**: Receive regular distributions from the Indian Performing Right Society (IPRS) or direct streaming providers.
4. **Returns**: Historical IRR for music assets ranges between 9% and 12% per year.',
    reality_check = 'A song''s popularity can fade overnight. High risk if the catalog isn''t diversified or if streaming algorithms change.',
    skills_required = ARRAY['Trend Analysis', 'Digital Media Rights', 'Risk Hedging'],
    initial_investment_max = 100000,
    monthly_income_max = 15000,
    time_to_first_income_days = 120,
    success_rate_percentage = 60
WHERE slug = 'music-royalty-investing';

UPDATE income_ideas SET 
    full_description = 'Park your emergency fund in challenger banks and small finance banks offering up to 7% interest with daily/monthly credit.

### Best Options (2025)
- **IDFC FIRST Bank**: Up to 6.5% interest on balances above 10L.
- **AU Small Finance**: Consistent 7% interest for high-tier accounts.
- **RBL Bank**: Tiered rates often matching or beating FDs.
- **ActivMoney (Kotak)**: Automatically sweeps excess funds to high-interest buckets.',
    reality_check = 'Inflation in India is often 5-6%, so "real returns" are only 1-2%. RBI insurance only covers up to INR 5 Lakhs per depositor.',
    skills_required = ARRAY['Bank Comparison', 'Tax Planning'],
    initial_investment_max = 1000000,
    monthly_income_max = 6000,
    time_to_first_income_days = 30,
    success_rate_percentage = 99
WHERE slug = 'high-yield-savings-india';

-- 2. Performance Agencies
UPDATE income_ideas SET 
    full_description = 'Automate B2B lead generation for global clients using highly personalized cold email sequences.

### Service Steps
1. **Data Sourcing**: Use tools like Apollo.io or Hunter.io to build targeted lists.
2. **Setup**: Domain "warm-up" to ensure 98%+ deliverability.
3. **Copywriting**: Writing viral hooks that get a 5-10% reply rate.
4. **Monetization**: Charge a flat monthly retainer (INR 1L+) OR a fee per "booked meeting".',
    reality_check = 'Google and Outlook are cracking down on bulk emails. One mistake in setup can get your client''s main domain blacklisted.',
    skills_required = ARRAY['Copywriting', 'DNS/Technical Setup', 'Sales Funnels'],
    initial_investment_max = 10000,
    monthly_income_max = 300000,
    time_to_first_income_days = 20,
    success_rate_percentage = 55
WHERE slug = 'cold-email-agency';

UPDATE income_ideas SET 
    full_description = 'Design high-converting "Investor Pitch Decks" for Indian startups looking to raise Seed or Series A funding.

### Deliverables
- **The Story**: Converting a founder''s vision into a 12-slide narrative.
- **Visuals**: High-end data visualizations and brand-aligned slides.
- **Pricing**: Standard rates are INR 50k - 2L per deck depending on the complexity.',
    reality_check = 'Highly seasonal. Activity drops in "Funding Winters". You must understand venture capital terminology to be effective.',
    skills_required = ARRAY['Storytelling', 'Graphic Design (Figma)', 'Financial Literacy'],
    initial_investment_max = 0,
    monthly_income_max = 150000,
    time_to_first_income_days = 30,
    success_rate_percentage = 65
WHERE slug = 'pitch-deck-design';

-- 3. Inventory & Physical Arbitrage
UPDATE income_ideas SET 
    full_description = 'Build your own beauty brand by partnering with third-party manufacturers (TPM) who handle the formulation and lab testing.

### Indian Market Path
1. **Niche**: Focus on clean beauty, Ayurvedic skincare, or men''s grooming.
2. **TPM Partnership**: Find Ayush-certified labs on Indiamart.
3. **Branding**: Focus 100% on the packaging and influencer marketing.
4. **Sales**: Launch on Nykaa, Amazon, and your own Shopify store.',
    reality_check = 'Requires upfront capital for MOQs (Minimum Order Quantities). Heavy legal compliance for Ayush/FSSAI labels is mandatory.',
    skills_required = ARRAY['Supply Chain', 'Performance Marketing', 'Package Design'],
    initial_investment_max = 500000,
    monthly_income_max = 200000,
    time_to_first_income_days = 90,
    success_rate_percentage = 40
WHERE slug = 'white-label-skincare';

UPDATE income_ideas SET 
    full_description = 'Organize and manage a small fleet of 3-5 vehicles for dedicated corporate rentals or high-end wedding fleets.

### Operational Guide
1. **Vehicle Type**: Stick to Ertiga/Innova (Corporate) or Audi/Merc (Luxury).
2. **Driver Mgmt**: Use a strict 24/7 rotation with performance-based bonuses.
3. **Retainers**: Secure contracts with IT companies or luxury hotels for fixed monthly payouts.',
    reality_check = 'Management is heavy initially. Accidents, driver turnover, and fluctuating fuel prices are major stressors until you scale enough to hire a fleet manager.',
    skills_required = ARRAY['Operations', 'Negotiation', 'Crisis Mgmt'],
    initial_investment_max = 4000000,
    monthly_income_max = 100000,
    time_to_first_income_days = 15,
    success_rate_percentage = 85
WHERE slug = 'car-rental-fleet';

UPDATE income_ideas SET 
    full_description = 'Lease a larger commercial shell, partition it into small "micro-offices" or "kiosk spots," and sub-lease to small businesses or D2C brands.

### Implementation
1. **Identify Shell**: Find under-utilized floors in commercial buildings.
2. **The "Boutique" Model**: Divide a 1000 sq ft hall into four aesthetic 250 sq ft studios.
3. **Premium Service**: Include shared reception, Wi-Fi, and coffee to charge 2x the base rent per sq ft.',
    reality_check = 'Requires the "Right to Sublease" specifically mentioned in your owner contract. High vacancy risk if the location is not prime.',
    skills_required = ARRAY['Interior Planning', 'Lease Negotiation', 'Space Marketing'],
    initial_investment_max = 1000000,
    monthly_income_max = 80000,
    time_to_first_income_days = 60,
    success_rate_percentage = 70
WHERE slug = 'commercial-lease-arbitrage';

-- 4. Final Cleanup for ALL remaining ideas
-- This adds a high-quality "Prototype & Case Study" guide for anything not covered in batches.
UPDATE income_ideas SET 
    full_description = COALESCE(full_description, 'A high-potential niche opportunity for 2025. This business focuses on automating a specific service or leveraging a digital asset for recurring cash flow.

### Recommended MVP (Minimum Viable Product)
1. **Research**: Analyze at least 3 successful competitors in the global market.
2. **Beta Test**: Offer a small-scale version of this service to 10 potential customers for free in exchange for a video testimonial.
3. **Setup**: Build a lean landing page (using Carrd or Framer) and start targeted cold outreach.
4. **Scale**: Once you have 3 paying clients, document the workflow and hire your first part-time virtual assistant.'),
    reality_check = COALESCE(reality_check, 'The biggest risk is "Lack of Market Need". Always validate with a mockup or ad test before investing more than 10k into setup.'),
    skills_required = COALESCE(skills_required, ARRAY['Market Validation', 'Lean Ops', 'Customer Discovery']),
    initial_investment_max = COALESCE(initial_investment_max, initial_investment_min * 2 + 10000),
    monthly_income_max = COALESCE(monthly_income_max, monthly_income_min * 2 + 15000),
    time_to_first_income_days = COALESCE(time_to_first_income_days, 45),
    success_rate_percentage = COALESCE(success_rate_percentage, 50)
WHERE full_description IS NULL OR LENGTH(full_description) < 100 OR reality_check IS NULL;
