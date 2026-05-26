create table if not exists public.skills (
  id text primary key,
  title text not null,
  agent text not null check (agent in ('Claude', 'Codex', 'Hermes', 'OpenClaw', 'ComfyUI')),
  lane text not null check (lane in ('thinkingCards', 'makingCards', 'orchestratingCards')),
  status text not null check (status in ('Draft', 'Active', 'Needs review')),
  owner text not null default 'Shared',
  summary text not null default '',
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.skills enable row level security;

drop policy if exists "Anyone can read skills" on public.skills;
drop policy if exists "Anyone can add skills" on public.skills;
drop policy if exists "Anyone can update skills" on public.skills;
drop policy if exists "Anyone can delete skills" on public.skills;
drop policy if exists "Authenticated users can read skills" on public.skills;
drop policy if exists "Authenticated users can add skills" on public.skills;
drop policy if exists "Authenticated users can update skills" on public.skills;
drop policy if exists "Authenticated users can delete skills" on public.skills;

create policy "Authenticated users can read skills"
  on public.skills for select
  to authenticated
  using (true);

create policy "Authenticated users can add skills"
  on public.skills for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update skills"
  on public.skills for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete skills"
  on public.skills for delete
  to authenticated
  using (true);

grant select, insert, update, delete on public.skills to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.skills;
exception
  when duplicate_object then null;
end $$;
