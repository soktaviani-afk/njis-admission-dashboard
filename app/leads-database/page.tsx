"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type LeadData = {
  Timestamp: string;
  Source: string;
  "Child Name": string;
  "Date of Birth": string;
  Gender: string;
  Nationality: string;
  "Current School": string;
  "Current Grade": string;
  "Grade to Enroll": string;
  "Mother's Name": string;
  "Mother's Email": string;
  "Mother's Mobile Phone": string;
  "Father's Name": string;
  "Father's Email": string;
  "Father's Mobile Phone": string;
  PIC: string;
  "Lead Status": string;
  Converted: string;
  "AC Year": string;
  Reasons: string;
};

const SOURCE_COLORS = [
  "#2563EB",
  "#06B6D4",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#EF4444",
];

const STATUS_STYLES: Record<string, string> = {
  "New Inquiry": "bg-blue-100 text-blue-700",
  "Follow Up": "bg-amber-100 text-amber-700",
  Interested: "bg-green-100 text-green-700",
  Observation: "bg-cyan-100 text-cyan-700",
  "No Response": "bg-red-100 text-red-700",
  Enrolled: "bg-emerald-100 text-emerald-700",
  Lost: "bg-slate-200 text-slate-700",
};

export default function LeadsDatabase() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedPIC, setSelectedPIC] = useState("All PIC");
  const [selectedYear, setSelectedYear] = useState("All Years");

  const [selectedLead, setSelectedLead] =
    useState<LeadData | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function askLeadAI(question?: string) {
    const finalQuestion =
      question || aiQuestion.trim();

    if (!finalQuestion) return;

    try {
      setAiLoading(true);
      setAiError("");
      setAiAnswer("");

      const response = await fetch(
        "/api/leads-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: finalQuestion,
            leads: filteredLeads,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to generate AI response."
        );
      }

      setAiAnswer(
        data.answer ||
          "Information unavailable."
      );
    } catch (error) {
      console.error(
        "Lead AI request failed:",
        error
      );

      setAiError(
        "The AI service is temporarily unavailable. Please try again shortly."
      );
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch(
          "https://opensheet.elk.sh/1Oa4Jrpwz7C4YDbtL8ztMT4NzZ9JLpiHz26ZLtQewyLU/INQUIRY%20FORM"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch leads."
          );
        }

        const data =
          await response.json();

        setLeads(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed fetching leads:",
          error
        );

        setLeads([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();

    const interval = setInterval(
      fetchLeads,
      60000
    );

    return () =>
      clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedPIC,
    selectedYear,
    itemsPerPage,
  ]);

  const picOptions = useMemo(() => {
    const values = leads
      .map((lead) => lead.PIC)
      .filter(Boolean);

    return [
      "All PIC",
      ...Array.from(new Set(values)),
    ];
  }, [leads]);

  const yearOptions = useMemo(() => {
    const years = leads
      .map((lead) => {
        const date = new Date(
          lead.Timestamp
        );

        return Number.isNaN(
          date.getTime()
        )
          ? ""
          : date
              .getFullYear()
              .toString();
      })
      .filter(Boolean);

    return [
      "All Years",
      ...Array.from(new Set(years)),
    ];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return leads.filter((lead) => {
      const childName =
        lead["Child Name"]
          ?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        childName.includes(query);

      const matchesPIC =
        selectedPIC === "All PIC" ||
        lead.PIC === selectedPIC;

      const date = new Date(
        lead.Timestamp
      );

      const leadYear =
        Number.isNaN(date.getTime())
          ? ""
          : date
              .getFullYear()
              .toString();

      const matchesYear =
        selectedYear === "All Years" ||
        leadYear === selectedYear;

      return (
        matchesSearch &&
        matchesPIC &&
        matchesYear
      );
    });
  }, [
    leads,
    search,
    selectedPIC,
    selectedYear,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLeads.length /
        itemsPerPage
    )
  );

  const indexOfLastLead =
    currentPage * itemsPerPage;

  const indexOfFirstLead =
    indexOfLastLead -
    itemsPerPage;

  const currentLeads =
    filteredLeads.slice(
      indexOfFirstLead,
      indexOfLastLead
    );

  const convertedLeads =
    filteredLeads.filter(
      (lead) =>
        String(lead.Converted)
          .toLowerCase() === "yes"
    ).length;

  const conversionRate =
    filteredLeads.length > 0
      ? (
          (convertedLeads /
            filteredLeads.length) *
          100
        ).toFixed(1)
      : "0.0";

  const hotLeads =
    filteredLeads.filter(
      (lead) =>
        lead["Lead Status"] ===
          "Interested" ||
        lead["Lead Status"] ===
          "Observation"
    ).length;

  const unassignedLeads =
    filteredLeads.filter(
      (lead) =>
        !lead.PIC ||
        lead.PIC.trim() === ""
    ).length;

  const sourceData = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {};

    filteredLeads.forEach((lead) => {
      const source =
        lead.Source || "Unknown";

      counts[source] =
        (counts[source] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) => b.value - a.value
      );
  }, [filteredLeads]);

  const picPerformance = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {};

    filteredLeads.forEach((lead) => {
      const pic =
        lead.PIC || "Unassigned";

      counts[pic] =
        (counts[pic] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) => b.value - a.value
      );
  }, [filteredLeads]);

  function getDaysSince(
    timestamp: string
  ) {
    const created =
      new Date(timestamp);

    if (
      Number.isNaN(
        created.getTime()
      )
    ) {
      return 0;
    }

    const today = new Date();

    const diff =
      today.getTime() -
      created.getTime();

    return Math.max(
      0,
      Math.floor(
        diff /
          (1000 *
            60 *
            60 *
            24)
      )
    );
  }

  function getPriority(
    days: number
  ) {
    if (days >= 7) {
      return {
        label: "Critical",
        style:
          "bg-red-100 text-red-700",
      };
    }

    if (days >= 3) {
      return {
        label: "Warning",
        style:
          "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "Fresh",
      style:
        "bg-green-100 text-green-700",
    };
  }

  const priorityLeads =
    filteredLeads
      .filter(
        (lead) =>
          getDaysSince(
            lead.Timestamp
          ) >= 3
      )
      .sort(
        (a, b) =>
          getDaysSince(
            b.Timestamp
          ) -
          getDaysSince(
            a.Timestamp
          )
      )
      .slice(0, 6);

  return (
    <div
      className={`${jakarta.className} flex h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100`}
    >
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3 lg:p-4">
        {/* HEADER */}
        <div className="shrink-0">
          <Topbar
            title="Leads Database"
            subtitle="Centralized lead management system for admissions sales, follow-up tracking, and conversion monitoring."
          />

          {/* FILTERS */}
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <input
              type="text"
              placeholder="Search lead..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="h-8 w-48 rounded-lg border border-slate-200 bg-white px-3 text-xs text-[#071739] shadow-sm outline-none focus:border-blue-500"
            />

            <select
              value={selectedPIC}
              onChange={(e) =>
                setSelectedPIC(
                  e.target.value
                )
              }
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#071739] shadow-sm outline-none focus:border-blue-500"
            >
              {picOptions.map(
                (pic) => (
                  <option
                    key={pic}
                    value={pic}
                  >
                    {pic}
                  </option>
                )
              )}
            </select>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#071739] shadow-sm outline-none focus:border-blue-500"
            >
              {yearOptions.map(
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

        {/* AI ASSISTANT */}
        <section className="mt-2 shrink-0 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-blue-600">
                  AI Sales Assistant
                </p>

                <h3 className="mt-0.5 text-lg font-extrabold text-[#071739]">
                  Ask your leads
                </h3>
              </div>

              <p className="hidden max-w-xl text-right text-[10px] text-slate-500 xl:block">
                Ask about follow-ups,
                lead sources, PIC
                performance, and
                conversion.
              </p>
            </div>

            <div className="flex gap-2">
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
                    askLeadAI();
                  }
                }}
                placeholder="Ask: Which leads need follow-up?"
                className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-[#071739] shadow-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={() =>
                  askLeadAI()
                }
                disabled={
                  aiLoading ||
                  !aiQuestion.trim()
                }
                className="h-8 rounded-lg bg-[#071739] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading
                  ? "Thinking..."
                  : "Ask AI"}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "Which leads need follow-up?",
                "Which leads have been idle the longest?",
                "Which source has the best conversion?",
                "Summarize our current leads.",
              ].map(
                (question) => (
                  <button
                    key={question}
                    onClick={() =>
                      askLeadAI(
                        question
                      )
                    }
                    disabled={aiLoading}
                    className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[9px] font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                  >
                    {question}
                  </button>
                )
              )}
            </div>

            {aiError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
                {aiError}
              </div>
            )}

            {aiAnswer && (
              <div className="max-h-24 overflow-y-auto rounded-lg border border-blue-100 bg-white px-3 py-2 shadow-sm">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">
                  AI Response
                </p>

                <div className="mt-1 whitespace-pre-line text-[11px] leading-5 text-slate-700">
                  {aiAnswer}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* KPI */}
        <section className="mt-2 grid shrink-0 grid-cols-5 gap-2">
          <CompactStat
            title="Total Leads"
            value={
              loading
                ? "—"
                : String(
                    filteredLeads.length
                  )
            }
          />

          <CompactStat
            title="Converted"
            value={
              loading
                ? "—"
                : String(
                    convertedLeads
                  )
            }
          />

          <CompactStat
            title="Conversion Rate"
            value={
              loading
                ? "—"
                : `${conversionRate}%`
            }
          />

          <CompactStat
            title="Hot Leads"
            value={
              loading
                ? "—"
                : String(hotLeads)
            }
          />

          <CompactStat
            title="Unassigned"
            value={
              loading
                ? "—"
                : String(
                    unassignedLeads
                  )
            }
          />
        </section>

        {/* ANALYTICS */}
        <section className="mt-2 grid shrink-0 grid-cols-2 gap-2">
          {/* SOURCE */}
          <div className="h-[145px] rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur-xl">
            <h3 className="text-xs font-extrabold text-[#071739]">
              Lead Sources
            </h3>

            <div className="flex h-[115px] items-center justify-center">
              {sourceData.length > 0 ? (
                <PieChart
                  width={220}
                  height={120}
                >
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={42}
                    innerRadius={25}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {sourceData.map(
                      (
                        _,
                        index
                      ) => (
                        <Cell
                          key={index}
                          fill={
                            SOURCE_COLORS[
                              index %
                                SOURCE_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              ) : (
                <span className="text-[10px] text-slate-400">
                  No source data
                </span>
              )}
            </div>
          </div>

          {/* PIC */}
          <div className="h-[145px] rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur-xl">
            <h3 className="text-xs font-extrabold text-[#071739]">
              PIC Performance
            </h3>

            <div className="mt-1 h-[115px]">
              {picPerformance.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      picPerformance
                    }
                    margin={{
                      top: 5,
                      right: 8,
                      left: -25,
                      bottom: 0,
                    }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 8,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 8,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#2563EB"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                  No PIC data
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PRIORITY */}
        <section className="mt-2 shrink-0 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-[#071739]">
                Priority Follow Ups
              </h3>

              <p className="text-[9px] text-slate-400">
                Leads requiring
                attention.
              </p>
            </div>

            <span className="text-[9px] font-bold text-slate-400">
              {priorityLeads.length}{" "}
              priority
            </span>
          </div>

          {priorityLeads.length >
          0 ? (
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {priorityLeads.map(
                (
                  lead,
                  index
                ) => {
                  const days =
                    getDaysSince(
                      lead.Timestamp
                    );

                  const priority =
                    getPriority(days);

                  return (
                    <button
                      key={`${lead["Child Name"]}-${index}`}
                      onClick={() =>
                        setSelectedLead(
                          lead
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white p-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${priority.style}`}
                        >
                          {
                            priority.label
                          }
                        </span>

                        <span className="text-[8px] text-slate-400">
                          {days}d
                        </span>
                      </div>

                      <p className="mt-1 truncate text-[10px] font-extrabold text-[#071739]">
                        {
                          lead[
                            "Child Name"
                          ]
                        }
                      </p>

                      <p className="truncate text-[8px] text-slate-400">
                        PIC:{" "}
                        {lead.PIC ||
                          "Unassigned"}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          ) : (
            <div className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[9px] text-slate-400">
              No priority follow-ups
              right now.
            </div>
          )}
        </section>

        {/* LEADS DATABASE */}
        <section className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur-xl">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#071739]">
                Leads Database
              </h3>

              <p className="text-[9px] text-slate-400">
                Click a lead to view
                full details.
              </p>
            </div>

            <span className="text-[9px] font-semibold text-slate-400">
              {filteredLeads.length}{" "}
              leads
            </span>
          </div>

          {/* TABLE SCROLLS, NOT THE PAGE */}
          <div className="mt-1.5 min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-[10px]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    Child Name
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    Source
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    Grade
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    PIC
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    Days Idle
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-bold">
                    Converted
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-400"
                    >
                      Loading leads...
                    </td>
                  </tr>
                ) : currentLeads.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-400"
                    >
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  currentLeads.map(
                    (
                      lead,
                      index
                    ) => {
                      const days =
                        getDaysSince(
                          lead.Timestamp
                        );

                      return (
                        <tr
                          key={`${lead["Child Name"]}-${index}`}
                          onClick={() =>
                            setSelectedLead(
                              lead
                            )
                          }
                          className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50"
                        >
                          <td className="whitespace-nowrap px-3 py-2 font-bold text-[#071739]">
                            {
                              lead[
                                "Child Name"
                              ]
                            }
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                            {lead.Source ||
                              "-"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                            {
                              lead[
                                "Grade to Enroll"
                              ]
                            }
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                            {lead.PIC ||
                              "-"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${
                                STATUS_STYLES[
                                  lead[
                                    "Lead Status"
                                  ]
                                ] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {
                                lead[
                                  "Lead Status"
                                ]
                              }
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-600">
                            {days}d
                          </td>

                          <td className="whitespace-nowrap px-3 py-2">
                            {String(
                              lead.Converted
                            ).toLowerCase() ===
                            "yes" ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-bold text-green-700">
                                Converted
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-bold text-red-700">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-1.5 flex shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400">
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
                className="h-6 rounded-md border border-slate-200 bg-white px-1.5 text-[9px]"
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

              <span className="text-[9px] text-slate-400">
                entries
              </span>
            </div>

            <div className="flex items-center gap-1">
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
                className="rounded-md border border-slate-200 px-2 py-1 text-[9px] font-semibold disabled:opacity-30"
              >
                Prev
              </button>

              <span className="px-2 text-[9px] font-bold text-slate-500">
                {currentPage} /{" "}
                {totalPages}
              </span>

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
                className="rounded-md border border-slate-200 px-2 py-1 text-[9px] font-semibold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* LEAD MODAL */}
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            onClose={() =>
              setSelectedLead(
                null
              )
            }
          />
        )}
      </main>
    </div>
  );
}

function CompactStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-sm">
      <p className="truncate text-[8px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <p className="mt-0.5 truncate text-xl font-extrabold text-[#071739]">
        {value}
      </p>
    </div>
  );
}

function LeadModal({
  lead,
  onClose,
}: {
  lead: LeadData;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
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
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-blue-600">
              Lead Detail
            </p>

            <h2 className="mt-1 truncate text-3xl font-extrabold text-[#071739]">
              {
                lead[
                  "Child Name"
                ]
              }
            </h2>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {/* BASIC INFORMATION */}
        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3">
          <LeadDetailCard
            title="Source"
            value={lead.Source}
          />

          <LeadDetailCard
            title="PIC"
            value={lead.PIC}
          />

          <LeadDetailCard
            title="Lead Status"
            value={
              lead[
                "Lead Status"
              ]
            }
          />

          <LeadDetailCard
            title="Current School"
            value={
              lead[
                "Current School"
              ]
            }
          />

          <LeadDetailCard
            title="Current Grade"
            value={
              lead[
                "Current Grade"
              ]
            }
          />

          <LeadDetailCard
            title="Grade to Enroll"
            value={
              lead[
                "Grade to Enroll"
              ]
            }
          />

          <LeadDetailCard
            title="Nationality"
            value={
              lead.Nationality
            }
          />

          <LeadDetailCard
            title="Gender"
            value={lead.Gender}
          />

          <LeadDetailCard
            title="Converted"
            value={
              lead.Converted
            }
          />
        </div>

        {/* PARENTS */}
        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-extrabold text-[#071739]">
              Mother Information
            </h3>

            <div className="mt-3 space-y-2">
              <LeadDetailCard
                title="Name"
                value={
                  lead[
                    "Mother's Name"
                  ]
                }
              />

              <LeadDetailCard
                title="Email"
                value={
                  lead[
                    "Mother's Email"
                  ]
                }
              />

              <LeadDetailCard
                title="Phone"
                value={
                  lead[
                    "Mother's Mobile Phone"
                  ]
                }
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-extrabold text-[#071739]">
              Father Information
            </h3>

            <div className="mt-3 space-y-2">
              <LeadDetailCard
                title="Name"
                value={
                  lead[
                    "Father's Name"
                  ]
                }
              />

              <LeadDetailCard
                title="Email"
                value={
                  lead[
                    "Father's Email"
                  ]
                }
              />

              <LeadDetailCard
                title="Phone"
                value={
                  lead[
                    "Father's Mobile Phone"
                  ]
                }
              />
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Reasons / Notes
          </p>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
            {lead.Reasons ||
              "No additional notes."}
          </p>
        </div>
      </div>
    </div>
  );
}

function LeadDetailCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <p className="mt-1 break-words text-xs font-bold text-[#071739]">
        {value || "-"}
      </p>
    </div>
  );
}