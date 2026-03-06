import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Discord not configured' }, { status: 500 });
  }

  const state = Math.random().toString(36).substring(7);
  
  // Store state in cookie for verification
  const cookieStore = cookies();
  cookieStore.set('discord_oauth_state', state, { 
    httpOnly: true, 
    maxAge: 600,
    path: '/' 
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds guilds.join',
    state: state,
  });

  const discordAuthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
  
  return NextResponse.redirect(discordAuthUrl);
}
