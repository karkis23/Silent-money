# Deployment Guide - Silent Money

This guide covers how to deploy the Silent Money platform to production using Vercel.

## 📋 Prerequisites
1. A Vercel account.
2. A Supabase project (already setup).
3. GitHub repository for the project.

## 🚀 Deployment Steps

### 1. Push to GitHub
Ensure all your changes are committed and pushed to your GitHub repository.

### 2. Connect to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"New Project"**.
3. Import your GitHub repository.

### 3. Configure Environment Variables
In the Vercel project settings, add the following environment variables (from your `.env` file):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Build Settings
Vercel should automatically detect Vite. Ensure the settings are:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy
Click **"Deploy"**. Vercel will build the project and provide a production URL (e.g., `https://silent-money.vercel.app`).

## 🔄 Post-Deployment
1. **Database Sync**: Ensure you have run the `supabase/MASTER_DATABASE_SYNC_2025.sql` in your production Supabase database.
2. **Custom Domain**: You can add a custom domain (like `silentmoney.in`) in Vercel settings under **"Domains"**.
3. **SEO Check**: Verify that your meta tags are appearing correctly using [Meta Tags Checker](https://metatags.io).

## 📊 Performance
- The project is configured with image lazy loading and code splitting for faster load times.
- If you notice large bundle sizes, check `vite.config.js` for optimization options.

## 🛠️ Maintenance
- Daily backups are handled by Supabase (if on Pro tier).
- Use `npm run lint` before every push to ensure code quality.
