import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { buildStats, formatSeoulDateTime, type Registration } from "@/lib/dashboard-stats";
import { DailyLineChart, ExperienceBarChart, GoalPieChart, TeamDonutChart } from "@/components/dashboard/Charts";

export const metadata: Metadata = {
  title: "신청 현황 대시보드",
};

// 새로고침할 때마다 Supabase에서 최신 데이터를 다시 가져옵니다.
export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 truncate text-3xl font-bold text-slate-900" title={String(value)}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  let rows: Registration[] = [];
  let loadError: string | null = null;

  if (!isAdminConfigured || !supabaseAdmin) {
    loadError = ".env.local 파일에 SUPABASE_SERVICE_ROLE_KEY 가 아직 입력되지 않았습니다. 입력 후 서버를 다시 켜주세요.";
  } else {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("id, name, email, team, position, ai_experience, interest, dietary, created_at")
      .order("created_at", { ascending: false });
    if (error) loadError = `데이터를 불러오지 못했습니다: ${error.message}`;
    else rows = data ?? [];
  }

  const now = new Date();
  const stats = buildStats(rows, now);

  return (
    <main className="flex-1 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">AI 바이브 코딩 마스터클래스</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">신청 현황 대시보드</h1>
            <p className="mt-1 text-sm text-slate-500">
              기준 시각 {formatSeoulDateTime(now.toISOString())} (한국 시간) · 새로고침하면 최신 데이터로 갱신됩니다
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            신청 페이지로 →
          </Link>
        </header>

        {loadError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {/* 요약 카드 */}
        <section aria-label="요약" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="총 신청 인원" value={stats.total} sub="명" />
          <StatCard label="오늘 신청 인원" value={stats.today} sub="명 · 한국 시간 기준" />
          <StatCard label="가장 많은 소속 팀" value={stats.topTeam} />
          <StatCard label="가장 많은 AI 경험 레벨" value={stats.topExperience} />
        </section>

        {/* 차트 */}
        <section aria-label="차트" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="소속 팀별 신청 분포">
            <TeamDonutChart items={stats.byTeam} />
          </ChartCard>
          <ChartCard title="AI 도구 사용 경험 분포">
            <ExperienceBarChart items={stats.byExperience} />
          </ChartCard>
          <ChartCard title="가장 배우고 싶은 것 분포">
            <GoalPieChart items={stats.byGoal} />
          </ChartCard>
          <ChartCard title="일별 신청 추이 (최근 7일)">
            <DailyLineChart items={stats.byDay} />
          </ChartCard>
        </section>

        {/* 신청자 목록 */}
        <section aria-labelledby="list-heading" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 id="list-heading" className="text-base font-semibold text-slate-900">
              신청자 목록
            </h2>
            <span className="text-sm text-slate-500">{rows.length}명</span>
          </div>
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {["이름", "이메일", "소속 팀", "직급", "AI 경험", "배우고 싶은 것", "식이 제한", "신청일시"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      아직 신청자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const hasDietary = !!r.dietary?.trim();
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{r.email}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{r.team}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{r.position}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{r.ai_experience}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{r.interest}</td>
                        <td className={`px-4 py-3 ${hasDietary ? "bg-yellow-100 font-medium text-yellow-900" : "text-slate-400"}`}>
                          {hasDietary ? r.dietary : "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-500">{formatSeoulDateTime(r.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
