import EventInfo from "@/components/EventInfo";
import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <main className="flex-1">
      {/* 상단: 행사명 + 부제 */}
      <header className="bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 py-16 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            사내 교육 · 강사: 이지혜 (외부 초청 강사)
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            AI 바이브 코딩 마스터클래스
          </h1>
          <p className="mt-4 text-lg text-indigo-100 sm:text-xl">
            코딩 없이 AI로 업무 도구를 만드는 법
          </p>
        </div>
      </header>

      {/* 중간: 강의 소개 */}
      <section aria-labelledby="intro-heading" className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h2 id="intro-heading" className="sr-only">
          강의 소개
        </h2>
        <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
          AI에게 말로 지시하면 앱이 만들어집니다.
          <br />
          코딩 경험이 전혀 없어도 괜찮아요.
          <br />
          4시간이면 여러분만의 업무 도구를 직접 만들 수 있습니다.
        </p>
      </section>

      {/* 행사 정보 */}
      <EventInfo />

      {/* 하단: 신청 폼 */}
      <section aria-labelledby="form-heading" className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h2 id="form-heading" className="mb-6 text-2xl font-bold text-slate-900">
            강의 신청
          </h2>
          <RegistrationForm />
        </div>
      </section>

      <footer className="px-4 pb-10 text-center text-sm text-slate-400">
        2026년 4월 2일 · 본사 대회의실
      </footer>
    </main>
  );
}
