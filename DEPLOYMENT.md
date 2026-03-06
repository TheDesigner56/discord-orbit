# DiscordOrbit - Deployment Guide

Your Discord server management app is ready! Here's how to deploy it.

## Project Location
`/Users/gideonmdavid/Desktop/Claude Workspace/Projects/discord-orbit-app/`

## Quick Start

### 1. Install Dependencies
```bash
cd "/Users/gideonmdavid/Desktop/Claude Workspace/Projects/discord-orbit-app"
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project (free tier)
2. Once created, go to Settings > API
3. Copy your **Project URL** and **anon/public** key
4. Run the database migration:
   - Go to SQL Editor in Supabase
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

### 1. Push to GitHub

```bash
cd "/Users/gideonmdavid/Desktop/Claude Workspace/Projects/discord-orbit-app"
git init
git add .
git commit -m "Initial commit"
gh repo create discord-orbit --public --source=. --remote=origin --push
```

Or manually:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/discord-orbit.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (use your Vercel deployment URL, e.g., `https://discord-orbit.vercel.app`)
4. Click Deploy

## What You Get

### Features
- ✅ Authentication (email/password)
- ✅ 5 server templates (SaaS, Gaming, Creator, Education, Support)
- ✅ 5-step setup wizard
- ✅ AI chat interface (Orbit)
- ✅ Server preview with channels & roles
- ✅ Real-time dashboard
- ✅ Responsive design (mobile + desktop)

### Pages
- `/` - Marketing landing page
- `/auth` - Sign up / Sign in
- `/dashboard` - List of user's servers
- `/setup` - 5-step wizard to create server
- `/server/[id]` - Server detail with AI chat

### Database Tables
- `profiles` - User profiles
- `servers` - Server configurations
- `channels` - Discord channels
- `roles` - Server roles
- `ai_conversations` - Chat history
- `ai_settings` - AI behavior config
- `server_templates` - Pre-built templates

## Next Steps

### Connect to Real Discord API
To actually create Discord servers, you'll need to:
1. Create a Discord application at https://discord.com/developers/applications
2. Add OAuth2 redirect URL
3. Integrate Discord API in your server creation flow
4. Store Discord bot token securely

### Add Real AI
Currently using mock responses. To add real AI:
1. Sign up for OpenAI API
2. Create an API route `/api/chat` that calls GPT-4
3. Pass server context to the AI
4. Store responses in `ai_conversations` table

### Add Payments
To charge for the service:
1. Set up Stripe
2. Create subscription plans
3. Add payment flow
4. Gate features based on plan

## Project Structure

```
discord-orbit-app/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth pages & callbacks
│   ├── dashboard/        # Dashboard page
│   ├── server/[id]/      # Server detail page
│   ├── setup/            # Setup wizard
│   ├── globals.css       # Styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   └── supabase/         # Supabase clients
├── supabase/
│   └── migrations/       # Database schema
├── middleware.ts         # Auth middleware
├── package.json
├── next.config.js
└── README.md
```

## Support

- Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs

Happy building! 🚀
