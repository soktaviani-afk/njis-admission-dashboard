"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import Link from "next/link";

const menuItems = [
  {
    name: "Student Exit Analysis",
    path: "/student-exit",
  },
  {
    name: "Enrollment Status",
    path: "/enrollment-status",
  },
];
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type StudentExit = {
  "Student ID": string;
  "Student Name": string;
  "Grade Level": string;
  "Academic Year": string;
  "Exit Date": string;
  "Reason for Leaving": string;
  "Destination School": string;
  Notes: string;
};

const REASON_COLORS: Record<string, string> = {
  "Not happy with our program": "#DC2626", // red
  Relocation: "#2563EB", // blue
  "Prefer non IB curriculum": "#F59E0B", // amber
  "Bigger Community": "#10B981", // green
  "Wants a religion based school": "#7C3AED", // purple
  "Graduates": "#0EA5E9", // sky blue
  "Price Sensitive": "#EC4899", // pink
};

export default function Home() {
  const [exitData, setExitData] = useState<StudentExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] =
    useState("All Years");



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
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const academicYears = [
    "All Years",
    ...new Set(
      exitData.map(
        (student) =>
          student["Academic Year"]
      )
    ),
  ];

  const filteredData =
    selectedYear === "All Years"
      ? exitData
      : exitData.filter(
          (student) =>
            student["Academic Year"] ===
            selectedYear
        );

  const gradeData = Object.entries(
    filteredData.reduce(
      (acc: any, student: any) => {
        const grade =
          student["Grade Level"] ||
          "Unknown";

        acc[grade] =
          (acc[grade] || 0) + 1;

        return acc;
      },
      {}
    )
  );

  const mostAffectedGrade =
    gradeData.sort(
      (a: any, b: any) => b[1] - a[1]
    )[0]?.[0] || "-";

  const reasonData = Object.entries(
    filteredData.reduce(
      (acc: any, student: any) => {
        const reason =
          student["Reason for Leaving"] ||
          "Unknown";

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
const totalExits = filteredData.length;

const topReason =
  [...reasonData].sort(
    (a: any, b: any) => b.value - a.value
  )[0]?.name || "-";

const retentionRate = (
  100 -
  (totalExits /
    (totalExits + 1200)) *
    100
).toFixed(1);
  return (
    <div
      className={`${jakarta.className} min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex relative overflow-hidden`}
    >
      {/* Background Glow */}
      <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-blue-200 blur-3xl opacity-20" />

      <div className="absolute left-20 top-40 h-[250px] w-[250px] rounded-full bg-slate-300 blur-3xl opacity-20" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-[#071739] text-white p-6 border-r border-white/10 shadow-2xl z-10">
        <div className="flex items-center gap-4">
          <Image
            src="/njis-logo.png"
            alt="NJIS Logo"
            width={52}
            height={52}
            className="rounded-xl bg-white p-2"
          />

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              NJIS
            </h1>

            <p className="text-sm text-slate-300">
              Admissions Dashboard
            </p>
          </div>
        </div>

<nav className="mt-12 space-y-3">
  {menuItems.map((item, index) => (
    <Link
      key={index}
      href={item.path}
      className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
        item.name ===
        "Student Exit Analysis"
          ? "bg-white text-[#071739] shadow-xl"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {item.name}
    </Link>
  ))}
</nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-10 z-10">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              Admissions & Marketing Dashboard
            </p>

            <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-[#071739]">
              Student Exit Analysis
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
              Monitor student exit trends and
              retention insights with live
              spreadsheet integration.
            </p>
          </div>

          <div>
            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-lg outline-none transition focus:border-blue-500"
            >
              {academicYears.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
          title="Total Exits"
          value={String(totalExits)}
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
          value={mostAffectedGrade}
          />
          </div>

        {/* Analytics Section */}
        <section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Pie Chart */}
          <div className="xl:col-span-2 rounded-[32px] border border-white bg-white/90 backdrop-blur-sm p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
            <h3 className="text-3xl font-bold text-[#071739]">
              Exit Reasons Analytics
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Distribution of student
              exits by reason.
            </p>

            <div className="mt-8 flex flex-col items-center">
              <PieChart
                width={550}
                height={450}
              >
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  outerRadius={160}
                  innerRadius={70}
                  dataKey="value"
                  paddingAngle={4}
                  labelLine={false}
                  label={({
                    percent,
                  }: any) =>
                    `${(
                      (percent || 0) * 100
                    ).toFixed(0)}%`
                  }
                >
                  {reasonData.map(
                    (
                      entry: any,
                      index: number
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          REASON_COLORS[
                            entry.name.trim()
                          ] ||
                          "#94A3B8"
                        }
                        stroke="#fff"
                        strokeWidth={4}
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  formatter={(
                    value: any
                  ) => [
                    `${value} Students`,
                    "Total",
                  ]}
                />
              </PieChart>

              <div className="mt-2 flex flex-wrap justify-center gap-6">
                {reasonData.map(
                  (
                    item: any,
                    index: number
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

          {/* Summary */}
          <div className="rounded-[32px] border border-white bg-white/90 backdrop-blur-sm p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
            <h3 className="text-3xl font-bold text-[#071739]">
              Exit Summary
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Student exit overview.
            </p>

            <div className="mt-8 space-y-4">
              {reasonData.map(
                (
                  item: any,
                  index: number
                ) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              REASON_COLORS[
                                item.name.trim()
                              ] ||
                              "#94A3B8",
                          }}
                        />

                        <p className="font-semibold text-[#071739]">
                          {item.name}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {item.value}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                      {(
                        (item.value /
                          filteredData.length) *
                        100
                      ).toFixed(1)}
                      % of total exits
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="mt-10 rounded-[32px] border border-white bg-white/90 backdrop-blur-sm p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-3xl font-bold text-[#071739]">
                Student Exit Records
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Live spreadsheet synced
                records.
              </p>
            </div>

            <div className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
              Live Spreadsheet Connected
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-4 font-bold">
                    Student Name
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Grade Level
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Academic Year
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Reason
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-slate-400"
                    >
                      Loading spreadsheet
                      data...
                    </td>
                  </tr>
                ) : filteredData.length >
                  0 ? (
                  filteredData.map(
                    (
                      student: any,
                      index: number
                    ) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 transition-colors duration-200 hover:bg-blue-50/40"
                      >
                        {Object.values(
                          student
                        ).map(
                          (
                            value: any,
                            i: number
                          ) => (
                            <td
                              key={i}
                              className="px-5 py-4 text-[#071739]"
                            >
                              {value ||
                                "-"}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-slate-400"
                    >
                      No student exit data
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-white bg-white/90 backdrop-blur-sm p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3 className="mt-4 text-4xl font-extrabold tracking-tight text-[#071739]">
        {value}
      </h3>
    </div>
  );
}