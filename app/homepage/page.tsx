"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";
import Topbar from "@/components/layout/topbar";

import Link from "next/link";

import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  RefreshCw,
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type EnrollmentStudent = {
  "Current Stage": string;
  "Final Status": string;
};

type AIInsight = {
  summary: string;
  priorities: string[];
  recommendation: string;
};

export default function Homepage() {
  const router = useRouter();

  const [enrollmentData, setEnrollmentData] =
    useState<EnrollmentStudent[]>([]);

  const [loading, setLoading] = useState(true);

  const [aiLoading, setAiLoading] = useState(false);

  const [aiInsight, setAiInsight] =
    useState<AIInsight | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/MASTER_ENROLLMENT"
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setEnrollmentData(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalApplicants =
      enrollmentData.length;

    const activeEnrollment =
      enrollmentData.filter(
        (student) =>
          student["Final Status"] === "Completed"
      ).length;

    const inProgress =
      enrollmentData.filter(
        (student) =>
          student["Final Status"] === "In Progress"
      ).length;

    const completionRate =
      totalApplicants > 0
        ? Math.round(
            (activeEnrollment / totalApplicants) * 100
          )
        : 0;

    return {
      totalApplicants,
      activeEnrollment,
      inProgress,
      completionRate,
    };
  }, [enrollmentData]);

  const generateAIInsight = async () => {
    if (!enrollmentData.length) return;

    try {
      setAiLoading(true);

      const stageCounts: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};

      enrollmentData.forEach((student) => {
        const stage =
          student["Current Stage"] || "Unknown";

        const status =
          student["Final Status"] || "Unknown";

        stageCounts[stage] =
          (stageCounts[stage] || 0) + 1;

        statusCounts[status] =
          (statusCounts[status] || 0) + 1;
      });

      const response = await fetch(
        "/api/admissions-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalApplicants:
              dashboardStats.totalApplicants,

            completed:
              dashboardStats.activeEnrollment,

            inProgress:
              dashboardStats.inProgress,

            completionRate:
              dashboardStats.completionRate,

            stageCounts,
            statusCounts,
          }),
        }
      );

if (!response.ok) {
  const errorData = await response.json().catch(() => null);

  throw new Error(
    errorData?.error ||
      `AI request failed with status ${response.status}`
  );
}

      const result = await response.json();

      setAiInsight(result);
    } catch (error) {
      console.error("AI insight error:", error);

      setAiInsight({
        summary:
          "AI analysis is temporarily unavailable. Please try again.",
        priorities: [],
        recommendation:
          "Refresh the analysis and try again.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("njis-auth");

    if (!isAuthenticated) {
      router.push("/");
    }
  }, [router]);

  return (
    <div
      className={`${jakarta.className} flex min-h-screen bg-slate-100`}
    >
      <Sidebar />

      <section className="flex-1 p-10">

        <Topbar
          title="Dashboard Overview"
          subtitle="Welcome back to NJIS internal admissions management system and operational dashboard."
        />

        {/* KPI */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[28px] bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Applicants"
              value={String(
                dashboardStats.totalApplicants
              )}
            />

            <StatCard
              title="Active Enrollment"
              value={String(
                dashboardStats.activeEnrollment
              )}
            />

            <StatCard
              title="In Progress"
              value={String(
                dashboardStats.inProgress
              )}
            />

            <StatCard
              title="Completion Rate"
              value={`${dashboardStats.completionRate}%`}
            />

          </div>
        )}

        {/* AI ADMISSIONS INTELLIGENCE */}
        <div className="mt-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#071739] via-[#0B285A] to-[#123D82] p-8 text-white shadow-[0_20px_60px_rgba(7,23,57,0.20)]">

          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

            <div className="max-w-3xl">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles size={22} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
                    AI Admissions Intelligence
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    AI-powered operational briefing
                  </p>
                </div>

              </div>

              <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
                {aiInsight
                  ? "Here’s what your admissions data is telling you."
                  : "Turn admissions data into actionable insight."}
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                {aiInsight
                  ? aiInsight.summary
                  : "Let AI analyze your current admissions pipeline and identify priorities, patterns, and recommended actions."}
              </p>

            </div>

            <button
              onClick={generateAIInsight}
              disabled={
                aiLoading ||
                loading ||
                !enrollmentData.length
              }
              className="flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-bold text-[#071739] shadow-lg transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >

              {aiLoading ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit size={18} />
                  {aiInsight
                    ? "Refresh Analysis"
                    : "Analyze with AI"}
                </>
              )}

            </button>

          </div>

          {/* AI RESULTS */}
          {aiInsight && (
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                  Priority Areas
                </p>

                <div className="mt-4 space-y-3">

                  {aiInsight.priorities.length > 0 ? (
                    aiInsight.priorities.map(
                      (priority, index) => (
                        <div
                          key={index}
                          className="flex gap-3"
                        >

                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                            {index + 1}
                          </span>

                          <p className="text-sm leading-6 text-slate-200">
                            {priority}
                          </p>

                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-300">
                      No major priority detected.
                    </p>
                  )}

                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                  AI Recommendation
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-200">
                  {aiInsight.recommendation}
                </p>

              </div>

            </div>
          )}

        </div>

        {/* QUICK NAVIGATION */}
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">

          <Link
            href="/enrollment-status"
            className="group rounded-[32px] bg-gradient-to-br from-[#071739] to-[#123D82] p-8 text-white shadow-[0_20px_60px_rgba(7,23,57,0.18)] transition-all duration-300 hover:-translate-y-2"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase tracking-[0.35em] text-blue-200">
                  Dashboard
                </p>

                <h2 className="mt-4 text-4xl font-extrabold">
                  Enrollment Status
                </h2>

                <p className="mt-4 max-w-md text-slate-300">
                  Monitor admissions progress,
                  onboarding, documents, and
                  student pipeline.
                </p>

              </div>

              <ArrowRight className="transition duration-300 group-hover:translate-x-2" />

            </div>

          </Link>

          <Link
            href="/student-exit"
            className="group rounded-[32px] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Dashboard
                </p>

                <h2 className="mt-4 text-4xl font-extrabold text-[#071739]">
                  Student Exit
                </h2>

                <p className="mt-4 max-w-md text-slate-500">
                  Analyze withdrawal reasons,
                  academic trends, and retention
                  insights.
                </p>

              </div>

              <ArrowRight className="text-[#071739] transition duration-300 group-hover:translate-x-2" />

            </div>

          </Link>

        </div>

      </section>
    </div>
  );
}