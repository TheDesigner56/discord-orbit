# Discord Integration Setup

To enable real Discord server creation, follow these steps:

## 1. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it "DiscordOrbit" (or your preferred name)
4. Click **Create**

## 2. Get Credentials

In your Discord app:

### Application ID
- Go to **General Information**
- Copy **Application ID**

### Bot Token
1. Click **Bot** in the left sidebar
2. Click **Reset Token** (or copy existing one)
3. **SAVE THIS TOKEN** - you can't see it again!

### OAuth2 Settings
1. Click **OAuth2** in the left sidebar
2. Under **Redirects**, add:
   - `https://discord-orbit.vercel.app/api/discord/callback`
   - `http://localhost:3000/api/discord/callback` (for local testing)
3. Click **Save Changes**

## 3. Bot Permissions

1. Go to **Bot** section
2. Under **Privileged Gateway Intents**, enable:
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**
3. Save

## 4. Generate Bot Invite URL

1. Go to **OAuth2 → URL Generator**
2. Select scopes:
   - ✅ **bot**
   - ✅ **applications.commands**
3. Select bot permissions:
   - ✅ **Administrator** (or manually select: Manage Server, Manage Channels, Manage Roles, Send Messages, etc.)
4. Copy the generated URL at the bottom
5. Open that URL in browser to add bot to YOUR test server first

## 5. Environment Variables

Add these to your Vercel environment variables:

```
DISCORD_CLIENT_ID=your-application-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_REDIRECT_URI=https://discord-orbit.vercel.app/api/discord/callback
```

## 6. Database Update

Run this SQL in Supabase to store Discord tokens:

```sql
-- Add Discord connection table
CREATE TABLE IF NOT EXISTS public.discord_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  discord_user_id TEXT,
  discord_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add Discord server ID to servers table
ALTER TABLE public.servers 
ADD COLUMN IF NOT EXISTS discord_server_id TEXT,
ADD COLUMN IF NOT EXISTS discord_invite_url TEXT;

-- Enable RLS
ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own Discord connection"
  ON public.discord_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own Discord connection"
  ON public.discord_connections FOR ALL
  USING (auth.uid() = user_id);
```

## Features After Setup

Once configured, users can:
- ✅ Connect their Discord account
- ✅ Create real Discord servers
- ✅ Auto-create channels based on template
- ✅ Set channel categories
- ✅ Create roles with colors
- ✅ Send welcome messages
- ✅ Set server rules
- ✅ Generate invite links

## How It Works

1. User clicks "Connect Discord" on server page
2. OAuth flow authorizes the app
3. Bot creates the server on user's behalf
4. Channels, roles, and messages are set up automatically
5. User gets invite link to join their new server

## Testing Locally

1. Add `http://localhost:3000/api/discord/callback` to Discord OAuth redirects
2. Set `DISCORD_REDIRECT_URI=http://localhost:3000/api/discord/callback` in `.env.local`
3. Run `npm run dev`
4. Test the OAuth flow

## Troubleshooting

**"Invalid redirect_uri"**
- Make sure redirect URL in Discord app matches exactly (including https/http)

**"Bot doesn't have permission"**
- Check bot permissions in OAuth URL Generator
- Ensure bot is added to your test server

**"Failed to create server"**
- Bot can only create servers for users who authorized it
- Check that access token hasn't expired

**"Rate limited"**
- Discord has strict rate limits for server creation
- Add delays between API calls if creating multiple servers
