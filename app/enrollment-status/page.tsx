"use client";

import Image from "next/image";
import Link from "next/link";

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

import { useRouter } from "next/navigation";

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

const menuItems = [
  {
    name: "Homepage",
    path: "/homepage",
  },
  {
    name: "Enrollment Status",
    path: "/enrollment-status",
  },
  {
    name: "Student Exit Analysis",
    path: "/student-exit",
  },
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

  // Documents Checklist
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

  // Onboarding Checklist
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
    useState<EnrollmentStudent[]>([]);

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

    return () => clearInterval(interval);
  }, []);

  const academicYears = [
    "All Years",
    ...new Set(
      enrollmentData.map(
        (student) =>
          student["Academic Year"]
      )
    ),
  ];
  const stages = [
  "All Stages",
  ...new Set(
    enrollmentData.map(
      (student) =>
        student["Current Stage"]
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

  filteredData.forEach((student) => {
    const stage =
      student["Current Stage"] ||
      "Unknown";

    counts[stage] =
      (counts[stage] || 0) + 1;
  });

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

  const fullyPaying =
    filteredData.filter(
      (student) =>
        student[
          "Payment Type"
        ] === "Fully Paying"
    ).length;

  const teacherSubsidy =
    filteredData.filter(
      (student) =>
        student[
          "Payment Type"
        ] ===
        "Teacher Subsidy"
    ).length;

  const scholarship =
    filteredData.filter(
      (student) =>
        student[
          "Payment Type"
        ] ===
        "Academic Scholarship"
    ).length;

  return {
    totalApplicants:
      filteredData.length,

    completed,
    pending,
    inProgress,

    fullyPaying,
    teacherSubsidy,
    scholarship,
  };
}, [filteredData]);

 const attentionStudents =
  filteredData.filter(
    (student) =>
      student[
        "Documents Status"
      ] !== "Complete" ||
      student[
        "Onboarding Status"
      ] !== "Complete"
  );
const requiredDocuments = [
  "Birth Certificate",
  ...(selectedStudent?.[
    "Nationality Type"
  ] === "WNA"
    ? [
        "Parents Passport",
        "Child Passport",
        "KITAS",
      ]
    : ["Parents ID"]),
  ...(selectedStudent?.[
    "Payment Type"
  ] === "Fully Paying"
    ? [
        "Enrollment Agreement",
      ]
    : []),
];

const optionalDocuments = [
  "Media Release Form",
  "Family Registry",
  "Child ID",
  "Student Health Card",
  "Immunization Card",
  "Report Card 3 Years",

  ...(selectedStudent?.[
    "Nationality Type"
  ] === "WNA"
    ? ["Parents ID"]
    : [
        "Parents Passport",
        "Child Passport",
        "KITAS",
      ]),
];

const onboardingChecklist = [
  "Admissions NJIS System",
  "Acceptance Letter",
  "Inform Finance to Invoice",
  "Student Data List (SDL) & LS US SDL",
  "Toddle",
  "Emergency Bag",
  "Toddle Health",
  "Toddle Flags",
  "Birthday List",
  "Parents Business List",
  "Student ID",
  "Nationality Flags",
  "Scan Documents",
];

const allChecklistItems = [
  ...requiredDocuments,
  ...optionalDocuments,
  ...onboardingChecklist,
];

const completedItems =
  allChecklistItems.filter(
    (item) =>
      selectedStudent?.[
        item as keyof EnrollmentStudent
      ] === "TRUE"
  ).length;

const totalItems =
  allChecklistItems.length;

const progressPercentage =
  Math.round(
    (completedItems /
      totalItems) *
      100
  );
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
  style={{
    width: "auto",
    height: "auto",
  }}
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
                "Enrollment Status"
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
      setSearchTerm(e.target.value)
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
    {academicYears.map((year) => (
      <option
        key={year}
        value={year}
      >
        {year}
      </option>
    ))}
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

{/* Primary KPI */}
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

{/* Secondary KPI */}
<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
  <SecondaryStatCard
    title="Fully Paying"
    value={String(
      dashboardStats.fullyPaying
    )}
  />

  <SecondaryStatCard
    title="Teacher Subsidy"
    value={String(
      dashboardStats.teacherSubsidy
    )}
  />

  <SecondaryStatCard
    title="Academic Scholarship"
    value={String(
      dashboardStats.scholarship
    )}
  />
</div>

{/* Analytics */}
<section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
  {/* Stage Distribution */}
  <div className="rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm xl:col-span-2">
    <h3 className="text-3xl font-bold text-[#071739]">
      Stage Distribution
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Student distribution by
      current admissions stage.
    </p>

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
          labelLine={false}
          label={({ percent }) =>
            `${(
              (percent || 0) * 100
            ).toFixed(0)}%`
          }
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
                stroke="#fff"
                strokeWidth={4}
              />
            )
          )}
        </Pie>

        <Tooltip />
      </PieChart>

      <div className="mt-8 flex flex-wrap justify-center gap-5">
        {stageChartData.map(
          (item, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    CHART_COLORS[
                      index %
                        CHART_COLORS.length
                    ],
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

  {/* Analytics Summary */}
  <div className="rounded-[32px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur-sm">
    <h3 className="text-3xl font-bold text-[#071739]">
      Analytics Summary
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Admissions insights overview.
    </p>

    <div className="mt-8 space-y-4">
      {stageChartData.map(
        (item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      CHART_COLORS[
                        index %
                          CHART_COLORS.length
                      ],
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
          </div>
        )
      )}
    </div>
  </div>
</section>

{/* Needs Attention */}
{attentionStudents.length > 0 && (
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

      <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
        {attentionStudents.length} Students
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {attentionStudents
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

            <div className="mt-4 flex flex-wrap gap-2">
              {student[
                "Documents Status"
              ] !== "Complete" && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  Documents Pending
                </span>
              )}

              {student[
                "Onboarding Status"
              ] !== "Complete" && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  Onboarding Pending
                </span>
              )}
            </div>
          </div>
        ))}
    </div>
  </section>
)}

        {/* Enrollment Table */}
        <section className="mt-10 rounded-[32px] border border-white bg-white/90 backdrop-blur-sm p-8 shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-3xl font-bold text-[#071739]">
                Enrollment Records
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Live spreadsheet synced
                enrollment records.
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
  Click a student row to view
  detailed enrollment progress.
