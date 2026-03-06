// lib/discord/client.ts
const DISCORD_API_BASE = 'https://discord.com/api/v10';

export async function createDiscordServer(
  accessToken: string,
  botToken: string,
  name: string,
  channels: any[],
  roles: any[]
) {
  try {
    // Step 1: Create the guild (server)
    const guildResponse = await fetch(`${DISCORD_API_BASE}/guilds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        region: 'us-west', // or auto
        icon: null,
      }),
    });

    if (!guildResponse.ok) {
      const error = await guildResponse.text();
      throw new Error(`Failed to create guild: ${error}`);
    }

    const guild = await guildResponse.json();
    const guildId = guild.id;

    // Step 2: Create categories
    const categories: Record<string, string> = {};
    const categoryNames = Array.from(new Set(channels.map(c => c.category || 'General')));
    
    for (const categoryName of categoryNames) {
      const categoryResponse = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          type: 4, // Category type
        }),
      });

      if (categoryResponse.ok) {
        const category = await categoryResponse.json();
        categories[categoryName] = category.id;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 3: Create channels
    for (const channel of channels) {
      const channelResponse = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channel.name,
          type: 0, // Text channel
          parent_id: categories[channel.category || 'General'] || null,
          topic: channel.description || null,
        }),
      });

      if (channelResponse.ok) {
        const createdChannel = await channelResponse.json();
        
        // Send welcome message if it's the general channel
        if (channel.name === 'general' || channel.name === 'announcements') {
          await sendWelcomeMessage(botToken, createdChannel.id, name);
        }
        
        // Send rules message if it's rules channel
        if (channel.name === 'rules') {
          await sendRulesMessage(botToken, createdChannel.id);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 4: Create roles
    for (const role of roles) {
      await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: role.name,
          color: role.color ? parseInt(role.color.replace('#', ''), 16) : 0,
          hoist: true,
          mentionable: true,
        }),
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 5: Create invite link
    const inviteResponse = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/invites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_age: 0, // Never expire
        max_uses: 0, // Unlimited uses
        unique: true,
      }),
    });

    let inviteUrl = null;
    if (inviteResponse.ok) {
      const invite = await inviteResponse.json();
      inviteUrl = `https://discord.gg/${invite.code}`;
    }

    return {
      guildId,
      inviteUrl,
      success: true,
    };
  } catch (error) {
    console.error('Discord API Error:', error);
    throw error;
  }
}

async function sendWelcomeMessage(botToken: string, channelId: string, serverName: string) {
  await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `🎉 **Welcome to ${serverName}!** 🎉\n\nThis server is managed by DiscordOrbit AI. I'm here to help with:\n• Answering questions\n• Moderating discussions\n• Organizing events\n• And much more!\n\nFeel free to explore the channels and introduce yourself!`,
    }),
  });
}

async function sendRulesMessage(botToken: string, channelId: string) {
  await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `📋 **Server Rules** 📋\n\n1. **Be respectful** - Treat everyone with respect.\n2. **No spam** - Keep discussions meaningful.\n3. **Stay on topic** - Use the right channels.\n4. **No harassment** - Zero tolerance for bullying.\n5. **Follow Discord ToS** - All Discord rules apply.\n\nBreaking these rules may result in warnings or bans.\n\n*This server is managed by AI. Be kind to our robot overlords! 🤖*`,
    }),
  });
}

export async function getDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user');
  }

  return response.json();
}
