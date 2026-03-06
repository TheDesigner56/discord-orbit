import Link from 'next/link';
import { ArrowRight, Layers, MessageSquare, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm text-muted hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Build Your Discord
            <br />
            <span className="text-gradient">Without the Chaos</span>
          </h1>
          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
            Your AI-powered community manager. Tell us what you need, and we'll design, set up, and run your Discord server—so you can focus on your product.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border hover:border-primary/50 text-white font-semibold rounded-xl transition-all"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted">From setup to ongoing management</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Templates</h3>
              <p className="text-muted">Choose from SaaS, Gaming, Creator, Education, or Support templates with pre-configured channels and roles.</p>
            </div>
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-muted">Chat with Orbit to configure your server. Ask questions, get recommendations, and approve changes.</p>
            </div>
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Management</h3>
              <p className="text-muted">AI handles welcome messages, moderation, FAQ responses, and escalates complex issues to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Launch?</h2>
          <p className="text-muted mb-8">Create your Discord server in minutes with AI assistance.</p>
          <Link 
            href="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all"
          >
            Start Building Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-muted text-sm">
          DiscordOrbit &copy; 2026. AI-powered community management.
        </div>
      </footer>
    </div>
  );
}
