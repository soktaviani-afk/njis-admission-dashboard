"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";
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

const STATUS_STYLES: Record<
  string,
  string
> = {
  "New Inquiry":
    "bg-blue-100 text-blue-700",

  "Follow Up":
    "bg-amber-100 text-amber-700",

  Interested:
    "bg-green-100 text-green-700",

  Observation:
    "bg-cyan-100 text-cyan-700",

  "No Response":
    "bg-red-100 text-red-700",

  Enrolled:
    "bg-emerald-100 text-emerald-700",

  Lost:
    "bg-slate-200 text-slate-700",
};

export default function LeadsDatabase() {
  const [leads, setLeads] =
    useState<LeadData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedPIC, setSelectedPIC] =
    useState("All PIC");

  const [selectedYear, setSelectedYear] =
    useState("All Years");

  const [
    selectedLead,
    setSelectedLead,
  ] = useState<LeadData | null>(
    null
  );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [
  itemsPerPage,
  setItemsPerPage,
] = useState(10);

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
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion,
          leads: filteredLeads,
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
        const response =
          await fetch(
            "https://opensheet.elk.sh/1Oa4Jrpwz7C4YDbtL8ztMT4NzZ9JLpiHz26ZLtQewyLU/INQUIRY%20FORM"
          );

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
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();

    const interval =
      setInterval(fetchLeads, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  useEffect(() => {
  setCurrentPage(1);
}, [
  search,
  selectedPIC,
  selectedYear,
]);

  const picOptions = [
    "All PIC",
    ...new Set(
      leads.map(
        (lead) => lead.PIC
      )
    ),
  ];

  const yearOptions = [
  "All Years",

  ...new Set(
    leads.map((lead) => {
      const date =
        new Date(
          lead.Timestamp
        );

      return date.getFullYear().toString();
    })
  ),
];

const filteredLeads =
  leads.filter((lead) => {
    const matchesSearch =
      lead[
        "Child Name"
      ]
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchesPIC =
      selectedPIC ===
        "All PIC" ||
      lead.PIC ===
        selectedPIC;

    const leadYear =
      new Date(
        lead.Timestamp
      )
        .getFullYear()
        .toString();

    const matchesYear =
      selectedYear ===
        "All Years" ||
      leadYear ===
        selectedYear;

    return (
      matchesSearch &&
      matchesPIC &&
      matchesYear
    );
  });

// ==============================
// Pagination
// ==============================

const totalPages =
  Math.ceil(
    filteredLeads.length /
      itemsPerPage
  );

const indexOfLastLead =
  currentPage *
  itemsPerPage;

const indexOfFirstLead =
  indexOfLastLead -
  itemsPerPage;

const currentLeads =
  filteredLeads.slice(
    indexOfFirstLead,
    indexOfLastLead
  );

// ==============================
// Dashboard Statistics
// ==============================

const convertedLeads =
  filteredLeads.filter(
    (lead) =>
      lead.Converted ===
      "Yes"
  ).length;

const conversionRate =
  filteredLeads.length > 0
    ? (
        (convertedLeads /
          filteredLeads.length) *
        100
      ).toFixed(1)
    : "0";

const hotLeads =
  filteredLeads.filter(
    (lead) =>
      lead[
        "Lead Status"
      ] ===
        "Interested" ||
      lead[
        "Lead Status"
      ] ===
        "Observation"
  ).length;

const unassignedLeads =
  filteredLeads.filter(
    (lead) =>
      !lead.PIC ||
      lead.PIC === ""
  ).length;

const sourceData =
  Object.entries(
    filteredLeads.reduce(
      (
        acc: Record<
          string,
          number
        >,
        lead
      ) => {
        const source =
          lead.Source ||
          "Unknown";

        acc[source] =
          (acc[source] ||
            0) + 1;

        return acc;
      },
      {}
    )
  ).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

const picPerformance =
  Object.entries(
    filteredLeads.reduce(
      (
        acc: Record<
          string,
          number
        >,
        lead
      ) => {
        const pic =
          lead.PIC ||
          "Unassigned";

        acc[pic] =
          (acc[pic] ||
            0) + 1;

        return acc;
      },
      {}
    )
  ).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  function getDaysSince(
    timestamp: string
  ) {
    const today = new Date();

    const created =
      new Date(timestamp);

    const diff =
      today.getTime() -
      created.getTime();

    return Math.floor(
      diff /
        (1000 *
          60 *
          60 *
          24)
    );
  }

  function getPriority(
    days: number
  ) {
    if (days >= 7)
      return {
        label: "Critical",
        style:
          "bg-red-100 text-red-700",
      };

    if (days >= 3)
      return {
        label: "Warning",
        style:
          "bg-amber-100 text-amber-700",
      };

    return {
      label: "Fresh",
      style:
        "bg-green-100 text-green-700",
    };
  }

  return (
    <div
      className={`${jakarta.className} flex min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100`}
    >
      <Sidebar />

<main className="flex-1 p-8 lg:p-10">

  <Topbar
  title="Leads Database"
  subtitle="Centralized lead management system for admissions sales, follow-up tracking, and conversion monitoring."
/>

<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
  <input
    type="text"
    placeholder="Search lead..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
  />

  <select
    value={selectedPIC}
    onChange={(e) =>
      setSelectedPIC(
        e.target.value
      )
    }
    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
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
  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search lead..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
  />

  {/* PIC */}
  <select
    value={selectedPIC}
    onChange={(e) =>
      setSelectedPIC(
        e.target.value
      )
    }
    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
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

  {/* YEAR */}
  <select
    value={selectedYear}
    onChange={(e) =>
      setSelectedYear(
        e.target.value
      )
    }
    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
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

<section className="mt-8 rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.10)]">
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-600">
        AI Sales Assistant
      </p>

      <h3 className="mt-2 text-3xl font-extrabold text-[#071739]">
        Ask your leads
      </h3>

      <p className="mt-2 max-w-2xl text-slate-500">
        Ask questions about your current filtered leads,
        follow-ups, sources, PIC performance, and conversion.
      </p>
    </div>

    <div className="flex flex-col gap-3 lg:flex-row">
      <input
        type="text"
        value={aiQuestion}
        onChange={(event) =>
          setAiQuestion(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            askLeadAI();
          }
        }}
        placeholder="Ask: Which leads need follow-up?"
        className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-[#071739] shadow-sm outline-none transition focus:border-blue-500"
      />

      <button
        onClick={() => askLeadAI()}
        disabled={
          aiLoading ||
          !aiQuestion.trim()
        }
        className="h-14 rounded-2xl bg-[#071739] px-7 text-sm font-extrabold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {aiLoading
          ? "Thinking..."
          : "Ask AI"}
      </button>
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        "Which leads need follow-up?",
        "Which leads have been idle the longest?",
        "Which source has the best conversion?",
        "Summarize our current leads.",
      ].map((question) => (
        <button
          key={question}
          onClick={() =>
            askLeadAI(question)
          }
          disabled={aiLoading}
          className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>

    {aiError && (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
        {aiError}
      </div>
    )}

    {aiAnswer && (
      <div className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
          AI Response
        </p>

        <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
          {aiAnswer}
        </div>
      </div>
    )}
  </div>
</section>

        {/* KPI */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-[28px] bg-slate-200"
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Total Leads"
              value={String(
                filteredLeads.length
              )}
            />

            <StatCard
              title="Converted"
              value={String(
                convertedLeads
              )}
            />

            <StatCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
            />

            <StatCard
              title="Hot Leads"
              value={String(
                hotLeads
              )}
            />

            <StatCard
              title="Unassigned"
              value={String(
                unassignedLeads
              )}
            />
          </div>
        )}

        {/* Analytics */}
        <section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Source Chart */}
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl">
            <h3 className="text-2xl font-extrabold text-[#071739]">
              Lead Sources
            </h3>

            <div className="mt-8 flex justify-center">
              <PieChart
                width={320}
                height={320}
              >
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  dataKey="value"
                  labelLine={false}
                  label={({
                    percent,
                  }) =>
                    `${(
                      (percent || 0) *
                      100
                    ).toFixed(0)}%`
                  }
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
            </div>
          </div>

          {/* PIC Performance */}
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl xl:col-span-2">
            <h3 className="text-2xl font-extrabold text-[#071739]">
              PIC Performance
            </h3>

            <div className="mt-10 h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    picPerformance
                  }
                >
                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[
                      12,
                      12,
                      0,
                      0,
                    ]}
                    fill="#2563EB"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Priority Alerts */}
        <section className="mt-10 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-extrabold text-[#071739]">
                Priority Follow Ups
              </h3>

              <p className="mt-2 text-slate-500">
                Leads requiring
                immediate attention.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {filteredLeads
              .filter(
                (lead) =>
                  getDaysSince(
                    lead.Timestamp
                  ) >= 3
              )
              .slice(0, 6)
              .map(
                (
                  lead,
                  index
                ) => {
                  const days =
                    getDaysSince(
                      lead.Timestamp
                    );

                  const priority =
                    getPriority(
                      days
                    );

                  return (
                    <div
                      key={index}
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${priority.style}`}
                        >
                          {
                            priority.label
                          }
                        </span>

                        <p className="text-xs text-slate-500">
                          {days} days
                        </p>
                      </div>

                      <h4 className="mt-5 text-xl font-extrabold text-[#071739]">
                        {
                          lead[
                            "Child Name"
                          ]
                        }
                      </h4>

                      <p className="mt-2 text-sm text-slate-500">
                        PIC:{" "}
                        {lead.PIC ||
                          "Unassigned"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Status:{" "}
                        {
                          lead[
                            "Lead Status"
                          ]
                        }
                      </p>
                    </div>
                  );
                }
              )}
          </div>
        </section>

        {/* Leads Table */}
        <section className="mt-10 rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h3 className="text-3xl font-extrabold text-[#071739]">
            Leads Database
          </h3>

          <p className="mt-2 text-slate-500">
            Click lead to view full
            details.
          </p>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-left text-slate-500">
                  <th className="px-5 py-4 font-bold">
                    Child Name
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Source
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Grade
                  </th>

                  <th className="px-5 py-4 font-bold">
                    PIC
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Status
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Days Idle
                  </th>

                  <th className="px-5 py-4 font-bold">
                    Converted
                  </th>
                </tr>
              </thead>

             <tbody>
  {currentLeads.map(
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
                        key={index}
                        onClick={() =>
                          setSelectedLead(
                            lead
                          )
                        }
                        className="cursor-pointer border-b border-slate-100 bg-white transition hover:bg-blue-50"
                      >
                        <td className="px-5 py-5 font-bold text-[#071739]">
                          {
                            lead[
                              "Child Name"
                            ]
                          }
                        </td>

                        <td className="px-5 py-5 text-slate-700">
                          {
                            lead.Source
                          }
                        </td>

                        <td className="px-5 py-5 text-slate-700">
                          {
                            lead[
                              "Grade to Enroll"
                            ]
                          }
                        </td>

                        <td className="px-5 py-5 text-slate-700">
                          {lead.PIC ||
                            "-"}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
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

                        <td className="px-5 py-5 font-semibold text-slate-700">
                          {days} days
                        </td>

                        <td className="px-5 py-5">
                          {lead.Converted ===
                          "Yes" ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              Converted
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
{/* Pagination */}
{totalPages > 1 && (
  <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500">
        Show
      </span>

      <select
        value={itemsPerPage}
        onChange={(event) => {
          setItemsPerPage(
            Number(
              event.target.value
            )
          );

          setCurrentPage(1);
        }}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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

      <span className="text-sm text-slate-500">
        entries
      </span>
    </div>

    <p className="text-sm text-slate-500">
      Showing{" "}
      {filteredLeads.length === 0
        ? 0
        : indexOfFirstLead + 1}
      –
      {Math.min(
        indexOfLastLead,
        filteredLeads.length
      )}{" "}
      of{" "}
      {filteredLeads.length}{" "}
      leads
    </p>

    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          setCurrentPage(
            currentPage - 1
          )
        }
        disabled={
          currentPage === 1
        }
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {Array.from(
        {
          length: totalPages,
        },
        (_, index) => (
          <button
            key={index}
            onClick={() =>
              setCurrentPage(
                index + 1
              )
            }
            className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
              currentPage ===
              index + 1
                ? "bg-[#071739] text-white"
                : "border border-slate-300 bg-white hover:bg-slate-100"
            }`}
          >
            {index + 1}
          </button>
        )
      )}

      <button
        onClick={() =>
          setCurrentPage(
            currentPage + 1
          )
        }
        disabled={
          currentPage ===
          totalPages
        }
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  </div>
)}
        </section>

        {/* MODAL */}
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
      if (
        event.key === "Escape"
      ) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[36px] bg-white p-8 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
              Lead Detail
            </p>

            <h2 className="mt-3 text-5xl font-extrabold text-[#071739]">
              {
                lead[
                  "Child Name"
                ]
              }
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
        </div>

        {/* Parents */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] bg-slate-50 p-6">
            <h3 className="text-2xl font-extrabold text-[#071739]">
              Mother Information
            </h3>

            <div className="mt-6 space-y-4">
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

          <div className="rounded-[28px] bg-slate-50 p-6">
            <h3 className="text-2xl font-extrabold text-[#071739]">
              Father Information
            </h3>

            <div className="mt-6 space-y-4">
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

        {/* Notes */}
        <div className="mt-14 rounded-[28px] bg-slate-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            Reasons / Notes
          </p>

          <p className="mt-4 text-base leading-relaxed text-slate-600">
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