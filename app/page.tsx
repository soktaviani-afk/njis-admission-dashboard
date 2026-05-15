import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-10">
      <div className="w-full max-w-5xl rounded-[40px] bg-white p-10 shadow-2xl border border-slate-200">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
            Admissions & Marketing Dashboard
          </p>

          <h1 className="mt-4 text-5xl font-extrabold text-[#071739]">
            NJIS Dashboard
          </h1>

          <p className="mt-4 text-slate-500 text-lg">
            Centralized dashboard for
            admissions analytics and
            student management.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            href="/student-exit"
            className="rounded-[32px] bg-[#071739] p-8 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-3xl font-bold">
              Student Exit Analysis
            </h2>

            <p className="mt-4 text-slate-300">
              Monitor student exit trends,
              retention insights, and exit
              analytics.
            </p>
          </Link>

          <Link
            href="/enrollment-status"
            className="rounded-[32px] bg-blue-600 p-8 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-3xl font-bold">
              Enrollment Status
            </h2>

            <p className="mt-4 text-blue-100">
              Track admissions pipeline,
              onboarding progress, and
              enrollment operations.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}