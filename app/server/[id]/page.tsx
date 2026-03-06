'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Settings, ArrowLeft, Send, Loader2, ExternalLink, MessageCircle } from 'lucide-react';

interface Server {
  id: string;
  name: string;
  description: string;
  status: string;
  discord_server_id?: string;
  discord_invite_url?: string;
}

interface Channel {
  id: string;
  name: string;
  category: string;
  is_ai_managed: boolean;
}

interface Role {
  id: string;
  name: string;
  color: string;
}

interface Conversation {
  id: string;
  user_message: string;
  ai_response: string;
  created_at: string;
}

interface DiscordConnection {
  discord_user_id: string;
  discord_username: string;
}

export default function ServerPage() {
  const params = useParams();
  const serverId = params.id as string;
  const supabase = createClient();
  
  const [server, setServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [discordConnection, setDiscordConnection] = useState<DiscordConnection | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creatingDiscord, setCreatingDiscord] = useState(false);

  useEffect(() => {
    fetchServerData();
    checkDiscordConnection();
  }, [serverId]);

  const fetchServerData = async () => {
    try {
      const { data: serverData } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single();
      
      if (serverData) setServer(serverData);

      const { data: channelsData } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('order_index');
      
      if (channelsData) setChannels(channelsData);

      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .eq('server_id', serverId);
      
      if (rolesData) setRoles(rolesData);

      const { data: conversationsData } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: true });
      
      if (conversationsData) setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching server:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDiscordConnection = async () => {
    try {
      const { data } = await supabase
        .from('discord_connections')
        .select('discord_user_id, discord_username')
        .single();
      
      if (data) setDiscordConnection(data);
    } catch (error) {
      // No connection found
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    const userMessage = message;
    setMessage('');

    try {
      const aiResponse = generateAIResponse(userMessage);
      
      const { data } = await supabase
        .from('ai_conversations')
        .insert([{
          server_id: serverId,
          user_message: userMessage,
          ai_response: aiResponse,
        }])
        .select()
        .single();

      if (data) {
        setConversations([...conversations, data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const createDiscordServer = async () => {
    setCreatingDiscord(true);
    try {
      const response = await fetch('/api/discord/create-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh server data to get Discord info
        fetchServerData();
        alert('Discord server created successfully! Check your Discord.');
      } else if (data.needsAuth) {
        window.location.href = '/api/discord/auth';
      } else {
        alert(data.error || 'Failed to create Discord server');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create Discord server');
    } finally {
      setCreatingDiscord(false);
    }
  };

  const generateAIResponse = (msg: string): string => {
    const lower = msg.toLowerCase();
    
    if (lower.includes('plan')) {
      return `Your server plan includes ${channels.length} channels across ${new Set(channels.map(c => c.category)).size} categories, ${roles.length} roles, and AI automation for moderation and support.`;
    }
    if (lower.includes('channel')) {
      return `You have ${channels.length} channels set up: ${channels.slice(0, 5).map(c => '#' + c.name).join(', ')}${channels.length > 5 ? ' and more' : ''}.`;
    }
    if (lower.includes('launch') || lower.includes('create') || lower.includes('discord')) {
      if (server?.discord_invite_url) {
        return `Your Discord server is already created! You can join it using the invite link on the right side.`;
      } else if (discordConnection) {
        return `I can create your Discord server now! Click the "Create Discord Server" button on the right side, and I'll set up all the channels and roles for you.`;
      } else {
        return `To create your Discord server, you need to connect your Discord account first. Click the "Connect Discord" button on the right side.`;
      }
    }
    return `I'm here to help you manage your Discord server. You can ask me about your server configuration, channel setup, or how I can help with moderation.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Server not found</h1>
          <Link href="/dashboard" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const channelGroups = channels.reduce((acc: Record<string, Channel[]>, channel: Channel) => {
    if (!acc[channel.category]) acc[channel.category] = [];
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-lg font-bold">
                {server.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-semibold">{server.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full ${server.status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {server.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-elevated text-white text-sm font-medium rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Chat */}
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse-slow opacity-50" />
                <MessageSquare className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h2 className="font-semibold">Orbit</h2>
                <p className="text-xs text-muted">Your AI Community Manager</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations.length === 0 && (
                <div className="text-center text-muted py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Ask Orbit anything about your server</p>
                </div>
              )}
              
              {conversations.map((conv) => (
                <div key={conv.id} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                      {conv.user_message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-surface-elevated px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%] font-mono text-sm">
                      {conv.ai_response}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2 mb-3">
                {['Show me the plan', 'What channels do I have?', 'Create my Discord server'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setMessage(suggestion)}
                    className="text-xs px-3 py-1 bg-surface-elevated hover:bg-border rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Orbit anything..."
                  className="flex-1 px-4 py-2 bg-surface-elevated border border-border rounded-full focus:outline-none focus:border-primary text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="w-10 h-10 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Server Info & Discord Actions */}
          <div className="space-y-6">
            {/* Discord Action Card */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Discord Integration</h3>
              
              {!discordConnection ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted">
                    Connect your Discord account to create a real Discord server with all your configured channels and roles.
                  </p>
                  <a
                    href="/api/discord/auth"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Connect Discord Account
                  </a>
                </div>
              ) : server.discord_invite_url ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-sm font-medium">Discord Server Active</span>
                  </div>
                  <a
                    href={server.discord_invite_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-success hover:bg-success/90 text-white font-medium rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Join Discord Server
                  </a>
                  <p className="text-xs text-muted text-center">
                    Connected as {discordConnection.discord_username}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-sm font-medium">Discord Connected</span>
                  </div>
                  <button
                    onClick={createDiscordServer}
                    disabled={creatingDiscord}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                  >
                    {creatingDiscord ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                    {creatingDiscord ? 'Creating...' : 'Create Discord Server'}
                  </button>
                  <p className="text-xs text-muted">
                    This will create a real Discord server with {channels.length} channels and {roles.length} roles.
                  </p>
                </div>
              )}
            </div>

            {/* Server Preview */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {server.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{server.name}</h2>
                  <p className="text-muted text-sm">{server.description || 'No description'}</p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(channelGroups).map(([category, categoryChannels]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M4 9h16M4 15h16M10 3v18M14 3v18"/>
                      </svg>
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {(categoryChannels as Channel[]).map((channel: Channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors group"
                        >
                          <MessageSquare className="w-4 h-4 text-muted" />
                          <span className="text-sm">#{channel.name}</span>
                          {channel.is_ai_managed && (
                            <span className="ml-auto text-xs px-2 py-0.5 bg-accent/20 text-accent rounded font-medium">
                              AI
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-elevated rounded-full text-sm"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
