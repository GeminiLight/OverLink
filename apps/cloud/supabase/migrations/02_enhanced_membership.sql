-- ==========================================
-- Part 1: Basic Profile Setup
-- ==========================================

-- 1. Create PROFILES table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  nickname text,
  avatar_url text,
  tier text default 'free' check (tier in ('free', 'pro', 'institutional')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable RLS on profiles if not already enabled
alter table public.profiles enable row level security;

-- 3. Add policies if they don't exist
do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can view their own profile') then
        create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update their own profile') then
        create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
    end if;
end
$$;

-- 4. Add 'tier' column if profiles exists but tier is missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'tier') then
        alter table public.profiles add column tier text default 'free' check (tier in ('free', 'pro', 'institutional'));
    end if;
end
$$;

-- 5. Create handle_new_user function if not exists
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do nothing; -- Prevent error if profile already created
  return new;
end;
$$ language plpgsql security definer;

-- 6. Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Trigger for updated_at
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new; 
end;
$$ language plpgsql;

drop trigger if exists update_profiles_modtime on public.profiles;
create trigger update_profiles_modtime
    before update on public.profiles
    for each row execute procedure update_modified_column();

-- ==========================================
-- Part 2: Enhanced Membership (Subscriptions)
-- ==========================================

-- 1. Create subscriptions table
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tier text not null check (tier in ('pro', 'institutional')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  start_at timestamp with time zone not null default now(),
  end_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table public.subscriptions enable row level security;

-- 3. RLS Policies
create policy "Users can view their own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 4. Function to recalculate profile tier
create or replace function public.calculate_user_tier()
returns trigger as $$
declare
  target_user_id uuid;
  new_tier text;
begin
  -- Determine user_id based on operation type
  if (TG_OP = 'DELETE') then
    target_user_id := OLD.user_id;
  else
    target_user_id := NEW.user_id;
  end if;

  -- Logic: Find highest priority active subscription
  -- Priority: institutional (2) > pro (1) > free (0)
  select 
    coalesce(
      (
        select tier 
        from public.subscriptions 
        where user_id = target_user_id 
          and status = 'active'
          and start_at <= now() 
          and end_at >= now()
        order by 
          case tier 
            when 'institutional' then 2 
            when 'pro' then 1 
            else 0 
          end desc
        limit 1
      ), 
      'free'
    ) into new_tier;

  -- Update the profile cache
  update public.profiles
  set tier = new_tier, updated_at = now()
  where id = target_user_id;

  return null;
end;
$$ language plpgsql security definer;

-- 5. Create Trigger
drop trigger if exists on_subscription_change on public.subscriptions;
create trigger on_subscription_change
  after insert or update or delete on public.subscriptions
  for each row execute procedure public.calculate_user_tier();
