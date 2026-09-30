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

type AIChatMessage = {
  role: "user" | "ai";
  content: string;
};

export default function Homepage() {
  const router = useRouter();

  const [enrollmentData, setEnrollmentData] =
    useState<EnrollmentStudent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiInsight, setAiInsight] =
    useState<AIInsight | null>(null);

  const [chatQuestion, setChatQuestion] =
    useState("");

  const [chatMessages, setChatMessages] =
    useState<AIChatMessage[]>([]);

  const [chatLoading, setChatLoading] =
    useState(false);

  // ==========================================
  // FETCH ADMISSIONS DATA
  // ==========================================

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

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

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

  // ==========================================
  // GENERATE AI SUMMARY
  // ==========================================

const generateAIInsight = async () => {
  if (!enrollmentData.length) return;

  try {
    setAiLoading(true);

    const response = await fetch(
      "/api/admissions-ai",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "summary",
        }),
      }
    );

    if (!response.ok) {
      const errorData =
        await response
          .json()
          .catch(() => null);

      throw new Error(
        errorData?.error ||
          `AI request failed with status ${response.status}`
      );
    }

    const result =
      await response.json();

    setAiInsight(result);
  } catch (error) {
    console.error(
      "AI insight error:",
      error
    );

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

  // ==========================================
  // ASK AI CHAT
  // ==========================================

 const askAdmissionsAI = async (
  customQuestion?: string
) => {
  const question =
    customQuestion ||
    chatQuestion.trim();

  if (!question) return;

  try {
    setChatLoading(true);

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setChatQuestion("");

    const response = await fetch(
      "/api/admissions-ai",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          mode: "chat",
          question,
        }),
      }
    );

    if (!response.ok) {
      const errorData =
        await response
          .json()
          .catch(() => null);

      throw new Error(
        errorData?.error ||
          `AI request failed with status ${response.status}`
      );
    }

    const result =
      await response.json();

    setChatMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          result.answer,
      },
    ]);
  } catch (error) {
    console.error(
      "AI chat error:",
      error
    );

    setChatMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "Sorry, I couldn't analyze the admissions data right now. Please try again.",
      },
    ]);
  } finally {
    setChatLoading(false);
  }
};

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("njis-auth");

    if (!isAuthenticated) {
      router.push("/");
    }
  }, [router]);

  // ==========================================
  // UI
  // ==========================================

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

        {/* ==========================================
            KPI
        ========================================== */}

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

        {/* ==========================================
            AI ADMISSIONS INTELLIGENCE
        ========================================== */}

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

          {/* ==========================================
              AI RESULTS
          ========================================== */}

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

        {/* ==========================================
            ASK ADMISSIONS AI
        ========================================== */}

        <div className="mt-6 rounded-[32px] bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071739] text-white">
              <BrainCircuit size={21} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#123D82]">
                Ask Admissions AI
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Ask questions about your admissions data.
              </p>
            </div>

          </div>

          {/* CHAT HISTORY */}

          {chatMessages.length > 0 && (
            <div className="mt-6 max-h-[360px] space-y-4 overflow-y-auto pr-2">

              {chatMessages.map(
                (message, index) => (
                  <div
                    key={index}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >

                    <div
                      className={
                        message.role === "user"
                          ? "max-w-[80%] rounded-2xl rounded-br-md bg-[#071739] px-5 py-3 text-sm leading-6 text-white"
                          : "max-w-[80%] rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3 text-sm leading-6 text-slate-700"
                      }
                    >
                      {message.content}
                    </div>

                  </div>
                )
              )}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3 text-sm text-slate-500">
                    Analyzing your admissions data...
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SUGGESTED QUESTIONS */}

          <div className="mt-6 flex flex-wrap gap-2">

            {[
              "What needs attention right now?",
              "Which stage has the most applicants?",
              "What is our biggest bottleneck?",
            ].map((question) => (
              <button
                key={question}
                onClick={() =>
                  askAdmissionsAI(question)
                }
                disabled={
                  chatLoading ||
                  loading
                }
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#123D82] hover:bg-slate-50 disabled:opacity-50"
              >
                {question}
              </button>
            ))}

          </div>

          {/* CHAT INPUT */}

          <div className="mt-4 flex gap-3">

            <input
              value={chatQuestion}
              onChange={(e) =>
                setChatQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  askAdmissionsAI();
                }
              }}
              placeholder="Ask anything about your admissions data..."
              disabled={
                chatLoading ||
                loading
              }
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:border-[#123D82] focus:bg-white"
            />

            <button
              onClick={() =>
                askAdmissionsAI()
              }
              disabled={
                chatLoading ||
                loading ||
                !chatQuestion.trim()
              }
              className="rounded-2xl bg-[#071739] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#123D82] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {chatLoading
                ? "..."
                : "Ask AI"}
            </button>

          </div>

        </div>

        {/* ==========================================
            QUICK NAVIGATION
        ========================================== */}

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