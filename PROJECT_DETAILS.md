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
- **Logic**: PL/pgSQL Triggers (for auto-calculating upvotes)

---

## 📊 Database Architecture

### `profiles`
Stores user-specific metadata.
- `id`: UUID (REFERENCES auth.users)
- `full_name`, `bio`, `avatar_url`
- `is_premium`: Boolean flag for future monetization

### `income_ideas`
The core content table.
- `id`, `slug` (Unique), `category_id`
- `title`, `short_description`, `full_description`
- `monthly_income_min/max`, `initial_investment_min/max`
- `author_id`: Tracks which user posted the idea
- `upvotes_count`: Aggregated count for performance

### `categories`
Organizes ideas (e.g., Investments, Content, Digital Products).
- `name`, `slug`, `icon` (Emoji-based)

### `user_saved_ideas`
Join table for user bookmarks and progress.
- `status`: Tracking (Interested, Started, etc.)
- `notes`: User-specific private notes

### `income_ideas_votes`
Tracks upvotes to prevent duplicates and enable sorting by popularity.

---

## 🔒 Security Model (RLS)
- **Public**: Can view Categories and Free Ideas.
- **Authenticated**: Can save ideas, upvote, and edit their own profile.
- **Author**: Only the `author_id` matching `auth.uid()` can EDIT or DELETE a specific idea.

## 🚀 Key Algorithms
1.  **ROI Calculator**: Logic implemented in `ROICalculator.jsx` to handle monthly compounding and break-even analysis.
2.  **Search & Filters**: Multi-factor filtering using Supabase query builder (ilike, gte, eq) combined with debounced state.
3.  **Upvote Trigger**: A PostgreSQL trigger ensures the `upvotes_count` on the idea table stays in sync without extra API calls.
