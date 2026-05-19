"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Plus_Jakarta_Sans } from "next/font/google";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

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

type StudentExitData = {
  "Student Name": string;
  "Grade Level": string;
  "Academic Year": string;
  "Reason for Leaving": string;
  Notes: string;
};

type ReasonData = {
  name: string;
  value: number;
};

const REASON_COLORS: Record<
  string,
  string
> = {
  "Not happy with our program":
    "#DC2626",

  Relocation: "#2563EB",

  "Prefer non IB curriculum":
    "#F59E0B",

  "Bigger Community":
    "#10B981",

  "Wants a religion based school":
    "#7C3AED",

  Graduates: "#0EA5E9",

  "Price Sensitive":
    "#EC4899",
};

const TOTAL_STUDENTS = 1200;

export default function StudentExit() {
  const router = useRouter();

  const [exitData, setExitData] =
    useState<StudentExitData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedYear, setSelectedYear] =
    useState("All Years");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem(
        "njis-auth"
      );

    if (!isAuthenticated) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchSpreadsheetData() {
      try {
        const res = await fetch(
          "https://opensheet.elk.sh/1fCLWJ4uA3nztHOgxCNuM983QEFPdJn5AJCULPLTmYi4/StudentExitAnalysis"
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setExitData(data);
        } else {
          setExitData([]);
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

    fetchSpreadsheetData();

    const interval = setInterval(() => {
      fetchSpreadsheetData();
    }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  const academicYears = [
    "All Years",

    ...new Set(
      exitData.map(
        (student) =>
          student[
            "Academic Year"
          ]
      )
    ),
  ];

  const filteredData =
    selectedYear === "All Years"
      ? exitData
      : exitData.filter(
          (student) =>
            student[
              "Academic Year"
            ] === selectedYear
        );

  const searchedData =
    filteredData.filter(
      (student) =>
        student[
          "Student Name"
        ]
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const gradeData = Object.entries(
    searchedData.reduce(
      (
        acc: Record<string, number>,
        student
      ) => {
        const grade =
          student[
            "Grade Level"
          ] || "Unknown";

        acc[grade] =
          (acc[grade] || 0) + 1;

        return acc;
      },
      {}
    )
  );

  const mostAffectedGrade =
    [...gradeData].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "-";

  const reasonData: ReasonData[] =
    Object.entries(
      searchedData.reduce(
        (
          acc: Record<string, number>,
          student
        ) => {
          const reason =
            student[
              "Reason for Leaving"
            ] || "Unknown";

          acc[reason] =
            (acc[reason] || 0) + 1;

          return acc;
        },
        {}
      )
    ).map(([name, value]) => ({
      name,
      value,
    }));

  const totalExits =
    searchedData.length;

  const topReason =
    [...reasonData].sort(
      (a, b) => b.value - a.value
    )[0]?.name || "-";

  const retentionRate = (
    100 -
    (totalExits /
      TOTAL_STUDENTS) *
      100
  ).toFixed(1);

  return (
    <div
      className={`${jakarta.className} relative flex min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100`}
    >
      <Sidebar />

      {/* Background Glow */}
      <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-blue-200 opacity-20 blur-3xl" />

      <div className="absolute left-20 top-40 h-[250px] w-[250px] rounded-full bg-slate-300 opacity-20 blur-3xl" />

      {/* Main Content */}
      <main className="z-10 flex-1 p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              Admissions & Marketing
              Dashboard
            </p>

            <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-[#071739]">
              Student Exit Analysis
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
              Monitor student exit
              trends and retention
              insights with live
              spreadsheet integration.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
            />

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
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
          </div>
        </div>

        {/* KPI Cards */}
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
              title="Total Exits"
              value={String(
                totalExits
              )}
            />

            <StatCard
              title="Retention Rate"
              value={`${retentionRate}%`}
            />

            <StatCard
              title="Top Reason"
              value={topReason}
            />

            <StatCard
              title="Most Affected Grade"
              value={`Grade ${mostAffectedGrade}`}
            />
          </div>
        )}

        {/* Analytics */}
        <section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm xl:col-span-2">
            <h3 className="text-3xl font-bold text-[#071739]">
              Exit Reasons
              Analytics
            </h3>

            <div className="mt-10 flex flex-col items-center">
              <PieChart
                width={420}
                height={420}
              >
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  innerRadius={75}
                  dataKey="value"
                >
                  {reasonData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={index}
                        fill={
                          REASON_COLORS[
                            entry.name.trim()
                          ] ||
                          "#94A3B8"
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>

              <div className="mt-8 flex flex-wrap justify-center gap-5">
                {reasonData.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{
                          backgroundColor:
                            REASON_COLORS[
                              item.name.trim()
                            ] ||
                            "#94A3B8",
                        }}
                      />

                      <span className="text-sm font-semibold text-slate-700">
                        {item.name}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}