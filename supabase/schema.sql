-- Supabase Schema for Productivity To-Do List Web App

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Lists Table
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#74B9FF',
  created_at timestamptz not null default now()
);

-- 2. Tags Table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#FEE2E2',
  created_at timestamptz not null default now(),
  constraint unique_user_tag_name unique (user_id, name)
);

-- 3. Tasks Table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  list_id uuid references public.lists(id) on delete set null,
  title text not null,
  description text default '',
  due_date date,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  recurrence text check (recurrence in ('daily', 'weekly', 'monthly')) default null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  position double precision not null default 0,
  sticky_color text default '#FEF08A',
  sticky_x integer default 40,
  sticky_y integer default 40,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Subtasks Table
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Task Tags Junction Table
create table if not exists public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

-- Indexes for optimal performance
create index if not exists idx_tasks_user_due on public.tasks (user_id, due_date);
create index if not exists idx_tasks_user_list on public.tasks (user_id, list_id);
create index if not exists idx_subtasks_task on public.subtasks (task_id);
create index if not exists idx_task_tags_task on public.task_tags (task_id);

-- Updated_at trigger for tasks
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.handle_updated_at();

-- Enable Row Level Security (RLS) on all tables
alter table public.lists enable row level security;
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.task_tags enable row level security;

-- RLS Policies: auth.uid() = user_id for all operations
drop policy if exists "Users manage their own lists" on public.lists;
create policy "Users manage their own lists"
  on public.lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own tags" on public.tags;
create policy "Users manage their own tags"
  on public.tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own tasks" on public.tasks;
create policy "Users manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own subtasks" on public.subtasks;
create policy "Users manage their own subtasks"
  on public.subtasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own task tags" on public.task_tags;
create policy "Users manage their own task tags"
  on public.task_tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable Realtime subscriptions
alter publication supabase_realtime add table public.lists;
alter publication supabase_realtime add table public.tags;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.subtasks;
alter publication supabase_realtime add table public.task_tags;
