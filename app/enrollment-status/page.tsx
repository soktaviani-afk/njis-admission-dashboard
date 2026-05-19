"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import {
  Plus_Jakarta_Sans,
} from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
});

const STAGE_STYLES: Record<
  string,
  string
> = {
  Inquiry:
    "bg-slate-100 text-slate-700",

  Observation:
    "bg-indigo-100 text-indigo-700",

  "MAP Test":
    "bg-blue-100 text-blue-700",

  "Documents Pending":
    "bg-amber-100 text-amber-700",

  Onboarding:
    "bg-cyan-100 text-cyan-700",

  Accepted:
    "bg-green-100 text-green-700",

  "Payment Completed":
    "bg-emerald-100 text-emerald-700",

  Enrolled:
    "bg-emerald-100 text-emerald-700",

  Withdrawn:
    "bg-red-100 text-red-700",
};

const STATUS_STYLES: Record<
  string,
  string
> = {
  Complete:
    "bg-green-100 text-green-700",

  Pending:
    "bg-amber-100 text-amber-700",

  "In Progress":
    "bg-purple-100 text-purple-700",
};

const CHART_COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#EC4899",
];

type EnrollmentStudent = {
  "Student Name": string;
  "Grade Applying": string;
  "Nationality Type": string;
  "Payment Type": string;
  "Academic Year": string;
  "Lead Source": string;

  PIC: string;

  "Current Stage": string;
  "Documents Status": string;
  "Onboarding Status": string;
  "Final Status": string;

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
  "KITAS": string;
  "Student Health Card": string;
  "Immunization Card": string;
  "Report Card 3 Years": string;

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
};

export default function EnrollmentStatus() {
  const [enrollmentData, setEnrollmentData] =
    useState<EnrollmentStudent[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [selectedYear, setSelectedYear] =
    useState("All Years");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedStage, setSelectedStage] =
    useState("All Stages");

  const [selectedStudent, setSelectedStudent] =
    useState<EnrollmentStudent | null>(
      null
    );

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSelectedStudent(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

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
        console.error(
          "Failed to fetch spreadsheet:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  const academicYears = [
    "All Years",

    ...new Set(
      enrollmentData.map(
        (student) =>
          student[
            "Academic Year"
          ]
      )
    ),
  ];

  const stages = [
    "All Stages",

    ...new Set(
      enrollmentData.map(
        (student) =>
          student[
            "Current Stage"
          ]
      )
    ),
  ];

  const filteredData = useMemo(() => {
    return enrollmentData.filter(
      (student) => {
        const matchesYear =
          selectedYear ===
            "All Years" ||
          student[
            "Academic Year"
          ] === selectedYear;

        const matchesSearch =
          student[
            "Student Name"
          ]
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );

        const matchesStage =
          selectedStage ===
            "All Stages" ||
          student[
            "Current Stage"
          ] === selectedStage;

        return (
          matchesYear &&
          matchesSearch &&
          matchesStage
        );
      }
    );
  }, [
    enrollmentData,
    selectedYear,
    searchTerm,
    selectedStage,
  ]);

  const stageChartData = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {};

    filteredData.forEach(
      (student) => {
        const stage =
          student[
            "Current Stage"
          ] || "Unknown";

        counts[stage] =
          (counts[stage] || 0) + 1;
      }
    );

    return Object.entries(counts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [filteredData]);

  const dashboardStats = useMemo(() => {
    const completed =
      filteredData.filter(
        (student) =>
          student[
            "Final Status"
          ] === "Completed"
      ).length;

    const pending =
      filteredData.filter(
        (student) =>
          student[
            "Final Status"
          ] === "Pending"
      ).length;

    const inProgress =
      filteredData.filter(
        (student) =>
          student[
            "Final Status"
          ] === "In Progress"
      ).length;

    return {
      totalApplicants:
        filteredData.length,

      completed,
      pending,
      inProgress,
    };
  }, [filteredData]);

  return (
    <div
      className={`${jakarta.className} min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex relative overflow-hidden`}
    >
      <Sidebar />

      <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-blue-200 blur-3xl opacity-20" />

      <div className="absolute left-20 top-40 h-[250px] w-[250px] rounded-full bg-slate-300 blur-3xl opacity-20" />

      <main className="flex-1 p-8 lg:p-10 z-10">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              Admissions & Marketing
              Dashboard
            </p>

            <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-[#071739]">
              Enrollment Status
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
              Track student admissions,
              documents, and onboarding
              progress in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-[#071739] shadow-lg outline-none transition focus:border-blue-500"
            />

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-lg outline-none transition focus:border-blue-500"
            >
              {academicYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}
            </select>

            <select
              value={selectedStage}
              onChange={(e) =>
                setSelectedStage(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-lg outline-none transition focus:border-blue-500"
            >
              {stages.map((stage) => (
                <option
                  key={stage}
                  value={stage}
                >
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-[28px] bg-slate-200"
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Applicants"
              value={String(
                dashboardStats.totalApplicants
              )}
            />

            <StatCard
              title="Completed"
              value={String(
                dashboardStats.completed
              )}
            />

            <StatCard
              title="Pending"
              value={String(
                dashboardStats.pending
              )}
            />

            <StatCard
              title="In Progress"
              value={String(
                dashboardStats.inProgress
              )}
            />
          </div>
        )}

        {/* Analytics */}
        <section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm xl:col-span-2">
            <h3 className="text-3xl font-bold text-[#071739]">
              Stage Distribution
            </h3>

            <div className="mt-10 flex flex-col items-center">
              <PieChart
                width={320}
                height={320}
              >
                <Pie
                  data={stageChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {stageChartData.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}