-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public profile data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- PROJECTS (Overleaf Projects)
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  nickname text not null, -- e.g. "resume"
  project_id text not null, -- Overleaf ID or URL
  
  -- Credentials (Encrypted at App Level)
  overleaf_email_enc text, 
  overleaf_password_enc text,
  
  last_sync_at timestamp with time zone,
  last_sync_status text, -- 'success', 'failed', 'pending'
  
  created_at timestamp with time zone default now(),
  unique(user_id, nickname)
);

alter table public.projects enable row level security;

create policy "Users can CRUD their own projects" on public.projects
  for all using (auth.uid() = user_id);

-- JOBS (Sync History)
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects not null,
  github_run_id text,
  status text,
  logs text,
  created_at timestamp with time zone default now()
);

alter table public.jobs enable row level security;

create policy "Users can view their jobs" on public.jobs
  for select using (
    exists (
      select 1 from public.projects
      where public.projects.id = public.jobs.project_id
      and public.projects.user_id = auth.uid()
    )
  );
