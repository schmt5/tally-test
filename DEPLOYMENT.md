# Deployment Guide (Browser/UI Method)

## Prerequisites
1. A Vercel account (free tier works) - [Sign up here](https://vercel.com/signup)
2. Your Tally API key
3. GitHub account (to connect your repository)

## Steps

### 1. Push Your Code to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import** your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click **"Deploy"**

### 3. Add PostgreSQL Database
1. In your Vercel project, go to **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Choose **"Hobby"** (free tier)
4. Click **"Create"**

Vercel automatically adds `DATABASE_URL` to your environment variables.

### 4. Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `TALLY_API_KEY`
   - **Value**: Your Tally API key from [tally.so/dashboard/settings/api](https://tally.so/dashboard/settings/api)
3. Click **"Save"**

### 5. Redeploy to Apply Environment Variables
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

### 6. Run Database Migrations
You need to run migrations on your production database. Two options:

**Option A: Via Vercel CLI (one-time use)**
```bash
# Install temporarily
npx vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Add to package.json build script**
Update `package.json`:
```json
"scripts": {
  "build": "prisma generate && prisma migrate deploy && next build"
}
```
Then redeploy from Vercel dashboard.

### 7. Get Your Production URL
After deployment, you'll have a URL like: `https://test-einfach.vercel.app`

### 8. Configure Tally Webhook
1. Go to your production app and create an exam
2. Note the **Exam ID** from the teacher dashboard
3. Go to your Tally form → **Integrations** → **Webhooks**
4. Add webhook URL:
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/webhooks/tally/EXAM_ID
   ```
   Replace `YOUR-VERCEL-URL` and `EXAM_ID` with actual values

### 9. Test the Flow
1. Create an exam in your production app
2. Configure the webhook (step 8)
3. Take the exam as a student
4. Check submissions in teacher view

## Troubleshooting
- **Database errors**: Make sure migrations ran (check Vercel logs)
- **Webhook not working**: 
  - Check Vercel **Functions** logs
  - Verify webhook URL is correct
  - Test webhook in Tally's webhook settings
- **Environment variables not working**: Redeploy after adding them

## Important Notes
- The database provider has been changed from SQLite to PostgreSQL
- Your local `.env` still uses SQLite - don't mix them up
- Each deployment creates a new URL (use the production domain)
