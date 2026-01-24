# 🚀 Silent Money - Quick Setup Guide

Follow these steps to get Silent Money running locally.

---

## Step 1: Install Dependencies

```bash
npm install
```

**What this installs:**
- React, React Router
- Tailwind CSS
- Supabase client
- Vite dev server

---

## Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name:** silent-money (or any name)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to India (e.g., Singapore)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 3: Get Supabase Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## Step 4: Configure Environment Variables

1. Open the `.env` file in the project root
2. Paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

---

## Step 5: Set Up Database

### Run Schema Migration

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase/schema.sql` from this project
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Run Seed Data (Optional but Recommended)

1. Click **"New query"** again
2. Open `supabase/seed.sql`
3. Copy ALL the contents
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. You should see "Success" messages

---

## Step 6: Verify Database Setup

1. In Supabase, click **Table Editor**
2. You should see these tables:
   - profiles
   - categories
   - income_ideas
   - user_saved_ideas
   - roi_calculations
   - stories
   - subscriptions

3. Click **categories** - you should see 8 categories
4. Click **income_ideas** - you should see 5 sample ideas

---

## Step 7: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## Step 8: Test the Application

1. Open http://localhost:5173 in your browser
2. You should see the **Silent Money landing page**
3. Click **"Explore Income Ideas"**
4. You should see 5 income ideas (from seed data)
5. Click **"Get Started"** to test signup
6. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
7. You should be redirected to the Dashboard

---

## ✅ Success Checklist

- [ ] Landing page loads
- [ ] Income ideas page shows 5 ideas
- [ ] Can sign up successfully
- [ ] Can log in
- [ ] Dashboard loads after login
- [ ] Can log out
- [ ] Can filter ideas by category

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution:** Check your `.env` file. Make sure:
- File is named exactly `.env` (not `.env.txt`)
- Variables start with `VITE_`
- No spaces around the `=` sign
- Restart dev server after changing `.env`

### Error: "relation 'categories' does not exist"

**Solution:** You haven't run the schema.sql file.
- Go to Supabase SQL Editor
- Run `supabase/schema.sql`

### Ideas page shows "No ideas found"

**Solution:** You haven't run the seed data.
- Go to Supabase SQL Editor
- Run `supabase/seed.sql`

### Can't sign up / "Invalid login credentials"

**Solution:** Check Supabase Auth settings:
- Go to **Authentication** → **Providers**
- Make sure **Email** is enabled
- Check **Email Auth** → **Confirm email** is disabled (for testing)

### Page is blank / white screen

**Solution:** Check browser console (F12) for errors.
- Most likely a missing import or typo
- Check that all files are saved
- Restart dev server

---

## 🎉 Next Steps

Once everything works:

1. **Explore the code:**
   - `src/pages/` - All page components
   - `src/components/` - Reusable components
   - `src/services/supabase.js` - Database queries

2. **Customize:**
   - Update colors in `tailwind.config.js`
   - Add more income ideas via Supabase Table Editor
   - Modify landing page copy

3. **Build Phase 2 features:**
   - Save ideas functionality
   - Idea detail page
   - Notes and tracking

---

## 📚 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Vite Docs](https://vitejs.dev)

---

**Need help?** Check the main README.md for more details.
