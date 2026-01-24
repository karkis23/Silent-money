# 🛠️ Silent Money Database Setup Guide

If your app is showing "No Ideas Found" or you are getting SQL errors, follow this guide precisely.

## 1. The Environment Check
Ensure your `.env` file contains the correct keys from your Supabase Project Settings (API tab).

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2. SQL Deployment Order
Open the **SQL Editor** in Supabase and run these files in this specific order:

1.  **`supabase/COMPLETE_DATABASE_SETUP.sql`**  
    *Purpose:* This is the "Master Fix" file. It creates tables, fixes all policy errors, and adds initial content safely.

2.  **`supabase/additional_ideas.sql`** (Optional)  
    *Purpose:* Adds more advanced ideas like AI Channels and SaaS Affiliate.

## 3. Dealing with "Already Exists" Errors
If you see an error like `policy "..." already exists`, don't worry. This usually means you tried to run the same script twice. The `COMPLETE_DATABASE_SETUP.sql` file I provided uses `DROP POLICY IF EXISTS` to prevent this from happening.

## 4. Verification
After running the SQL:
1.  Refresh your browser.
2.  Navigate to `/ideas`.
3.  If ideas appear -> 🟢 Success!
4.  If not, check the "Table Editor" in Supabase to see if `income_ideas` has rows.
