# DiscordOrbit

AI-powered Discord server setup and management platform.

## Features

- **Template Selection**: Choose from SaaS, Gaming, Creator, Education, or Support templates
- **5-Step Wizard**: Configure your server with guided setup
- **AI Assistant**: Chat with "Orbit" to manage your server
- **Real-time Preview**: See your server structure as you build it
- **Supabase Integration**: Authentication, database, and real-time updates

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/discord-orbit.git
cd discord-orbit
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Run the database migration:
   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
   Or manually run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/discord-orbit.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and import your GitHub repository

3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

4. Deploy!

## Project Structure

```
discord-orbit/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── server/[id]/       # Server detail page
│   ├── setup/             # Server setup wizard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   └── supabase/          # Supabase clients
├── supabase/              # Database migrations
│   └── migrations/
├── components/            # React components
├── public/                # Static assets
└── types/                 # TypeScript types
```

## Database Schema

### Tables

- **profiles**: User profiles (extends auth.users)
- **servers**: Discord server configurations
- **channels**: Server channels
- **roles**: Server roles
- **server_templates**: Pre-defined templates
- **ai_settings**: AI behavior configuration
- **ai_conversations**: Chat history with AI

## Authentication

The app uses Supabase Auth with email/password and Google OAuth support. Users are automatically redirected to `/auth` if not authenticated.

## API Routes

- `GET /api/templates` - List all server templates
- `GET /api/servers` - List user's servers
- `POST /api/servers` - Create new server
- `POST /auth/signout` - Sign out user
- `GET /auth/callback` - OAuth callback handler

## License

MIT
