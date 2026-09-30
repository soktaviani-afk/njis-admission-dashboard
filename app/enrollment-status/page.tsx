"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";
import Topbar from "@/components/layout/topbar";

import { useEffect, useMemo, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const CHART_COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
];

const STAGE_STYLES: Record<string, string> = {
  Inquiry: "bg-slate-100 text-slate-700",
  Observation: "bg-indigo-100 text-indigo-700",
  "MAP Test": "bg-blue-100 text-blue-700",
  "Documents Pending": "bg-amber-100 text-amber-700",
  Onboarding: "bg-cyan-100 text-cyan-700",
  Accepted: "bg-green-100 text-green-700",
  Enrolled: "bg-emerald-100 text-emerald-700",
};

type EnrollmentStudent = {
  "Student Name": string;
  "Grade Applying": string;
  "Nationality Type": string;
  "Academic Year": string;
  PIC: string;
  "Current Stage": string;
  "Documents Status": string;
  "Payment Type": string;
  "Final Status": string;
  "Onboarding Status": string;

  "Admissions NJIS System": string;
  "NJIS System Waived": string;
  "Acceptance Letter": string;
  "Inform Finance to Invoice": string;
  "Student Data List (SDL) & LS US SDL": string;
  Toddle: string;
  "Emergency Bag": string;
  "Toddle Health": string;
  "Toddle Flags": string;
  "Birthday List": string;
  "Parents Business List": string;
  "Student ID": string;
  "Nationality Flags": string;
  "Scan Documents": string;

  "Last Update": string;
  Notes: string;

  "Enrollment Agreement": string;
  "Media Release Form": string;
  "Birth Certificate": string;
  "Family Registry": string;
  "Parents Passport": string;
  "Parents ID": string;
  "Child Passport": string;
  "Child ID": string;
  KITAS: string;
  "Student Health Card": string;
  Immunization: string;
  "Report Card 3 Years": string;
};

function isComplete(value: string | undefined | null) {
  if (!value) return false;

  const normalized = value.toString().trim().toLowerCase();

  return (
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "complete" ||
    normalized === "completed"
  );
}

function isEmpty(value: string | undefined | null) {
  if (value === null || value === undefined) return true;

  const normalized = value.toString().trim().toLowerCase();

  return normalized === "" || normalized === "-";
}

