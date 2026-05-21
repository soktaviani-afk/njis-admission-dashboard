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

  const [
    selectedLead,
    setSelectedLead,
  ] = useState<LeadData | null>(
    null
  );

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

  const picOptions = [
    "All PIC",
    ...new Set(
      leads.map(
        (lead) => lead.PIC
      )
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
        lead.PIC === selectedPIC;

      return (
        matchesSearch &&
        matchesPIC
      );
    });

  const convertedLeads =
    filteredLeads.filter(
      (lead) =>
        lead.Converted === "Yes"
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
        ] === "Interested" ||
        lead[
          "Lead Status"
        ] === "Observation"
    ).length;

  const unassignedLeads =
    filteredLeads.filter(
      (lead) =>
        !lead.PIC ||
        lead.PIC === ""
    ).length;

  const sourceData = Object.entries(
    filteredLeads.reduce(
      (
        acc: Record<string, number>,
        lead
      ) => {
        const source =
          lead.Source ||
          "Unknown";

        acc[source] =
          (acc[source] || 0) + 1;

        return acc;
      },
      {}
    )
  ).map(([name, value]) => ({
    name,
    value,
  }));

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
            (acc[pic] || 0) + 1;

          return acc;
        },
        {}
      )
    ).map(([name, value]) => ({
      name,
      value,
    }));

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

        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              Admissions CRM
            </p>

            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-[#071739]">
              Leads Database
            </h1>

            <p className="mt-4 max-w-2xl text-slate-500">
              Centralized lead
              management system for
              admissions sales,
              follow-up tracking, and
              conversion monitoring.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
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
          </div>
        </div>

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
                {filteredLeads.map(
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