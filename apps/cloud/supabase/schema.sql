-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Turn on RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  filename text not null check (char_length(filename) >= 3),
  project_id text not null,
  
  -- Credentials
  overleaf_email_enc text, 
  overleaf_password_enc text,
  
  -- Sync State
  last_sync_at timestamp with time zone,
  last_sync_status text check (last_sync_status in ('pending', 'running', 'success', 'failed')),
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, filename)
);

-- Index for faster queries by user
create index idx_projects_user_id on public.projects(user_id);

alter table public.projects enable row level security;

create policy "Users can CRUD their own projects" on public.projects
  for all using (auth.uid() = user_id);

-- 3. JOBS
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  github_run_id text,
  status text check (status in ('queued', 'in_progress', 'completed', 'failed')),
  logs text,
  created_at timestamp with time zone default now()
);

-- Index for faster job history lookups
create index idx_jobs_project_id on public.jobs(project_id);

alter table public.jobs enable row level security;

create policy "Users can view their jobs" on public.jobs
  for select using (
    exists (
      select 1 from public.projects
      where public.projects.id = public.jobs.project_id
      and public.projects.user_id = auth.uid()
    )
  );

-- 4. Shared Trigger for updated_at
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new; 
end;
$$ language plpgsql;

create trigger update_profiles_modtime
    before update on public.profiles
    for each row execute procedure update_modified_column();

create trigger update_projects_modtime
    before update on public.projects
    for each row execute procedure update_modified_column();
