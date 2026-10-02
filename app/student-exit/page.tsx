"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";
import Topbar from "@/components/layout/topbar";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  weight: ["400", "500", "600", "700", "800"],
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

const REASON_COLORS: Record<string, string> = {
  "Not happy with our program": "#DC2626",
  Relocation: "#2563EB",
  "Prefer non IB curriculum": "#F59E0B",
  "Bigger Community": "#10B981",
  "Wants a religion based school": "#7C3AED",
  Graduates: "#0EA5E9",
  "Price Sensitive": "#EC4899",
};

const TOTAL_STUDENTS = 1200;

export default function StudentExit() {
  const router = useRouter();

  const [exitData, setExitData] = useState<StudentExitData[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] =
    useState("All Years");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [aiQuestion, setAiQuestion] = useState("");

  const [aiAnswer, setAiAnswer] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] = useState("");

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("njis-auth");

    if (!isAuthenticated) {
      router.push("/");
    }
  }, [router]);

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  useEffect(() => {
    async function fetchSpreadsheetData() {
      try {
        setLoading(true);

        const res = await fetch(
          "https://opensheet.elk.sh/1fCLWJ4uA3nztHOgxCNuM983QEFPdJn5AJCULPLTmYi4/StudentExitAnalysis"
        );

        if (!res.ok) {
          throw new Error(
            "Failed to fetch spreadsheet data"
          );
        }

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

        setExitData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSpreadsheetData();

    const interval = setInterval(() => {
      fetchSpreadsheetData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // ACADEMIC YEARS
  // --------------------------------------------------

  const academicYears = useMemo(() => {
    return [
      "All Years",
      ...Array.from(
        new Set(
          exitData
            .map(
              (student) =>
                student["Academic Year"]
            )
            .filter(Boolean)
        )
      ),
    ];
  }, [exitData]);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const searchedData = useMemo(() => {
    return exitData.filter((student) => {
      const matchesYear =
        selectedYear === "All Years" ||
        student["Academic Year"] ===
          selectedYear;

      const matchesSearch =
        student["Student Name"]
          ?.toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesYear &&
        matchesSearch
      );
    });
  }, [
    exitData,
    selectedYear,
    search,
  ]);

  // --------------------------------------------------
  // RESET PAGE WHEN FILTER CHANGES
  // --------------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedYear,
    itemsPerPage,
  ]);

  // --------------------------------------------------
  // ANALYTICS
  // --------------------------------------------------

  const gradeData = useMemo(() => {
    const counts: Record<string, number> = {};

    searchedData.forEach((student) => {
      const grade =
        student["Grade Level"] ||
        "Unknown";

      counts[grade] =
        (counts[grade] || 0) + 1;
    });

    return Object.entries(counts);
  }, [searchedData]);

  const mostAffectedGrade =
    [...gradeData].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "-";

  const reasonData: ReasonData[] =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      searchedData.forEach(
        (student) => {
          const reason =
            student[
              "Reason for Leaving"
            ]?.trim() || "Unknown";

          counts[reason] =
            (counts[reason] || 0) + 1;
        }
      );

      return Object.entries(counts).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    }, [searchedData]);

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

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      searchedData.length /
        itemsPerPage
    )
  );

  const paginatedData = useMemo(() => {
    const start =
      (currentPage - 1) *
      itemsPerPage;

    const end =
      start + itemsPerPage;

    return searchedData.slice(
      start,
      end
    );
  }, [
    searchedData,
    currentPage,
    itemsPerPage,
  ]);

  const startRecord =
    searchedData.length === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endRecord = Math.min(
    currentPage * itemsPerPage,
    searchedData.length
  );

  // --------------------------------------------------
  // AI
  // --------------------------------------------------

  async function askExitAI(
    customQuestion?: string
  ) {
    const question =
      customQuestion ??
      aiQuestion;

    if (!question.trim()) {
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiAnswer("");

      const response = await fetch(
        "/api/student-exit-ai",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
          question,
          exitRecords: searchedData,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to generate AI response."
        );
      }

      setAiAnswer(
        data?.answer ||
          "Information unavailable."
      );

      setAiQuestion(question);
    } catch (error: any) {
      console.error(
        "Student Exit AI error:",
        error
      );

      setAiError(
        error?.message ||
          "Unable to generate AI response. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  }

  const aiSuggestions = [
    "What is the main reason students are leaving?",
    "Which grade has the most exits?",
    "Summarize the current student exit situation.",
    "What patterns can you identify from the exit records?",
  ];

  return (
    <div
      className={`${jakarta.className} relative flex min-h-screen overflow-x-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100`}
    >
      <Sidebar />

      <div className="pointer-events-none absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-blue-200 opacity-20 blur-3xl" />

      <div className="pointer-events-none absolute left-20 top-40 h-[250px] w-[250px] rounded-full bg-slate-300 opacity-20 blur-3xl" />

      <main className="relative z-10 min-w-0 flex-1 p-5 lg:p-7">
        {/* HEADER */}

        <Topbar
          title="Student Exit Analysis"
          subtitle="Comprehensive analytics and insights for student withdrawal and retention monitoring."
        />

        {/* FILTERS */}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="h-10 w-52 rounded-xl border border-slate-200 bg-white px-4 text-xs font-medium text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
          />

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                e.target.value
              )
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
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

        {/* KPI CARDS */}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-[24px] bg-slate-200"
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        {/* AI ASSISTANT */}

        <section className="mt-6 rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-blue-600">
                  AI Student Exit Assistant
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[#071739]">
                  Analyze exit patterns
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Ask questions about
                  student exits, reasons,
                  grades, and patterns.
                </p>
              </div>

              <div className="rounded-xl bg-white/80 px-4 py-3 text-right shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Records Analyzed
                </p>

                <p className="mt-1 text-xl font-extrabold text-blue-700">
                  {searchedData.length}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={aiQuestion}
                onChange={(event) =>
                  setAiQuestion(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    askExitAI();
                  }
                }}
                placeholder="Ask: What is the main reason students are leaving?"
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-xs font-medium text-[#071739] shadow-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={() =>
                  askExitAI()
                }
                disabled={
                  aiLoading ||
                  !aiQuestion.trim()
                }
                className="h-10 rounded-xl bg-[#071739] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading
                  ? "Thinking..."
                  : "Ask AI"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map(
                (question) => (
                  <button
                    key={question}
                    onClick={() =>
                      askExitAI(
                        question
                      )
                    }
                    disabled={
                      aiLoading
                    }
                    className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[9px] font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
                  >
                    {question}
                  </button>
                )
              )}
            </div>

            {aiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {aiError}
              </div>
            )}

            {aiAnswer && (
              <div className="max-h-52 overflow-y-auto rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">
                  AI Response
                </p>

                <div className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-700">
                  {aiAnswer}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ANALYTICS */}

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* EXIT REASONS */}

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-xl xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-[#071739]">
                  Exit Reasons Analytics
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution of student
                  exit reasons across
                  the selected records.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500">
                  Total Exits
                </p>

                <p className="mt-1 text-2xl font-extrabold text-blue-700">
                  {totalExits}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="flex min-h-[320px] items-center justify-center">
                {reasonData.length >
                0 ? (
                  <PieChart
                    width={340}
                    height={320}
                  >
                    <Pie
                      data={
                        reasonData
                      }
                      cx="50%"
                      cy="50%"
                      outerRadius={
                        115
                      }
                      paddingAngle={2}
                      dataKey="value"
                      stroke="white"
                      strokeWidth={
                        2
                      }
                      labelLine={
                        false
                      }
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const RADIAN =
                          Math.PI /
                          180;

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
                                midAngle ||
                                0
                              ) *
                                RADIAN
                            );

                        const y =
                          cy +
                          radius *
                            Math.sin(
                              -(
                                midAngle ||
                                0
                              ) *
                                RADIAN
                            );

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={
                              x >
                              cx
                                ? "start"
                                : "end"
                            }
                            dominantBaseline="central"
                            className="text-[11px] font-bold"
                          >
                            {`${(
                              (percent ||
                                0) *
                              100
                            ).toFixed(
                              0
                            )}%`}
                          </text>
                        );
                      }}
                    >
                      {reasonData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={
                              index
                            }
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

                    <Tooltip
                      formatter={(
                        value
                      ) => [
                        `${value} Students`,
                      ]}
                    />
                  </PieChart>
                ) : (
                  <p className="text-sm text-slate-400">
                    No exit data
                    available.
                  </p>
                )}
              </div>

              <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {[...reasonData]
                  .sort(
                    (a, b) =>
                      b.value -
                      a.value
                  )
                  .map(
                    (
                      item,
                      index
                    ) => {
                      const percentage =
                        totalExits >
                        0
                          ? (
                              (item.value /
                                totalExits) *
                              100
                            ).toFixed(
                              1
                            )
                          : "0";

                      return (
                        <div
                          key={
                            index
                          }
                          className="rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className="h-4 w-4 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    REASON_COLORS[
                                      item.name.trim()
                                    ] ||
                                    "#94A3B8",
                                }}
                              />

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#071739]">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="mt-1 text-[9px] text-slate-400">
                                  Exit Category
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-lg font-extrabold text-[#071739]">
                                {
                                  item.value
                                }
                              </p>

                              <p className="text-[9px] font-semibold text-slate-500">
                                {
                                  percentage
                                }
                                %
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

          {/* SIDE CARDS */}

          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Highest Impact
              </p>

              <h3 className="mt-3 text-2xl font-extrabold leading-tight text-[#071739]">
                {topReason}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Most common reason
                recorded among the
                selected student exit
                records.
              </p>
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-[0_20px_60px_rgba(37,99,235,0.30)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-blue-100">
                Retention Rate
              </p>

              <h3 className="mt-3 text-5xl font-extrabold">
                {retentionRate}%
              </h3>

              <p className="mt-3 text-xs leading-relaxed text-blue-100">
                Calculated against the
                configured total active
                student population.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Most Affected Grade
              </p>

              <h3 className="mt-3 text-3xl font-extrabold text-[#071739]">
                {mostAffectedGrade}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Grade level with the
                highest number of
                recorded exits.
              </p>
            </div>
          </div>
        </section>

        {/* STUDENT EXIT TABLE */}

        <section className="mt-6 rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-[#071739]">
                Student Exit Records
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Live student exit data
                from spreadsheet
                integration.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Showing
              </p>

              <p className="mt-0.5 text-sm font-extrabold text-[#071739]">
                {startRecord}–
                {endRecord} of{" "}
                {searchedData.length}
              </p>
            </div>
          </div>

          {/* TABLE */}

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="whitespace-nowrap px-4 py-3 font-bold">
                    Student Name
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-bold">
                    Grade
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-bold">
                    Academic Year
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-bold">
                    Exit Reason
                  </th>

                  <th className="min-w-[280px] px-4 py-3 font-bold">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-slate-400"
                    >
                      Loading student
                      exit records...
                    </td>
                  </tr>
                ) : paginatedData.length >
                  0 ? (
                  paginatedData.map(
                    (
                      student,
                      index
                    ) => (
                      <tr
                        key={`${student["Student Name"]}-${index}`}
                        className="border-b border-slate-100 transition hover:bg-blue-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-[#071739]">
                          {
                            student[
                              "Student Name"
                            ]
                          }
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {
                            student[
                              "Grade Level"
                            ]
                          }
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {
                            student[
                              "Academic Year"
                            ]
                          }
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex max-w-[240px] rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600">
                            {
                              student[
                                "Reason for Leaving"
                              ]
                            }
                          </span>
                        </td>

                        <td className="max-w-[380px] px-4 py-3 text-slate-600">
                          <div className="line-clamp-2">
                            {student[
                              "Notes"
                            ] || "-"}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-slate-400"
                    >
                      No student exit
                      records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500">
                Show
              </span>

              <select
                value={itemsPerPage}
                onChange={(event) =>
                  setItemsPerPage(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-bold text-[#071739] shadow-sm outline-none focus:border-blue-500"
              >
                <option value={10}>
                  10
                </option>

                <option value={25}>
                  25
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>
              </select>

              <span className="text-[10px] font-semibold text-slate-500">
                entries
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-[#071739] shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>

              <div className="rounded-lg bg-[#071739] px-3 py-1.5 text-[10px] font-extrabold text-white shadow-sm">
                {currentPage} /{" "}
                {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-[#071739] shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}