</p>
            </div>

            <div className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
              Live Spreadsheet Connected
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10">
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
                {loading ? (
                  <tr>
                    <td
  colSpan={6}
  className="py-20 text-center"
>
  <div className="flex flex-col items-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />

    <p className="mt-5 text-sm font-semibold text-slate-500">
      Loading enrollment data...
    </p>
  </div>
</td>
                  </tr>
                ) : filteredData.length >
                  0 ? (
                  filteredData.map(
                    (
                      student,
                      index
                    ) => (
<tr
  key={index}
  onClick={() =>
    setSelectedStudent(student)
  }
  className="cursor-pointer border-b border-slate-100 transition-all duration-200 hover:bg-blue-50/60 hover:shadow-sm"
>
                        <td className="px-5 py-4 font-medium text-[#071739]">
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

<td className="px-5 py-4">
<span
  className={`rounded-full px-3 py-1 text-sm font-semibold ${
    STAGE_STYLES[
      student["Current Stage"]
    ] ||
    "bg-gray-100 text-gray-500"
  }`}
>
  {student["Current Stage"] ||
    "No Stage"}
</span>
</td>

<td className="px-5 py-4">
  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold ${
      STATUS_STYLES[
        student[
          "Documents Status"
        ]
      ] ||
      "bg-slate-100 text-slate-600"
    }`}
  >
    {student[
      "Documents Status"
    ] || "-"}
  </span>
</td>

<td className="px-5 py-4">
  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold ${
      STATUS_STYLES[
        student[
          "Onboarding Status"
        ]
      ] ||
      "bg-slate-100 text-slate-600"
    }`}
  >
    {student[
      "Onboarding Status"
    ] || "-"}
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
                  )
                ) : (
                  <tr>
<td
  colSpan={6}
  className="py-20 text-center"
>
  <div className="flex flex-col items-center">
    <div className="rounded-full bg-slate-100 px-6 py-4 text-3xl">
      📂
    </div>

    <h3 className="mt-5 text-xl font-bold text-[#071739]">
      No Enrollment Records Found
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Try adjusting your search or
      filters.
    </p>
  </div>
</td>
                  </tr>
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
  className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl"
  onClick={(e) =>
    e.stopPropagation()
  }
>
{/* Header */}
<div className="sticky top-0 z-20 -mx-8 -mt-8 mb-8 flex items-start justify-between border-b border-slate-200 bg-white px-8 py-6">
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
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:scale-105 hover:bg-slate-200"
        >
          Close
        </button>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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

        <DetailCard
          title="Academic Year"
          value={
            selectedStudent[
              "Academic Year"
            ]
          }
        />

        <DetailCard
  title="Nationality"
  value={
    selectedStudent[
      "Nationality Type"
    ]
  }
/>

<DetailCard
  title="Payment Type"
  value={
    selectedStudent[
      "Payment Type"
    ]
  }
/>

        <DetailCard
          title="Last Update"
          value={
            selectedStudent[
              "Last Update"
            ]
          }
        />
      </div>

<div className="mt-10 border-t border-slate-200" />

{/* Admissions Progress */}
<div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
        Admissions Progress
      </p>

      <h3 className="mt-2 text-3xl font-extrabold text-[#071739]">
        {progressPercentage}%
      </h3>
    </div>

    <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
      {completedItems} / {totalItems} Completed
    </div>
  </div>

  <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
      style={{
        width: `${progressPercentage}%`,
      }}
    />
  </div>
</div>

<div className="mt-10 border-t border-slate-200" />

{/* Documents Checklist */}
<div className="mt-10">
  {/* Required Documents */}
  <div>
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-[#071739]">
        Required Documents
      </h3>

      {requiredDocuments.some(
        (doc) =>
          selectedStudent?.[
            doc as keyof EnrollmentStudent
          ] !== "TRUE"
      ) && (
        <div className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700">
          Missing Required Documents
        </div>
      )}
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
{requiredDocuments.map((doc) => {
  const isComplete =
    selectedStudent?.[
      doc as keyof EnrollmentStudent
    ] === "TRUE";

  return (
    <div key={doc}>
      {renderChecklistItem(
        doc,
        isComplete,
        "border-green-200 bg-green-50",
        "border-red-200 bg-red-50"
      )}
    </div>
  );
})}
    </div>
  </div>

  {/* Optional Documents */}
  <div className="mt-10">
    <h3 className="text-xl font-bold text-[#071739]">
      Optional Documents
    </h3>

    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
{optionalDocuments.map((doc) => {
  const isComplete =
    selectedStudent?.[
      doc as keyof EnrollmentStudent
    ] === "TRUE";

  return (
    <div key={doc}>
      {renderChecklistItem(
        doc,
        isComplete,
        "border-blue-200 bg-blue-50",
        "border-slate-200 bg-slate-50",
        "➖"
      )}
    </div>
  );
})}
    </div>
  </div>
</div>

<div className="mt-10 border-t border-slate-200" />

{/* Onboarding Checklist */}
<div className="mt-10">
  <h3 className="text-xl font-bold text-[#071739]">
    Onboarding Checklist
  </h3>

  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
{onboardingChecklist.map(
  (item) => {
    const isWaived =
      item ===
        "Admissions NJIS System" &&
      selectedStudent?.[
        "NJIS System Waived"
      ] === "TRUE";

    const isComplete =
      selectedStudent?.[
        item as keyof EnrollmentStudent
      ] === "TRUE";

    return (
      <div key={item}>
        {renderChecklistItem(
          item,
          isWaived
            ? false
            : isComplete,
          "border-green-200 bg-green-50",
          isWaived
            ? "border-slate-200 bg-slate-100"
            : "border-amber-200 bg-amber-50",
          isWaived ? "➖" : "❌"
        )}
      </div>
    );
  }
)}
  </div>
</div>

<div className="mt-10 border-t border-slate-200" />

      {/* Notes */}
      <div className="mt-10 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
          Notes
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {selectedStudent["Notes"] ||
            "No notes available."}
        </p>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}

  function renderChecklistItem(
  label: string,
  isComplete: boolean,
  completeStyle: string,
  incompleteStyle: string,
  incompleteIcon = "❌"
) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
        isComplete
          ? completeStyle
          : incompleteStyle
      }`}
    >
      <span className="text-sm font-semibold text-[#071739]">
        {label}
      </span>

      <span className="text-lg">
        {isComplete
          ? "✅"
          : incompleteIcon}
      </span>
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

function SecondaryStatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-2xl font-extrabold text-[#071739]">
        {value}
      </h3>
    </div>
  );
}