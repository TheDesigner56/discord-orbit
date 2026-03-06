import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDiscordUser } from '@/lib/discord/client';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_APP_URL));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  const cookieStore = cookies();
  const storedState = cookieStore.get('discord_oauth_state')?.value;

  // Verify state to prevent CSRF
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_state', process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Get Discord user info
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Store connection in database
    const { error } = await supabase.from('discord_connections').upsert({
      user_id: user.id,
      discord_user_id: discordUser.id,
      discord_username: discordUser.username,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

    if (error) {
      console.error('Error storing Discord connection:', error);
    }

    // Clear state cookie
    cookieStore.delete('discord_oauth_state');

    return NextResponse.redirect(
      new URL('/dashboard?discord=connected', process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=discord_auth_failed', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
