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

const CHART_COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
];

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

  Enrolled:
    "bg-emerald-100 text-emerald-700",
};

type EnrollmentStudent = {
  "Student Name": string;
  "Grade Applying": string;
  "Nationality Type": string;
  "Payment Type": string;
  "Academic Year": string;
  PIC: string;
  "Current Stage": string;
  "Documents Status": string;
  "Onboarding Status": string;
  "Final Status": string;
  Notes: string;

  "Enrollment Agreement": string;
  "Birth Certificate": string;
  "Parents Passport": string;
  "Child Passport": string;
  "Parents ID": string;
};

export default function EnrollmentStatus() {
  const [enrollmentData, setEnrollmentData] =
    useState<EnrollmentStudent[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<EnrollmentStudent | null>(
      null
    );

  useEffect(() => {
    async function fetchData() {
      try {
        const masterRes =
          await fetch(
            "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/MASTER_ENROLLMENT"
          );

        const systemRes =
          await fetch(
            "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/NJIS%20Enrollment%20System"
          );

        const masterData =
          await masterRes.json();

        const systemData =
          await systemRes.json();

        const mergedData = [
          ...(Array.isArray(
            masterData
          )
            ? masterData
            : []),

          ...(Array.isArray(
            systemData
          )
            ? systemData
            : []),
        ];

        setEnrollmentData(
          mergedData
        );
      } catch (error) {
        console.error(error);
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

  const filteredData = useMemo(() => {
    return enrollmentData.filter(
      (student) => {
        const matchesSearch =
          student[
            "Student Name"
          ]
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );

        const isCurrentYear =
          student[
            "Academic Year"
          ] === "2026/2027";

        return (
          matchesSearch &&
          isCurrentYear
        );
      }
    );
  }, [
    enrollmentData,
    searchTerm,
  ]);

  const dashboardStats = useMemo(() => {
    const completed =
      filteredData.filter(
        (student) =>
          student[
            "Final Status"
          ] === "Completed"
      ).length;

    const inProgress =
      filteredData.filter(
        (student) =>
          student[
            "Final Status"
          ] === "In Progress"
      ).length;

    const pending =
      filteredData.filter(
        (student) =>
          student[
            "Final Status"
          ] === "Pending"
      ).length;

    return {
      totalApplicants:
        filteredData.length,

      completed,
      pending,
      inProgress,
    };
  }, [filteredData]);

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

  return (
    <div
      className={`${jakarta.className} min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex`}
    >
      <Sidebar />

      <main className="flex-1 p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              Admissions Dashboard
            </p>

            <h1 className="mt-3 text-5xl font-extrabold text-[#071739]">
              Enrollment Status
            </h1>

            <p className="mt-4 text-slate-500">
              Live enrollment tracking
              for Academic Year
              2026/2027.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-[#071739] shadow-sm outline-none"
          />
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

        {/* Chart */}
        <section className="mt-10 rounded-[32px] border border-white bg-white/90 p-8 shadow-sm">
          <h3 className="text-3xl font-bold text-[#071739]">
            Stage Distribution
          </h3>

          <div className="mt-10 flex justify-center">
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
        </section>

        {/* Table */}
        <section className="mt-10 rounded-[32px] border border-white bg-white/90 p-8 shadow-sm">
          <h3 className="text-3xl font-bold text-[#071739]">
            Enrollment Records
          </h3>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-5 py-4">
                    Student Name
                  </th>

                  <th className="px-5 py-4">
                    Grade
                  </th>

                  <th className="px-5 py-4">
                    Nationality
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Stage
                  </th>

                  <th className="px-5 py-4">
                    PIC
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map(
                  (
                    student,
                    index
                  ) => (
                    <tr
                      key={index}
                      onClick={() =>
                        setSelectedStudent(
                          student
                        )
                      }
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50"
                    >
                      <td className="px-5 py-4 font-semibold text-[#071739]">
                        {
                          student[
                            "Student Name"
                          ]
                        }
                      </td>

                      <td className="px-5 py-4 text-[#071739]">
                        {
                          student[
                            "Grade Applying"
                          ]
                        }
                      </td>

                      <td className="px-5 py-4 text-[#071739]">
                        {
                          student[
                            "Nationality Type"
                          ]
                        }
                      </td>

                      <td className="px-5 py-4 text-[#071739]">
                        {
                          student[
                            "Payment Type"
                          ]
                        }
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            STAGE_STYLES[
                              student[
                                "Current Stage"
                              ]
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {
                            student[
                              "Current Stage"
                            ]
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[#071739]">
                        {
                          student[
                            "PIC"
                          ]
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal */}
        {selectedStudent && (
          <StudentModal
            student={
              selectedStudent
            }
            onClose={() =>
              setSelectedStudent(
                null
              )
            }
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
  const requiredDocs =
    student[
      "Nationality Type"
    ] === "WNA"
      ? [
          "Enrollment Agreement",
          "Birth Certificate",
          "Parents Passport",
          "Child Passport",
        ]
      : [
          "Enrollment Agreement",
          "Birth Certificate",
          "Parents ID",
        ];

  const completedDocs =
    requiredDocs.filter(
      (doc) => {
        const value =
          student[
            doc as keyof EnrollmentStudent
          ];

        return (
          value ===
            "Complete" ||
          value === "Yes"
        );
      }
    ).length;

  const progress =
    Math.round(
      (completedDocs /
        requiredDocs.length) *
        100
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-extrabold text-[#071739]">
              {
                student[
                  "Student Name"
                ]
              }
            </h2>

            <p className="mt-2 text-slate-500">
              Grade{" "}
              {
                student[
                  "Grade Applying"
                ]
              }
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600"
          >
            Close
          </button>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-500">
              Enrollment Progress
            </p>

            <p className="font-bold text-[#071739]">
              {progress}%
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-green-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Overview */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <DetailCard
            title="Nationality"
            value={
              student[
                "Nationality Type"
              ]
            }
          />

          <DetailCard
            title="Payment Type"
            value={
              student[
                "Payment Type"
              ]
            }
          />

          <DetailCard
            title="Current Stage"
            value={
              student[
                "Current Stage"
              ]
            }
          />

          <DetailCard
            title="PIC"
            value={student["PIC"]}
          />
        </div>

        {/* Required Documents */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-[#071739]">
            Required Documents
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {requiredDocs.map(
              (doc) => {
                const value =
                  student[
                    doc as keyof EnrollmentStudent
                  ];

                const completed =
                  value ===
                    "Complete" ||
                  value === "Yes";

                return (
                  <div
                    key={doc}
                    className={`flex items-center justify-between rounded-2xl border p-4 ${
                      completed
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <span className="font-semibold text-[#071739]">
                      {doc}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        completed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {completed
                        ? "Complete"
                        : "Missing"}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-12 rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Notes
          </p>

          <p className="mt-4 text-sm text-slate-600">
            {student[
              "Notes"
            ] || "No notes available."}
          </p>
        </div>
      </div>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-sm font-semibold text-[#071739]">
        {value || "-"}
      </p>
    </div>
  );
}