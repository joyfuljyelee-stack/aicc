-- AI 바이브 코딩 마스터클래스 신청 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

create table public.registrations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  team          text not null
                check (team in ('프로덕트', '마케팅', '세일즈', '컨설팅', '개발', '디자인', '경영지원', '기타')),
  position      text not null
                check (position in ('사원', '대리', '과장', '차장', '부장', '임원')),
  ai_experience text not null
                check (ai_experience in ('처음이에요', 'ChatGPT 정도 써봤어요', 'Claude도 써봤어요', 'Claude Code까지 써봤어요')),
  interest      text not null
                check (interest in ('업무 자동화', '데이터 분석', '웹서비스 만들기', 'AI 도구 전반', '기타')),
  dietary       text,
  created_at    timestamptz not null default now()
);

-- 같은 이메일로 중복 신청 방지
create unique index registrations_email_key on public.registrations (lower(email));

-- 보안 설정: 웹페이지(익명 사용자)는 신청(insert)만 가능, 조회는 대시보드에서만
alter table public.registrations enable row level security;

create policy "anyone can register"
  on public.registrations
  for insert
  to anon
  with check (true);
