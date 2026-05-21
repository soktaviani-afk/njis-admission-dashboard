"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";
import Topbar from "@/components/layout/topbar";

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
<main className="flex-1 p-8 lg:p-10">

  <Topbar
  title="Student Exit Analysis"
  subtitle="Comprehensive analytics and insights for student withdrawal and retention monitoring."
/>

<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
  {/* Main Analytics */}
  <div className="rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl xl:col-span-2">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-3xl font-extrabold text-[#071739]">
          Exit Reasons Analytics
        </h3>

        <p className="mt-2 text-slate-500">
          Distribution of student
          exit reasons across all
          active records.
        </p>
      </div>

      <div className="rounded-2xl bg-blue-50 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
          Total Exits
        </p>

        <p className="mt-1 text-3xl font-extrabold text-blue-700">
          {totalExits}
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Pie Chart */}
      <div className="flex items-center justify-center">
        <PieChart
          width={380}
          height={380}
        >
          <Pie
  data={reasonData}
  cx="50%"
  cy="50%"
  outerRadius={135}
  innerRadius={78}
  paddingAngle={4}
  dataKey="value"
  stroke="white"
  strokeWidth={3}
  labelLine={false}
  label={({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN =
      Math.PI / 180;

    const radius =
      innerRadius +
      (outerRadius -
        innerRadius) *
        0.55;

const x =
  cx +
  radius *
    Math.cos(
      -(
        midAngle || 0
      ) * RADIAN
    );

const y =
  cy +
  radius *
    Math.sin(
      -(
        midAngle || 0
      ) * RADIAN
    );
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={
          x > cx
            ? "start"
            : "end"
        }
        dominantBaseline="central"
        className="text-[13px] font-bold"
      >
        {`${(
          (percent || 0) * 100
        ).toFixed(0)}%`}
      </text>
    );
  }}
>
  {reasonData.map(
    (entry, index) => (
      <Cell
        key={index}
        fill={
          REASON_COLORS[
            entry.name.trim()
          ] || "#94A3B8"
        }
      />
    )
  )}
</Pie>

          <Tooltip
            formatter={(value) => [
              `${value} Students`,
            ]}
          />
        </PieChart>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        {[...reasonData]
          .sort(
            (a, b) =>
              b.value - a.value
          )
          .map(
            (
              item,
              index
            ) => {
const percentage =
  totalExits > 0
    ? (
        (item.value /
          totalExits) *
        100
      ).toFixed(1)
    : "0";

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor:
                            REASON_COLORS[
                              item.name.trim()
                            ] ||
                            "#94A3B8",
                        }}
                      />

                      <div>
                        <p className="font-bold text-[#071739]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Exit Category
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-[#071739]">
                        {item.value}
                      </p>

                      <p className="text-xs font-semibold text-slate-500">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
      </div>
    </div>
  </div>

  {/* Right Side Cards */}
  <div className="space-y-6">
    <div className="rounded-[32px] border border-white/70 bg-white/80 p-7 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
        Highest Impact
      </p>

      <h3 className="mt-4 text-3xl font-extrabold leading-tight text-[#071739]">
        {topReason}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Most common reason causing
        student exits this academic
        year.
      </p>
    </div>

    <div className="rounded-[32px] bg-gradient-to-br from-blue-600 to-cyan-500 p-7 text-white shadow-[0_25px_80px_rgba(37,99,235,0.35)]">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
        Retention Rate
      </p>

      <h3 className="mt-4 text-6xl font-extrabold">
        {retentionRate}%
      </h3>

      <p className="mt-4 text-sm leading-relaxed text-blue-100">
        Overall student retention
        compared to total active
        student population.
      </p>
    </div>

    <div className="rounded-[32px] border border-white/70 bg-white/80 p-7 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
        Most Affected Grade
      </p>

      <h3 className="mt-4 text-4xl font-extrabold text-[#071739]">
        {mostAffectedGrade}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Grade level with the highest
        number of student exits.
      </p>
    </div>
  </div>
</section>

        {/* Student Exit Table */}
<section className="mt-10 rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-3xl font-bold text-[#071739]">
        Student Exit Records
      </h3>

      <p className="mt-2 text-slate-500">
        Live student exit data from
        spreadsheet integration.
      </p>
    </div>

    <div className="rounded-2xl bg-slate-100 px-5 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Showing
      </p>

      <p className="mt-1 text-lg font-extrabold text-[#071739]">
        {searchedData.length} Records
      </p>
    </div>
  </div>

  <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-100">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
          <th className="px-5 py-4 font-bold">
            Student Name
          </th>

          <th className="px-5 py-4 font-bold">
            Grade
          </th>

          <th className="px-5 py-4 font-bold">
            Academic Year
          </th>

          <th className="px-5 py-4 font-bold">
            Exit Reason
          </th>

          <th className="px-5 py-4 font-bold">
            Notes
          </th>
        </tr>
      </thead>

      <tbody>
        {searchedData.map(
          (student, index) => (
            <tr
              key={index}
              className="border-b border-slate-100 transition hover:bg-blue-50"
            >
              <td className="px-5 py-4 font-bold text-[#071739]">
                {
                  student[
                    "Student Name"
                  ]
                }
              </td>

              <td className="px-5 py-4 text-slate-700">
                {
                  student[
                    "Grade Level"
                  ]
                }
              </td>

              <td className="px-5 py-4 text-slate-700">
                {
                  student[
                    "Academic Year"
                  ]
                }
              </td>

              <td className="px-5 py-4">
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  {
                    student[
                      "Reason for Leaving"
                    ]
                  }
                </span>
              </td>

              <td className="max-w-[300px] px-5 py-4 text-slate-600">
                {student["Notes"] ||
                  "-"}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
</section>

      </main>
    </div>
  );
}