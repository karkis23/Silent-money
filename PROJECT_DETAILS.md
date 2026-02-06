# 🛠️ Project Technical Details: Silent Money

Silent Money is a full-stack web application designed to help Indian users discover and track realistic passive income opportunities.

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Custom "Calm & Trust" design system)
- **State Management**: Context API (AuthContext)
- **Routing**: React Router DOM (v6 Browser Router)
- **Client**: Supabase JS (Real-time & DB interactions)

### Backend (Supabase)
- **Authentication**: GoTrue (Email/Password)
- **Database**: PostgreSQL
- **Security**: Row Level Security (RLS) policies for data isolation
- **Logic**: PL/pgSQL Triggers (for auto-calculating upvotes and profile creation)
- **Functions**: SECURITY DEFINER functions for administrative bypass and automated content status management.

---

## 📊 Database Architecture

### `profiles`
Stores user-specific metadata.
- `id`: UUID (REFERENCES auth.users)
- `full_name`, `bio`, `avatar_url`
- `is_premium`: Boolean flag for monetization
- `is_admin`: Boolean flag granting access to Moderation Terminal

### `income_ideas`
The core content table.
- `id`, `slug` (Unique), `category_id`
- `title`, `short_description`, `full_description`
- `monthly_income_min/max`, `initial_investment_min/max`
- `author_id`: Tracks which user posted the idea
- `is_approved`: Boolean flag for public visibility
- `status`: Tracking (pending, approved, revision, rejected)
- `admin_feedback`: Feedback for authors on revision requests
- `is_verified`: Secondary high-authority verification tag for institutional assets
- `deleted_at`: Soft-delete timestamp for data protection
- `upvotes_count`: Aggregated count for performance
- `step_progress`: Internal marker for multi-step submission tracking (1-2)

### `categories`
Organizes ideas (e.g., Investments, Content, Digital Products).
- `name`, `slug`, `icon` (Emoji-based)

### `expert_audit_requests`
High-authority consultancy conduit for institutional validation.
- `brand_name`, `brand_sector`, `investment_budget`, `location_target`
- `status`: Tracking (pending, in-review, completed, cancelled)
- `admin_feedback`: Strategic feedback from the expert panel
- `report_url`: External link to comprehensive ROI intelligence reports
- `updated_at`: Timestamp for status synchronization

### `user_saved_ideas` & `user_saved_franchises`
Join tables for user bookmarks and progress tracking.
- `status`: Tracking (Interested, Started, etc.)
- `notes`: User-specific private notes

### `franchises`
Business opportunity catalog with verified ROI.
- Includes contact details, investment breakdown, operational metrics, and verified status tags.

### `notifications`
Real-time user communication bridge.
- `type`: approval, revision, audit_update, system
- `is_read`: Boolean read status
- `link`: Direct path to action (e.g., /dashboard, /ideas/slug)

### `income_idea_reviews` & `franchise_reviews`
User-shared feedback and social proof.

---

## 🔒 Security Model (RLS)
- **Public**: Can view Categories and Free Ideas.
- **Authenticated**: Can save ideas, upvote, post new ideas, and edit their own assets.
- **Admin**: Bypasses author-checks to moderate ALL assets and access the Institutional Command Hub.
- **Data Isolation**: Multi-tenant RLS policies ensure users only modify their own profile and saved data.

---

## 🚀 Key Algorithms & Strategic Engines

### 1. Institutional Command Hub (Admin Home)
A professional "Operational Console" for platform administrators that replaces the public landing page upon authentication.
- **System Health HUD**: Real-time diagnostics for API latency and database mesh.
- **Operational Metrics**: Live counters for Market Blueprints, Pending Audits, and User Registry.
- **Direct Action Links**: Rapid-deployment portals for sector management.

### 2. Universal Asset Comparator (Financial Battle Engine)
High-fidelity side-by-side analysis tool for wealth-generation assets.
- **Performance Gauges**: Real-time risk and effort level visualization.
- **Yield Spectrum**: Synchronized projection of monthly cash flow vs. annualized trajectory.
- **ROI Velocity**: Comparative speed of capital recovery analysis.

### 3. Expert Audit Protocol
Professional feedback loop for institutional-grade business validation.
- **Rich Structural Feedback**: Admins provide detailed strategic insights and PDF report links.
- **Audite Intel HUD**: Investor-facing portal for tracking audit progress and retrieving expert intelligence.

### 4. Institutional User Registry
Centralized member management sector within the Moderation Terminal.
- **Member Identity Audit**: Professional grid displaying profile hashes, roles, and membership tiers.
- **Authorization Monitoring**: Real-time tracking of platform's human capital.

### 5. Advanced Search & ROI Engine
- **Multi-factor Filtering**: Supabase query builder (ilike, gte, eq) combined with debounced state.
- **Compounding Analysis**: ROI Calculator (`ROICalculator.jsx`) handles monthly compounding and break-even analysis.

### 6. Data Integrity & Sync
- **Soft-Delete Mechanism**: Database-level data protection using `deleted_at` timestamps.
- **Real-time Subscriptions**: Supabase channel-based updates for instant UI synchronization on new audits and assets.
- **Collision-Resistant Slugs**: Automated random suffix generation for asset URLs.
- **Intelligence Preview Protocol**: Secure, read-only visualization of pending assets in isolated operational tabs (`target="_blank"`) for administrative vetting.
- **Consolidated Deployment Flow**: Multi-step submission forms (Ideas/Franchises) refactored from 3-step to high-velocity 2-step sequences ("Foundation" & "Full Intelligence").

### 7. Intelligence-Led SEO Engine
Automated metadata generation suite and synchronization.
- **Markdown Sanitization**: A background pipeline that strips formatting from descriptions to create professional Meta Descriptions.
- **Structural Meta Tagging**: Injects high-fidelity `Helmet` signals for social graph and search indexing.
- **Discovery Synchronization**: Automatically updates the `signals` summary in Supabase whenever a blueprint or franchise is modified.

### 8. High-Density Navigation Model
Institutional design tokens for maximum information velocity.
- **Spatially-Aware Tabs**: Replaced ad-hoc separators with refined spatial intervals for a cleaner HUD aesthetic.
- **Compact Signal Bar**: Reduced discovery feed bulk by 40% to prioritize core financial metrics.
- **Vectorized Action Suites**: High-fidelity custom SVGs for "Vaulted" and "Tracked" states with micro-feedback loops.
