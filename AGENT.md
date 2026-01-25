# 🤖 AGENT.md - Master Project Guide for Silent Money

> **Purpose**: This document serves as the definitive guide for AI agents and developers working on Silent Money. It ensures consistency, maintains project vision, and provides context for all future development work.

---

## 📋 Table of Contents
1. [Project Vision & Mission](#project-vision--mission)
2. [Core Product Principles](#core-product-principles)
3. [Technical Architecture](#technical-architecture)
4. [Design System & Branding](#design-system--branding)
5. [Database Schema Overview](#database-schema-overview)
6. [Key Features & User Flows](#key-features--user-flows)
7. [Development Guidelines](#development-guidelines)
8. [Future Roadmap](#future-roadmap)
9. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)

---

## 🎯 Project Vision & Mission

### What is Silent Money?
**Silent Money** is a curated platform for discovering **realistic, India-specific passive income opportunities**. Unlike "get-rich-quick" schemes, we focus on data-backed assessments, real ROI calculations, and honest risk disclosures.

### Core Mission
To cut through the noise of fake financial gurus and provide a vetted roadmap for financial freedom in the Indian context.

### Target Audience
- **Primary**: Indian millennials and Gen-Z (25-40 years) seeking secondary income streams
- **Secondary**: Aspiring entrepreneurs looking for low-risk business ideas
- **Tertiary**: Working professionals wanting to diversify income

### Value Proposition
- **Realistic Expectations**: No "make ₹1 lakh in 30 days" promises
- **India-Specific**: All ideas tailored for Indian market, regulations, and currency
- **Data-Backed**: Every idea includes real numbers, case studies, and risk analysis
- **Community-Driven**: User ratings, reviews, and success stories
- **Actionable**: Step-by-step guides and ROI calculators

---

## 🧭 Core Product Principles

### 1. **Honesty Over Hype**
- Always disclose risks, failure rates, and realistic timelines
- No exaggerated income claims
- Include "What Can Go Wrong" sections for each idea

### 2. **Quality Over Quantity**
- Curated, vetted ideas only
- Each idea must have verified data and real-world examples
- Remove or update outdated ideas regularly

### 3. **User Empowerment**
- Provide tools (ROI calculators, comparison charts)
- Enable users to track their journey
- Allow private notes and progress tracking

### 4. **Premium Feel, Free Access**
- Beautiful, modern design
- Smooth animations and interactions
- No intrusive ads or pop-ups (initially)
- Most features free, premium tier for advanced features only

### 5. **Community Trust**
- Transparent about how ideas are vetted
- User-generated content with moderation
- Upvoting system for community validation

---

## 🏗️ Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Custom design system)
- **State Management**: React Context API (AuthContext, ThemeContext)
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **HTTP Client**: Supabase JS Client

#### Backend (Supabase)
- **Authentication**: Supabase Auth (Email/Password, OAuth ready)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage (for avatars, images)
- **Real-time**: Supabase Real-time subscriptions (future)

#### Deployment
- **Frontend**: Vercel (configured via vercel.json)
- **Backend**: Supabase Cloud
- **Repository**: GitHub (karkis23/Silent-money)

### Project Structure
```
silent-money/
├── public/                  # Static assets
│   └── logo.svg            # Silent Money logo (SM mark)
├── src/
│   ├── assets/             # Images, icons
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ROICalculator.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components (19 pages)
│   │   ├── LandingPage.jsx
│   │   ├── IdeasPage.jsx
│   │   ├── IdeaDetailPage.jsx
│   │   ├── FranchisePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── ...
│   ├── routes/             # Route configuration
│   │   └── AppRouter.jsx
│   ├── services/           # API and service layers
│   │   └── supabase.js
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── supabase/               # Database migrations & seeds
│   ├── schema.sql          # Core schema
│   ├── seed.sql            # Initial data
│   ├── MASTER_DATABASE_SYNC_2025.sql  # Latest comprehensive schema
│   └── ... (expansion scripts)
├── .env                    # Environment variables (NEVER commit)
├── .env.example            # Template for .env
├── vercel.json             # Vercel deployment config
├── tailwind.config.js      # Tailwind customization
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

---

## 🎨 Design System & Branding

### Brand Identity
- **Name**: Silent Money
- **Tagline**: "Build Your Financial Dynasty Quietly"
- **Logo**: "SM" monogram in electric blue gradient
- **Aesthetic**: Premium, modern, trustworthy, calm

### Color Palette
Defined in `tailwind.config.js`:

#### Primary (Electric Blue)
- `primary-500`: `#3d4aff` - Main brand color
- `primary-600`: `#2529ff` - Hover states
- Used for: CTAs, links, active states

#### Accent (Neon Green)
- `accent-light`: `#7ee787` - Success states
- Used for: Achievement badges, positive indicators

#### Charcoal (Neutrals)
- `charcoal-950`: `#181818` - Text
- `charcoal-600`: `#5d5d5d` - Secondary text
- `charcoal-100`: `#e7e7e7` - Borders
- Used for: Typography, backgrounds, borders

#### Cream (Backgrounds)
- `cream-50`: `#fafaf9` - Page background
- Used for: Main backgrounds

### Typography
- **Font Family**: 'Outfit', 'Inter', system-ui, sans-serif
- **Headings**: Bold (700-900), tight tracking
- **Body**: Medium (500), relaxed leading
- **Labels**: Uppercase, wide tracking, small size

### Component Patterns

#### Buttons
```jsx
// Primary CTA
className="btn-primary"
// Defined in index.css: Blue gradient, white text, hover lift

// Secondary
className="btn-secondary"
// Outlined style, charcoal text
```

#### Cards
```jsx
// Glass card effect
className="glass-card"
// Translucent, backdrop blur, subtle shadow
```

#### Input Fields
- Rounded corners (rounded-xl)
- Border color: charcoal-200
- Focus state: primary-500 ring

### Animation Principles
- **Subtle**: Micro-interactions, not distracting
- **Smooth**: 200-300ms transitions
- **Purposeful**: Animations should guide user attention
- **Performance**: Use transform and opacity, avoid layout shifts

---

## 📊 Database Schema Overview

### Core Tables

#### `profiles`
```sql
- id (UUID, FK to auth.users)
- full_name TEXT
- bio TEXT
- avatar_url TEXT
- is_premium BOOLEAN
- created_at TIMESTAMP
```
**Purpose**: User metadata and profile information

#### `categories`
```sql
- id UUID PRIMARY KEY
- name TEXT UNIQUE
- slug TEXT UNIQUE
- icon TEXT (emoji)
- description TEXT
- created_at TIMESTAMP
```
**Purpose**: Organize income ideas (e.g., Digital Products, Investments, Content Creation)

#### `income_ideas`
```sql
- id UUID PRIMARY KEY
- slug TEXT UNIQUE
- title TEXT
- short_description TEXT
- full_description TEXT
- category_id UUID (FK to categories)
- author_id UUID (FK to profiles)
- monthly_income_min INTEGER
- monthly_income_max INTEGER
- initial_investment_min INTEGER
- initial_investment_max INTEGER
- effort_level TEXT (Low/Medium/High)
- risk_level TEXT (Low/Medium/High)
- success_rate INTEGER (0-100)
- requirements TEXT
- steps TEXT
- risks TEXT
- case_studies TEXT
- upvotes_count INTEGER (auto-calculated via trigger)
- created_at, updated_at TIMESTAMP
```
**Purpose**: Core content - passive income opportunities

#### `franchises`
```sql
- id UUID PRIMARY KEY
- name TEXT
- description TEXT
- brand_name TEXT
- investment_min INTEGER
- investment_max INTEGER
- monthly_revenue_potential INTEGER
- roi_months INTEGER
- category TEXT
- rating DECIMAL
- locations_available TEXT
- author_id UUID
- upvotes_count INTEGER
- created_at, updated_at TIMESTAMP
```
**Purpose**: Franchise business opportunities

#### `user_saved_ideas`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK to profiles)
- idea_id UUID (FK to income_ideas)
- status TEXT (interested/started/earning/abandoned)
- notes TEXT (private user notes)
- created_at, updated_at TIMESTAMP
```
**Purpose**: Track user's saved ideas and progress

#### `income_ideas_votes`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK to profiles)
- idea_id UUID (FK to income_ideas)
- created_at TIMESTAMP
- UNIQUE(user_id, idea_id)
```
**Purpose**: Track upvotes, prevent duplicate votes

#### `saved_franchises`
```sql
- Similar structure to user_saved_ideas but for franchises
```

### Security: Row Level Security (RLS)

**Public Tables** (SELECT only):
- `categories` - Anyone can view
- `income_ideas` WHERE published = true - Anyone can view

**Authenticated Tables**:
- `profiles` - Users can view all, edit only their own
- `user_saved_ideas` - Users can only access their own records
- `income_ideas_votes` - Users can insert/delete only their own votes

**Author Privileges**:
- `income_ideas` - Only author (author_id = auth.uid()) can UPDATE/DELETE

---

## 🔄 Key Features & User Flows

### 1. User Authentication
**Flow**: Landing → Signup → Email Verification (optional) → Dashboard

**Features**:
- Email/password signup
- Login with remember me
- Forgot password
- Profile editing (name, bio, avatar)

**Files**:
- `src/pages/SignupPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/ForgotPasswordPage.jsx`
- `src/context/AuthContext.jsx`

### 2. Browse Income Ideas
**Flow**: Landing → Ideas Page → Filters → Idea Detail → Save/Upvote

**Features**:
- Category filtering
- Investment range filtering
- Search by keyword
- Sort by: Popular, Recent, Income Potential
- Pagination

**Files**:
- `src/pages/IdeasPage.jsx`
- `src/pages/IdeaDetailPage.jsx`
- `src/components/ROICalculator.jsx`

### 3. Save & Track Ideas
**Flow**: Idea Detail → Save → Dashboard → Update Status → Add Notes

**Features**:
- Save ideas to personal collection
- Set status (Interested/Started/Earning/Abandoned)
- Add private notes
- Track progress over time

**Files**:
- `src/pages/DashboardPage.jsx`
- Database: `user_saved_ideas` table

### 4. Post Your Own Idea
**Flow**: Dashboard → Add Idea → Fill Form → Submit → Moderation (future)

**Features**:
- Rich text editor for description
- Category selection
- Investment/income range inputs
- Risk and effort level assessment
- Requirements and steps sections

**Files**:
- `src/pages/AddIdeaPage.jsx`
- `src/pages/EditIdeaPage.jsx`
- `src/pages/MyIdeasPage.jsx`

### 5. Franchise Opportunities
**Flow**: Similar to Ideas, but for franchise businesses

**Features**:
- Franchise listings with brand info
- ROI calculations specific to franchises
- Investment range filters
- Contact information for franchise inquiries

**Files**:
- `src/pages/FranchisePage.jsx`
- `src/pages/FranchiseDetailPage.jsx`
- `src/pages/PostFranchisePage.jsx`

### 6. ROI Calculator
**Embedded in**: Idea Detail Page, Franchise Detail Page

**Logic**:
- Input: Initial investment, monthly income, timeline
- Output: Break-even point, total return, ROI percentage
- Considers: Compounding (if applicable), monthly expenses

**File**: `src/components/ROICalculator.jsx`

---

## 💻 Development Guidelines

### Code Style

#### React Components
```jsx
// Use functional components with hooks
export default function ComponentName() {
    const { user } = useAuth();
    const [state, setState] = useState(initialValue);

    // Early returns for loading/error states
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage />;

    return (
        <div className="container">
            {/* Component JSX */}
        </div>
    );
}
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `IdeaDetailPage.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth`)
- **Utilities**: camelCase (e.g., `formatCurrency`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes**: kebab-case or Tailwind utilities

#### File Organization
- One component per file
- Group related components in folders
- Use index.js for barrel exports (if needed)

### State Management
- **Local State**: useState for component-specific state
- **Context**: For auth, theme, global UI state
- **Server State**: Fetch directly from Supabase, no caching layer (yet)

### Error Handling
```jsx
try {
    const { data, error } = await supabase
        .from('table')
        .select();
    
    if (error) throw error;
    
    // Handle success
} catch (err) {
    console.error('Error:', err);
    // Show user-friendly error message
    setError('Something went wrong. Please try again.');
}
```

### Supabase Query Patterns
```javascript
// Always check for errors
const { data, error } = await supabase
    .from('income_ideas')
    .select('*, categories(*), profiles(*)')
    .eq('published', true)
    .order('created_at', { ascending: false });

if (error) {
    console.error('Error fetching ideas:', error);
    return { ideas: [], error };
}
```

### Performance Best Practices
- Use `React.memo` for expensive components
- Debounce search inputs (use custom hook)
- Lazy load images
- Code-split routes (React.lazy + Suspense)
- Limit database queries to necessary fields only

### Accessibility (a11y)
- Use semantic HTML (nav, main, article, aside)
- Include alt text for images
- Ensure keyboard navigation works
- Use ARIA labels where necessary
- Maintain color contrast ratios (AA minimum)

---

## 🚀 Future Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Core authentication
- [x] Database schema and RLS
- [x] Income ideas CRUD
- [x] Basic filtering and search
- [x] Landing page and branding
- [x] Dashboard with saved ideas
- [x] Upvoting system
- [x] Franchise opportunities

### Phase 2: Community Features (Next)
- [ ] User profiles (public view)
- [ ] Comments on ideas
- [ ] Success stories submission
- [ ] Idea reviews and ratings
- [ ] Follow/unfollow users
- [ ] Notifications system

### Phase 3: Advanced Tools
- [ ] Advanced ROI calculator with scenario planning
- [ ] Comparison tool (compare 2-3 ideas side by side)
- [ ] Income tracker (track actual earnings)
- [ ] Expense manager for investments
- [ ] Tax calculator (India-specific)

### Phase 4: Monetization
- [ ] Premium membership tier
- [ ] Exclusive ideas for premium users
- [ ] One-on-one consultation booking
- [ ] Affiliate partnerships (earn commission on tools)
- [ ] Sponsored ideas (clearly marked)

### Phase 5: Scale & Optimize
- [ ] Mobile app (React Native)
- [ ] Regional language support (Hindi, Tamil, Telugu)
- [ ] WhatsApp integration for updates
- [ ] Email newsletter
- [ ] YouTube integration (embed videos)
- [ ] Podcast/audio guides

---

## ⚠️ Common Pitfalls to Avoid

### 1. **Breaking Authentication**
- Never modify `AuthContext.jsx` without thorough testing
- Always check if `user` exists before accessing `user.id`
- Don't remove the `ProtectedRoute` wrapper from auth-required pages

### 2. **Database Migrations**
- Never delete tables directly in production
- Always test migrations in a separate Supabase project first
- Keep migration files in `/supabase` directory
- Use transactions for complex migrations

### 3. **RLS Policy Conflicts**
- Be careful when modifying RLS policies
- Test with different user accounts
- Document policy changes in comments
- Always enable RLS on new tables

### 4. **Breaking Changes**
- Don't rename database columns without updating all queries
- Don't change API response structures without frontend updates
- Maintain backward compatibility when possible

### 5. **Performance Issues**
- Avoid N+1 queries (use Supabase joins)
- Don't fetch unnecessary data (select only needed columns)
- Paginate large lists
- Use database indexes for frequently queried columns

### 6. **Design Inconsistencies**
- Always use Tailwind classes from the design system
- Don't add custom colors directly in components
- Maintain spacing consistency (use Tailwind spacing scale)
- Test responsive design on mobile, tablet, desktop

### 7. **Security Vulnerabilities**
- Never expose environment variables to client
- Always validate user input
- Don't trust data from client-side
- Use parameterized queries (Supabase handles this)
- Implement rate limiting for sensitive actions

### 8. **UX Dark Patterns**
- No fake urgency ("Only 2 spots left!")
- No hidden costs or fees
- No difficult unsubscribe process
- Clear, honest communication always

---

## 🧪 Testing Checklist

Before pushing code, verify:

### Functionality
- [ ] All auth flows work (signup, login, logout, forgot password)
- [ ] Ideas page loads and filters work
- [ ] Idea detail page shows correct data
- [ ] Save/unsave functionality works
- [ ] Upvote works (and prevents duplicates)
- [ ] Dashboard shows user's saved ideas
- [ ] Profile editing saves correctly
- [ ] Add/edit idea form validates inputs

### UI/UX
- [ ] Page loads without errors (check browser console)
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Buttons have hover states
- [ ] Loading states are shown
- [ ] Error messages are user-friendly
- [ ] Forms have proper validation messages

### Performance
- [ ] Page load time < 3 seconds
- [ ] No unnecessary re-renders
- [ ] Images are optimized
- [ ] No memory leaks (check with React DevTools)

### Security
- [ ] Protected routes require authentication
- [ ] Users can't edit others' content
- [ ] Environment variables are not exposed
- [ ] SQL injection is prevented (Supabase handles this)

---

## 📝 Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features (e.g., `feature/add-comments`)
- `fix/*`: Bug fixes (e.g., `fix/login-redirect`)

### Commit Message Format
```
type(scope): subject

body (optional)

Examples:
feat(auth): add Google OAuth login
fix(dashboard): correct saved ideas count
docs(readme): update setup instructions
style(navbar): improve mobile responsiveness
refactor(api): optimize idea fetching query
```

### Before Pushing
1. Test locally (`npm run dev`)
2. Check for console errors
3. Format code (Prettier, if configured)
4. Write descriptive commit message
5. Push to feature branch first
6. Merge to main after review

---

## 📞 Key Contacts & Resources

### Project Repository
- **GitHub**: https://github.com/karkis23/Silent-money
- **Live URL**: https://silent-money.vercel.app/

### Supabase Project
- **Project Name**: silent-money
- **Project ID**: kxkpfcepowplnciinsps
- **Region**: Asia (Singapore)

### Documentation
- Main README: `/README.md`
- Setup Guide: `/SETUP.md`
- Technical Details: `/PROJECT_DETAILS.md`
- Testing Plan: `/TESTING_PLAN.md`
- Database Guide: `/DATABASE_SETUP_GUIDE.md`

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

## 🎯 Development Quick Start

### For New Contributors/Agents

1. **Read This File First** - Understand the vision and architecture
2. **Setup Environment**:
   ```bash
   npm install
   # Copy .env.example to .env and add Supabase credentials
   npm run dev
   ```
3. **Understand the Schema** - Review `/supabase/MASTER_DATABASE_SYNC_2025.sql`
4. **Explore Pages** - Start with `LandingPage.jsx`, then `IdeasPage.jsx`
5. **Check AuthContext** - Understand how auth state is managed
6. **Review Tailwind Config** - See available design tokens

### When Adding a New Feature

1. **Check Roadmap** - Is this aligned with project goals?
2. **Design First** - Sketch UI, consider UX
3. **Database Changes** - Create migration script in `/supabase`
4. **API Layer** - Add query functions to `services/supabase.js`
5. **UI Components** - Build reusable components in `/components`
6. **Pages** - Assemble components into pages
7. **Routing** - Add route to `AppRouter.jsx`
8. **Test** - Verify all user flows
9. **Document** - Update this file if needed

### When Fixing a Bug

1. **Reproduce** - Understand the issue thoroughly
2. **Root Cause** - Identify the source (frontend, backend, logic)
3. **Fix** - Make minimal, targeted changes
4. **Test** - Verify fix doesn't break other features
5. **Commit** - Clear commit message explaining the fix

---

## 🧠 AI Agent Instructions

### When Asked to Build a Feature

1. **Clarify Requirements** - Ask questions if unclear
2. **Check Existing Code** - Don't reinvent the wheel
3. **Follow Design System** - Use existing colors, components, patterns
4. **Match Code Style** - Follow existing conventions
5. **Consider Edge Cases** - Handle errors, loading states, empty states
6. **Write Clean Code** - Readable, maintainable, commented where needed
7. **Test Before Claiming Done** - Actually verify it works

### When Reviewing Code

1. **Security First** - Check for vulnerabilities
2. **Performance** - Identify bottlenecks
3. **UX** - Is it intuitive and accessible?
4. **Consistency** - Does it match existing patterns?
5. **Maintainability** - Is it easy to understand and modify?

### When Things Break

1. **Stay Calm** - Bugs happen
2. **Read Error Messages** - They usually tell you what's wrong
3. **Check Recent Changes** - What was modified last?
4. **Use Git** - Compare with working version
5. **Ask for Help** - Share error messages and context

---

## 🏁 Final Notes

**Silent Money** is not just another income opportunity directory. It's a trustworthy companion for people seeking financial independence through realistic, vetted, and actionable strategies.

Every line of code, every design decision, and every feature should serve the mission of building user trust and empowering them with knowledge.

**Build with integrity. Code with empathy. Ship with confidence.**

---

*Last Updated: January 26, 2026*  
*Version: 1.0*  
*Maintained by: Silent Money Team*
