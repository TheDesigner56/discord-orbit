'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ChevronRight, ChevronLeft, Check, Layers, Gamepad2, Sparkles, GraduationCap, HelpCircle } from 'lucide-react';

const templates = [
  { id: 'saas', name: 'SaaS Product', description: 'Support, feedback, and feature requests for your product', icon: Layers, channels: ['announcements', 'general', 'support', 'feedback', 'feature-requests', 'bug-reports'] },
  { id: 'gaming', name: 'Gaming Community', description: 'LFG, tournaments, and community hangout', icon: Gamepad2, channels: ['announcements', 'general', 'lfg', 'tournaments', 'clips', 'memes'] },
  { id: 'creator', name: 'Creator Hub', description: 'Engage fans, share content, and build belonging', icon: Sparkles, channels: ['announcements', 'general', 'behind-the-scenes', 'community', 'showcase', 'q-and-a'] },
  { id: 'education', name: 'Education', description: 'Courses, Q&A, and peer learning communities', icon: GraduationCap, channels: ['announcements', 'general', 'lessons', 'homework', 'study-group', 'resources'] },
  { id: 'support', name: 'Customer Support', description: 'Help desk, troubleshooting, and knowledge base', icon: HelpCircle, channels: ['announcements', 'general', 'help', 'bugs', 'tutorials', 'faq'] },
];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: '',
    communitySize: 100,
    goals: [] as string[],
    channels: [] as string[],
    roles: [] as string[],
    aiSettings: {
      welcomeNewMembers: true,
      moderateConversations: true,
      answerQuestions: true,
      summarizeDiscussions: false,
      escalateComplexIssues: true,
    },
  });

  useEffect(() => {
    // Pre-select template channels when template changes
    if (formData.template) {
      const template = templates.find(t => t.id === formData.template);
      if (template && formData.channels.length === 0) {
        setFormData(prev => ({ ...prev, channels: template.channels }));
      }
    }
  }, [formData.template]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth');
        return;
      }

      // Create server
      const { data: server, error: serverError } = await supabase
        .from('servers')
        .insert([{
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          community_size: formData.communitySize,
          configuration: {
            goals: formData.goals,
            template: formData.template,
          },
          status: 'draft',
        }])
        .select()
        .single();

      if (serverError) throw serverError;

      // Create channels
      const channels = formData.channels.map((name, index) => ({
        server_id: server.id,
        name,
        type: 'text',
        category: index < 2 ? 'Information' : index < 4 ? 'General' : 'Support',
        order_index: index,
        is_ai_managed: ['support', 'feedback', 'help', 'bugs'].includes(name),
      }));

      await supabase.from('channels').insert(channels);

      // Create roles
      const roles = formData.roles.length > 0 
        ? formData.roles.map((name, index) => ({
            server_id: server.id,
            name,
            color: ['#EF4444', '#F59E0B', '#22D3EE', '#10B981'][index % 4],
            is_default: name === 'Member',
          }))
        : [
            { server_id: server.id, name: 'Admin', color: '#EF4444', is_default: false },
            { server_id: server.id, name: 'Moderator', color: '#F59E0B', is_default: false },
            { server_id: server.id, name: 'Member', color: '#10B981', is_default: true },
          ];

      await supabase.from('roles').insert(roles);

      // Create AI settings
      await supabase.from('ai_settings').insert([{
        server_id: server.id,
        welcome_new_members: formData.aiSettings.welcomeNewMembers,
        moderate_conversations: formData.aiSettings.moderateConversations,
        answer_questions: formData.aiSettings.answerQuestions,
        summarize_discussions: formData.aiSettings.summarizeDiscussions,
        escalate_complex_issues: formData.aiSettings.escalateComplexIssues,
      }]);

      router.push(`/server/${server.id}`);
    } catch (error) {
      console.error('Error creating server:', error);
      alert('Failed to create server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${step === s ? 'bg-primary text-white' : ''}
                ${step > s ? 'bg-success text-white' : ''}
                ${step < s ? 'bg-surface text-muted' : ''}
              `}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {step > s ? <Check className="w-4 h-4" /> : s}
              </span>
              <span className="hidden sm:inline">
                {s === 1 && 'Basic Info'}
                {s === 2 && 'Purpose'}
                {s === 3 && 'Channels'}
                {s === 4 && 'Roles'}
                {s === 5 && 'AI Settings'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Server Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary text-white"
                placeholder="My Awesome Community"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary text-white min-h-[100px] resize-y"
                placeholder="What is your community about?"
              />
            </div>
          </div>
        )}

        {/* Step 2: Purpose */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-muted mb-4">Choose a Template</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setFormData({ ...formData, template: template.id })}
                      className={`
                        p-6 rounded-xl border text-left transition-all
                        ${formData.template === template.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-surface hover:border-primary/50'}
                      `}
                    >
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-4">Community Size</label>
              <input
                type="range"
                min="10"
                max="10000"
                value={formData.communitySize}
                onChange={(e) => setFormData({ ...formData, communitySize: parseInt(e.target.value) })}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted mt-2">
                <span>10 members</span>
                <span className="text-white font-medium">{formData.communitySize.toLocaleString()}</span>
                <span>10,000+ members</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-4">Primary Goals</label>
              <div className="space-y-2">
                {['Customer Support', 'Collect Feedback', 'Build Engagement', 'Share Content', 'Networking'].map((goal) => (
                  <label key={goal} className="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer hover:bg-surface-elevated transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, goals: [...formData.goals, goal] });
                        } else {
                          setFormData({ ...formData, goals: formData.goals.filter(g => g !== goal) });
                        }
                      }}
                      className="w-5 h-5 accent-primary"
                    />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Channels */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-muted mb-4">Select Channels</label>
              <div className="space-y-2">
                {[
                  { id: 'announcements', label: 'Important updates', default: true },
                  { id: 'general', label: 'General chat', default: true },
                  { id: 'introductions', label: 'New member intros' },
                  { id: 'feedback', label: 'Feature requests', default: true },
                  { id: 'support', label: 'Get help', default: true },
                  { id: 'off-topic', label: 'Random chat' },
                  { id: 'events', label: 'Webinars, AMAs' },
                  { id: 'showcase', label: 'Share your work' },
                ].map((channel) => (
                  <label key={channel.id} className="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer hover:bg-surface-elevated transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, channels: [...formData.channels, channel.id] });
                        } else {
                          setFormData({ ...formData, channels: formData.channels.filter(c => c !== channel.id) });
                        }
                      }}
                      className="w-5 h-5 accent-primary"
                    />
                    <div>
                      <span className="font-medium">#{channel.id}</span>
                      <span className="text-muted text-sm ml-2">— {channel.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Roles */}
        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-muted mb-4">Roles & Permissions</label>
              <div className="space-y-2">
                {[
                  { id: 'Admin', label: 'Full control', default: true },
                  { id: 'Moderator', label: 'Manage discussions', default: true },
                  { id: 'Verified', label: 'Verified members' },
                  { id: 'Member', label: 'Standard access', default: true },
                  { id: 'Guest', label: 'Limited access' },
                ].map((role) => (
                  <label key={role.id} className="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer hover:bg-surface-elevated transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.id) || role.default}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, roles: [...formData.roles, role.id] });
                        } else {
                          setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.id) });
                        }
                      }}
                      className="w-5 h-5 accent-primary"
                    />
                    <div>
                      <span className="font-medium">{role.id}</span>
                      <span className="text-muted text-sm ml-2">— {role.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: AI Settings */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-muted mb-4">How should AI help manage your server?</label>
              <div className="space-y-2">
                {[
                  { key: 'welcomeNewMembers', label: 'Welcome new members' },
                  { key: 'moderateConversations', label: 'Moderate conversations' },
                  { key: 'answerQuestions', label: 'Answer common questions' },
                  { key: 'summarizeDiscussions', label: 'Summarize discussions' },
                  { key: 'escalateComplexIssues', label: 'Escalate complex issues to you' },
                ].map((setting) => (
                  <label key={setting.key} className="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer hover:bg-surface-elevated transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.aiSettings[setting.key as keyof typeof formData.aiSettings]}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          aiSettings: {
                            ...formData.aiSettings,
                            [setting.key]: e.target.checked,
                          },
                        });
                      }}
                      className="w-5 h-5 accent-primary"
                    />
                    <span>{setting.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-border">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 text-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Server'}
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
