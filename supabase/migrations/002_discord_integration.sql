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
