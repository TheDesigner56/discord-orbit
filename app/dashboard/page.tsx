import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Settings, MessageSquare, Users } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  const { data: servers } = await supabase
    .from('servers')
    .select('*, channels(count), roles(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span className="text-xl font-bold">DiscordOrbit</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-white">Dashboard</Link>
            <Link href="/templates" className="text-sm text-muted hover:text-white transition-colors">Templates</Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-muted hover:text-white transition-colors">
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted">Manage your Discord servers and AI community managers</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-12">
          <Link 
            href="/setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Server
          </Link>
        </div>

        {/* Servers Grid */}
        {servers && servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <Link 
                key={server.id} 
                href={`/server/${server.id}`}
                className="group bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {server.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${server.status === 'active' ? 'bg-success/20 text-success' : ''}
                    ${server.status === 'draft' ? 'bg-warning/20 text-warning' : ''}
                    ${server.status === 'archived' ? 'bg-muted/20 text-muted' : ''}
                  `}>
                    {server.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {server.name}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">
                  {server.description || 'No description'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{server.channels?.[0]?.count || 0} channels</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{server.roles?.[0]?.count || 0} roles</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface rounded-2xl border border-border border-dashed">
            <div className="w-20 h-20 bg-surface-elevated rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No servers yet</h3>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Create your first Discord server with AI-powered management. Choose a template or start from scratch.
            </p>
            <Link 
              href="/setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Server
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