export default function EnrollmentStatus() {
  const [enrollmentData, setEnrollmentData] = useState<
    EnrollmentStudent[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<EnrollmentStudent | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const response = await fetch(
          "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/MASTER_ENROLLMENT"
        );

        if (!response.ok) {
          throw new Error("Failed fetching enrollment data");
        }

        const data = await response.json();

        setEnrollmentData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Spreadsheet fetch failed:", error);
        setEnrollmentData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    return enrollmentData.filter((student) => {
      const studentName =
        student["Student Name"]?.toString().toLowerCase() || "";

      const search = searchTerm.toLowerCase();

      const matchesSearch = studentName.includes(search);

      const currentYear =
        student["Academic Year"]?.toString().includes("2026");

      return matchesSearch && currentYear;
    });
  }, [enrollmentData, searchTerm]);

  const dashboardStats = useMemo(() => {
    const completed = filteredData.filter(
      (student) => student["Final Status"] === "Completed"
    ).length;

    const pending = filteredData.filter(
      (student) => student["Documents Status"] !== "Complete"
    ).length;

    return {
      total: filteredData.length,
      completed,
      pending,
    };
  }, [filteredData]);

  const stageChartData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredData.forEach((student) => {
      const stage = student["Current Stage"] || "Unknown";

      counts[stage] = (counts[stage] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredData]);

  return (
    <div
      className={`${jakarta.className} flex min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100`}
    >
      <Sidebar />

      <main className="flex-1 p-8 lg:p-10">
        <Topbar
          title="Enrollment Status"
          subtitle="Live tracking for Academic Year 2026/2027 enrollment pipeline and onboarding progress."
        />

        <div className="mt-6 flex justify-end">
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-[#071739] shadow-sm outline-none transition focus:border-blue-400"
          />
        </div>

        {/* KPI */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[28px] bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              title="Total Applicants"
              value={String(dashboardStats.total)}
            />

            <StatCard
              title="Completed"
              value={String(dashboardStats.completed)}
            />

            <StatCard
              title="Pending Documents"
              value={String(dashboardStats.pending)}
            />
          </div>
        )}

        {/* CHART */}
        <section className="mt-10 rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h3 className="text-3xl font-extrabold text-[#071739]">
            Enrollment Stages
          </h3>

          <p className="mt-2 text-slate-500">
            Distribution of applicants by current stage.
          </p>

          <div className="mt-10 h-[350px] w-full">
            {stageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={70}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {stageChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          CHART_COLORS[
                            index % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No enrollment stage data available.
              </div>
            )}
          </div>
        </section>

        {/* TABLE */}
        <section className="mt-12 rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h3 className="text-3xl font-extrabold text-[#071739]">
            Enrollment Records
          </h3>

          <p className="mt-2 text-slate-500">
            Click a student to view detailed enrollment progress and ask AI
            questions.
          </p>

          <div className="mt-8 overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-left text-slate-500">
                  <th className="px-5 py-4 font-bold">
                    Student Name
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Grade
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Nationality
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Payment
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Stage
                  </th>

                  <th className="px-5 py-4 font-bold">
                    PIC
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((student, index) => (
                  <tr
                    key={`${student["Student Name"]}-${index}`}
                    onClick={() => setSelectedStudent(student)}
                    className="group cursor-pointer border-b border-slate-100 bg-white/80 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50"
                  >
                    <td className="px-5 py-5 text-base font-bold text-[#071739]">
                      {student["Student Name"] || "-"}
                    </td>

                    <td className="px-5 py-5 font-medium text-slate-700">
                      {student["Grade Applying"] || "-"}
                    </td>

                    <td className="px-5 py-5 font-medium text-slate-700">
                      {student["Nationality Type"] || "-"}
                    </td>

                    <td className="px-5 py-5 font-medium text-slate-700">
                      {student["Payment Type"] || "-"}
                    </td>

                    <td className="px-5 py-5 font-medium text-slate-700">
                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-bold shadow-sm ${
                          STAGE_STYLES[
                            student["Current Stage"]
                          ] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {student["Current Stage"] || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-5 font-medium text-slate-700">
                      {student["PIC"] || "-"}
                    </td>
                  </tr>
                ))}

                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* STUDENT MODAL */}
        {selectedStudent && (
          <StudentModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </main>
    </div>
  );
}

function StudentModal({
  student,
  onClose,
}: {
  student: EnrollmentStudent;
  onClose: () => void;
}) {
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const requiredDocs =
    student["Nationality Type"] === "WNA"
      ? [
          "Parents Passport",
          "Child Passport",
          "Birth Certificate",
          "Enrollment Agreement",
        ]
      : [
          "Parents ID",
          "Birth Certificate",
          "Enrollment Agreement",
        ];

  const optionalDocs = [
    "Media Release Form",
    "Family Registry",
    "Child ID",
    "KITAS",
    "Student Health Card",
    "Immunization",
    "Report Card 3 Years",
  ];

  const onboardingItems = [
    "Admissions NJIS System",
    "NJIS System Waived",
    "Acceptance Letter",
    "Inform Finance to Invoice",
    "Student Data List (SDL) & LS US SDL",
    "Toddle",
    "Emergency Bag",
    "Toddle Health",
    "Toddle Flags",
    "Birthday List",
    "Parents Business List",
    "Student ID",
    "Nationality Flags",
    "Scan Documents",
  ];

  const completedRequired = requiredDocs.filter((doc) => {
    const value = student[doc as keyof EnrollmentStudent];

    return isComplete(value);
  }).length;

  const progress =
    requiredDocs.length > 0
      ? Math.round(
          (completedRequired / requiredDocs.length) * 100
        )
      : 0;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  async function askEnrollmentAI() {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiError("");
    setAiAnswer("");

    try {
      const response = await fetch("/api/enrollment-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: aiQuestion,
          student,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to get AI response."
        );
      }

      setAiAnswer(data.answer || "Information unavailable.");
    } catch (error) {
      console.error("Enrollment AI request failed:", error);

      setAiError(
        "AI is temporarily unavailable. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  }

  function handleQuestionKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askEnrollmentAI();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[36px] bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
              Student Detail
            </p>

            <h2 className="mt-3 text-4xl font-extrabold text-[#071739] md:text-5xl">
              {student["Student Name"] || "Unnamed Student"}
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              {student["Grade Applying"] || "-"} •{" "}
              {student["Nationality Type"] || "-"} •{" "}
              {student["Current Stage"] || "-"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {/* AI ASSISTANT */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-sm">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071739] text-xl text-white shadow-lg">
                ✦
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Enrollment AI
                </p>

                <h3 className="mt-1 text-2xl font-extrabold text-[#071739]">
                  Ask about this student
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Ask questions about documents, enrollment progress,
                  onboarding, status, or anything recorded in this student
                  profile.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "What is still pending?",
                "Summarize this student.",
                "Which documents are incomplete?",
                "What is the current enrollment stage?",
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => setAiQuestion(question)}
                  className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={handleQuestionKeyDown}
                placeholder="Ask something about this student..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-[#071739] shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  Press Enter to ask • Shift + Enter for a new line
                </p>

                <button
                  onClick={askEnrollmentAI}
                  disabled={
                    aiLoading || !aiQuestion.trim()
                  }
                  className="rounded-2xl bg-[#071739] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </button>
              </div>
            </div>

            {aiError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {aiError}
              </div>
            )}

            {aiAnswer && (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                    AI Response
                  </p>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {aiAnswer}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PROGRESS */}
        <div className="mt-10 rounded-[28px] bg-slate-50 p-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                Enrollment Progress
              </p>

              <h3 className="mt-2 text-2xl font-extrabold text-[#071739]">
                Required Documents
              </h3>
            </div>

            <div className="text-right">
              <p className="text-5xl font-extrabold text-green-600">
                {progress}%
              </p>
            </div>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* OVERVIEW */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            title="Nationality"
            value={student["Nationality Type"]}
          />

          <DetailCard
            title="Payment Type"
            value={student["Payment Type"]}
          />

          <DetailCard
            title="Final Status"
            value={student["Final Status"]}
          />

          <DetailCard
            title="PIC"
            value={student["PIC"]}
          />
        </div>

        {/* REQUIRED DOCUMENTS */}
        <SectionTitle title="Required Documents" />

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {requiredDocs.map((doc) => {
            const value =
              student[doc as keyof EnrollmentStudent];

            return (
              <StatusCard
                key={doc}
                title={doc}
                completed={isComplete(value)}
                neutral={false}
              />
            );
          })}
        </div>

        {/* OPTIONAL DOCUMENTS */}
        <SectionTitle title="Optional Documents" />

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {optionalDocs.map((doc) => {
            const value =
              student[doc as keyof EnrollmentStudent];

            return (
              <StatusCard
                key={doc}
                title={doc}
                completed={isComplete(value)}
                neutral={isEmpty(value)}
              />
            );
          })}
        </div>

        {/* ONBOARDING */}
        <SectionTitle title="Onboarding Progress" />

        <div className="mt-6 rounded-2xl bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
            Onboarding Status
          </p>

          <p className="mt-2 text-xl font-extrabold text-blue-700">
            {student["Onboarding Status"] || "Information unavailable."}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {onboardingItems.map((item) => {
            const value =
              student[item as keyof EnrollmentStudent];

            return (
              <StatusCard
                key={item}
                title={item}
                completed={isComplete(value)}
                neutral={isEmpty(value)}
              />
            );
          })}
        </div>

        {/* NOTES */}
        <SectionTitle title="Notes" />

        <div className="mt-6 rounded-[28px] bg-slate-50 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailCard
              title="Last Update"
              value={student["Last Update"]}
            />

            <DetailCard
              title="Current Stage"
              value={student["Current Stage"]}
            />
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Notes
            </p>

            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {student["Notes"] || "No notes available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mt-14">
      <h3 className="text-3xl font-extrabold text-[#071739]">
        {title}
      </h3>
    </div>
  );
}

function DetailCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <p className="mt-4 text-lg font-extrabold text-[#071739]">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusCard({
  title,
  completed,
  neutral,
}: {
  title: string;
  completed: boolean;
  neutral: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        completed
          ? "border-green-200 bg-green-50"
          : neutral
          ? "border-slate-200 bg-slate-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-[#071739]">
            {title}
          </h4>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${
            completed
              ? "bg-green-100 text-green-700"
              : neutral
              ? "bg-slate-200 text-slate-500"
              : "bg-red-100 text-red-700"
          }`}
        >
          {completed ? "✓" : neutral ? "—" : "✕"}
        </div>
      </div>
    </div>
  );
}