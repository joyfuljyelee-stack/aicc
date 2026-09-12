// 대시보드용 집계 로직 (Asia/Seoul 기준)

export const TEAMS = ["프로덕트", "마케팅", "세일즈", "컨설팅", "개발", "디자인", "경영지원", "기타"] as const;
export const AI_EXPERIENCES = [
  "처음이에요",
  "ChatGPT 정도 써봤어요",
  "Claude도 써봤어요",
  "Claude Code까지 써봤어요",
] as const;
export const LEARNING_GOALS = ["업무 자동화", "데이터 분석", "웹서비스 만들기", "AI 도구 전반", "기타"] as const;

export type Registration = {
  id: string;
  name: string;
  email: string;
  team: string;
  position: string;
  ai_experience: string;
  interest: string;
  dietary: string | null;
  created_at: string;
};

export type CountItem = { name: string; value: number };

const SEOUL = "Asia/Seoul";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SEOUL,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: SEOUL,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "2026-04-02" 형태의 서울 기준 날짜 키 */
export function toSeoulDateKey(date: Date): string {
  return dateKeyFormatter.format(date);
}

/** "2026. 04. 02. 14:03" 형태 */
export function formatSeoulDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso)).replace(/\.\s?$/, "");
}

/** 예상 밖 값은 "기타"로 처리 */
function normalize(value: string, allowed: readonly string[]): string {
  return allowed.includes(value) ? value : "기타";
}

/** 카테고리 순서를 유지하며 개수 세기. 목록에 없는 값은 기타로. */
function countBy(rows: Registration[], pick: (r: Registration) => string, categories: readonly string[]): CountItem[] {
  const counts = new Map<string, number>(categories.map((c) => [c, 0]));
  if (!counts.has("기타")) counts.set("기타", 0);
  for (const row of rows) {
    const key = normalize(pick(row), categories);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const items = Array.from(counts, ([name, value]) => ({ name, value }));
  // 원래 목록에 "기타"가 없는 카테고리(AI 경험)는 값이 있을 때만 표시
  return categories.includes("기타") ? items : items.filter((i) => i.name !== "기타" || i.value > 0);
}

/** 가장 많은 항목. 동률이면 카테고리 순서상 앞의 것. 0건이면 "-" */
function topOf(items: CountItem[]): string {
  let best: CountItem | null = null;
  for (const item of items) {
    if (item.value > 0 && (!best || item.value > best.value)) best = item;
  }
  return best ? best.name : "-";
}

export type DashboardStats = {
  total: number;
  today: number;
  topTeam: string;
  topExperience: string;
  byTeam: CountItem[];
  byExperience: CountItem[];
  byGoal: CountItem[];
  byDay: { date: string; label: string; value: number }[];
};

export function buildStats(rows: Registration[], now: Date = new Date()): DashboardStats {
  const todayKey = toSeoulDateKey(now);

  const byTeam = countBy(rows, (r) => r.team, TEAMS);
  const byExperience = countBy(rows, (r) => r.ai_experience, AI_EXPERIENCES);
  const byGoal = countBy(rows, (r) => r.interest, LEARNING_GOALS);

  // 최근 7일 (오늘 포함) 일별 신청 수
  const dayKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dayKeys.push(toSeoulDateKey(new Date(now.getTime() - i * 86_400_000)));
  }
  const dayCounts = new Map<string, number>(dayKeys.map((k) => [k, 0]));
  for (const row of rows) {
    const key = toSeoulDateKey(new Date(row.created_at));
    if (dayCounts.has(key)) dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const byDay = dayKeys.map((date) => {
    const [, m, d] = date.split("-");
    return { date, label: `${Number(m)}/${Number(d)}`, value: dayCounts.get(date) ?? 0 };
  });

  return {
    total: rows.length,
    today: dayCounts.get(todayKey) ?? 0,
    topTeam: topOf(byTeam),
    topExperience: topOf(byExperience),
    byTeam,
    byExperience,
    byGoal,
    byDay,
  };
}
