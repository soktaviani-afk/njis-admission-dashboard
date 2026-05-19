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
      
      {/* Needs Attention */}
{filteredData.filter(
  (student) =>
    student[
      "Documents Status"
    ] !== "Complete" ||
    student[
      "Onboarding Status"
    ] !== "Complete"
).length > 0 && (
  <section className="mt-10 rounded-[32px] border border-red-100 bg-red-50/60 p-8 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-red-700">
          Needs Attention
        </h3>

        <p className="mt-2 text-sm text-red-500">
          Students with incomplete
          documents or onboarding.
        </p>
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {filteredData
        .filter(
          (student) =>
            student[
              "Documents Status"
            ] !== "Complete" ||
            student[
              "Onboarding Status"
            ] !== "Complete"
        )
        .slice(0, 4)
        .map((student, index) => (
          <div
            key={index}
            onClick={() =>
              setSelectedStudent(
                student
              )
            }
            className="cursor-pointer rounded-2xl border border-red-100 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#071739]">
                  {
                    student[
                      "Student Name"
                    ]
                  }
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Grade{" "}
                  {
                    student[
                      "Grade Applying"
                    ]
                  }
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  STAGE_STYLES[
                    student[
                      "Current Stage"
                    ]
                  ] ||
                  "bg-slate-100 text-slate-600"
                }`}
              >
                {
                  student[
                    "Current Stage"
                  ]
                }
              </span>
            </div>
          </div>
        ))}
    </div>
  </section>
)}

{/* Enrollment Table */}
<section className="mt-10 rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h3 className="text-3xl font-bold text-[#071739]">
        Enrollment Records
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Live spreadsheet synced
        enrollment records.
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
            Current Stage
          </th>

          <th className="px-5 py-4 font-bold">
            Documents
          </th>

          <th className="px-5 py-4 font-bold">
            Onboarding
          </th>

          <th className="px-5 py-4 font-bold">
            PIC
          </th>
        </tr>
      </thead>

      <tbody>
        {filteredData.map(
          (student, index) => (
            <tr
              key={index}
              onClick={() =>
                setSelectedStudent(
                  student
                )
              }
              className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50"
            >
              <td className="px-5 py-4 font-medium text-[#071739]">
                {
                  student[
                    "Student Name"
                  ]
                }
              </td>

              <td className="px-5 py-4">
                {
                  student[
                    "Grade Applying"
                  ]
                }
              </td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    STAGE_STYLES[
                      student[
                        "Current Stage"
                      ]
                    ]
                  }`}
                >
                  {
                    student[
                      "Current Stage"
                    ]
                  }
                </span>
              </td>

              <td className="px-5 py-4">
                {
                  student[
                    "Documents Status"
                  ]
                }
              </td>

              <td className="px-5 py-4">
                {
                  student[
                    "Onboarding Status"
                  ]
                }
              </td>

              <td className="px-5 py-4">
                {student["PIC"]}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
</section>

{/* Student Detail Modal */}
{selectedStudent && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    onClick={() =>
      setSelectedStudent(null)
    }
  >
    <div
      className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl"
      onClick={(e) =>
        e.stopPropagation()
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#071739]">
            {
              selectedStudent[
                "Student Name"
              ]
            }
          </h2>

          <p className="mt-2 text-slate-500">
            Grade{" "}
            {
              selectedStudent[
                "Grade Applying"
              ]
            }
          </p>
        </div>

        <button
          onClick={() =>
            setSelectedStudent(null)
          }
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600"
        >
          Close
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <DetailCard
          title="Current Stage"
          value={
            selectedStudent[
              "Current Stage"
            ]
          }
        />

        <DetailCard
          title="Documents"
          value={
            selectedStudent[
              "Documents Status"
            ]
          }
        />

        <DetailCard
          title="Onboarding"
          value={
            selectedStudent[
              "Onboarding Status"
            ]
          }
        />

        <DetailCard
          title="PIC"
          value={
            selectedStudent["PIC"]
          }
        />
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
          Notes
        </p>

        <p className="mt-3 text-sm text-slate-600">
          {selectedStudent[
            "Notes"
          ] || "No notes available."}
        </p>
      </div>
    </div>
  </div>
)}
      </main>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-sm font-semibold text-[#071739]">
        {value || "-"}
      </p>
    </div>
  );
}