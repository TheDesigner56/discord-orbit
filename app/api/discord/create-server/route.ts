import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createDiscordServer } from '@/lib/discord/client';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { serverId } = await request.json();

  try {
    // Get Discord connection
    const { data: discordConnection } = await supabase
      .from('discord_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!discordConnection) {
      return NextResponse.json(
        { error: 'Discord not connected', needsAuth: true },
        { status: 400 }
      );
    }

    // Get server config from database
    const { data: serverConfig } = await supabase
      .from('servers')
      .select('*, channels(*), roles(*)')
      .eq('id', serverId)
      .eq('user_id', user.id)
      .single();

    if (!serverConfig) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Create Discord server
    const result = await createDiscordServer(
      discordConnection.access_token,
      process.env.DISCORD_BOT_TOKEN!,
      serverConfig.name,
      serverConfig.channels || [],
      serverConfig.roles || []
    );

    // Update server record with Discord info
    await supabase
      .from('servers')
      .update({
        discord_server_id: result.guildId,
        discord_invite_url: result.inviteUrl,
        status: 'active',
      })
      .eq('id', serverId);

    return NextResponse.json({
      success: true,
      guildId: result.guildId,
      inviteUrl: result.inviteUrl,
    });
  } catch (error: any) {
    console.error('Error creating Discord server:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Discord server' },
      { status: 500 }
    );
  }
}
