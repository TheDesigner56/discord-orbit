-- Create users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create server templates table
create table if not exists public.server_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  category text not null,
  default_channels jsonb default '[]',
  default_roles jsonb default '[]',
  recommended_features jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create servers table
create table if not exists public.servers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  template_id uuid references public.server_templates(id),
  community_size integer default 100,
  status text default 'draft',
  configuration jsonb default '{}',
  discord_server_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create channels table
create table if not exists public.channels (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  name text not null,
  type text default 'text',
  category text,
  description text,
  is_ai_managed boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create roles table
create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  name text not null,
  color text,
  permissions jsonb default '{}',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create AI conversations table
create table if not exists public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  user_message text not null,
  ai_response text not null,
  context jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create AI behavior settings table
create table if not exists public.ai_settings (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  welcome_new_members boolean default true,
  moderate_conversations boolean default true,
  answer_questions boolean default true,
  summarize_discussions boolean default false,
  escalate_complex_issues boolean default true,
  check_in_frequency text default 'weekly',
  custom_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.channels enable row level security;
alter table public.roles enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_settings enable row level security;

-- Profiles RLS policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Servers RLS policies
create policy "Users can view own servers"
  on public.servers for select
  using (auth.uid() = user_id);

create policy "Users can create own servers"
  on public.servers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own servers"
  on public.servers for update
  using (auth.uid() = user_id);

create policy "Users can delete own servers"
  on public.servers for delete
  using (auth.uid() = user_id);

-- Channels RLS policies
create policy "Users can view channels of their servers"
  on public.channels for select
  using (
    exists (
      select 1 from public.servers
      where servers.id = channels.server_id
      and servers.user_id = auth.uid()
    )
  );

create policy "Users can manage channels of their servers"
  on public.channels for all
  using (
    exists (
      select 1 from public.servers
      where servers.id = channels.server_id
      and servers.user_id = auth.uid()
    )
  );

-- Roles RLS policies
create policy "Users can view roles of their servers"
  on public.roles for select
  using (
    exists (
      select 1 from public.servers
      where servers.id = roles.server_id
      and servers.user_id = auth.uid()
    )
  );

create policy "Users can manage roles of their servers"
  on public.roles for all
  using (
    exists (
      select 1 from public.servers
      where servers.id = roles.server_id
      and servers.user_id = auth.uid()
    )
  );

-- AI Conversations RLS policies
create policy "Users can view conversations of their servers"
  on public.ai_conversations for select
  using (
    exists (
      select 1 from public.servers
      where servers.id = ai_conversations.server_id
      and servers.user_id = auth.uid()
    )
  );

create policy "Users can create conversations for their servers"
  on public.ai_conversations for insert
  with check (
    exists (
      select 1 from public.servers
      where servers.id = ai_conversations.server_id
      and servers.user_id = auth.uid()
    )
  );

-- AI Settings RLS policies
create policy "Users can manage AI settings of their servers"
  on public.ai_settings for all
  using (
    exists (
      select 1 from public.servers
      where servers.id = ai_settings.server_id
      and servers.user_id = auth.uid()
    )
  );

-- Insert default templates
insert into public.server_templates (name, slug, description, category, icon, default_channels, default_roles, recommended_features) values
('SaaS Product', 'saas', 'Support, feedback, and feature requests for your product', 'business', 'layers', 
 '["announcements", "general", "support", "feedback", "feature-requests", "bug-reports"]'::jsonb,
 '["Admin", "Moderator", "Beta Tester", "Member"]'::jsonb,
 '["welcome", "moderate", "answer", "escalate"]'::jsonb),

('Gaming Community', 'gaming', 'LFG, tournaments, and community hangout', 'entertainment', 'gamepad',
 '["announcements", "general", "lfg", "tournaments", "clips", "memes"]'::jsonb,
 '["Admin", "Moderator", "Tournament Organizer", "Member"]'::jsonb,
 '["welcome", "moderate", "events"]'::jsonb),

('Creator Hub', 'creator', 'Engage fans, share content, and build belonging', 'creator', 'sparkles',
 '["announcements", "general", "behind-the-scenes", "community", "showcase", "q-and-a"]'::jsonb,
 '["Admin", "Moderator", "VIP", "Member"]'::jsonb,
 '["welcome", "moderate", "summarize"]'::jsonb),

('Education', 'education', 'Courses, Q&A, and peer learning communities', 'education', 'graduation-cap',
 '["announcements", "general", "lessons", "homework", "study-group", "resources"]'::jsonb,
 '["Instructor", "Teaching Assistant", "Student", "Guest"]'::jsonb,
 '["welcome", "answer", "summarize"]'::jsonb),

('Customer Support', 'support', 'Help desk, troubleshooting, and knowledge base', 'business', 'help-circle',
 '["announcements", "general", "help", "bugs", "tutorials", "faq"]'::jsonb,
 '["Admin", "Support Agent", "Verified User", "Guest"]'::jsonb,
 '["welcome", "moderate", "answer", "escalate"]'::jsonb);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
