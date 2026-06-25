-- GRACE AI — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행하세요

-- 1. 방문 기록
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  user_agent text,
  created_at timestamptz default now()
);

-- 2. 사용자 진단 세션
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_name text,
  gender text,
  body_key text,
  season text,
  created_at timestamptz default now()
);

-- 3. AI 채팅 메시지
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- 4. 코칭 체크리스트
create table if not exists coaching_progress (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  coach_id text not null,
  done boolean default false,
  updated_at timestamptz default now(),
  unique(session_id, coach_id)
);

-- RLS 활성화 (익명 insert 허용)
alter table page_views enable row level security;
alter table sessions enable row level security;
alter table chat_messages enable row level security;
alter table coaching_progress enable row level security;

create policy "anon insert" on page_views for insert to anon with check (true);
create policy "anon insert" on sessions for insert to anon with check (true);
create policy "anon update" on sessions for update to anon using (true);
create policy "anon insert" on chat_messages for insert to anon with check (true);
create policy "anon insert" on coaching_progress for insert to anon with check (true);
create policy "anon update" on coaching_progress for update to anon using (true);
