"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
    }, 10000);

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

const filteredData =
  enrollmentData.filter((student) => {
    const matchesYear =
      selectedYear ===
        "All Years" ||
      student["Academic Year"] ===
        selectedYear;

    const matchesSearch =
      student["Student Name"]
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    const matchesStage =
      selectedStage ===
        "All Stages" ||
      student["Current Stage"] ===
        selectedStage;

    return (
      matchesYear &&
      matchesSearch &&
      matchesStage
    );
  });

const totalApplicants =
  filteredData.length;

const completedStudents =
  filteredData.filter(
    (student) =>
      student["Final Status"] ===
      "Completed"
  ).length;

const pendingStudents =
  filteredData.filter(
    (student) =>
      student["Final Status"] ===
      "Pending"
  ).length;

const inProgressStudents =
  filteredData.filter(
    (student) =>
      student["Final Status"] ===
      "In Progress"
  ).length;

const fullyPayingStudents =
  filteredData.filter(
    (student) =>
      student[
        "Payment Type"
      ] === "Fully Paying"
  ).length;

const teacherSubsidyStudents =
  filteredData.filter(
    (student) =>
      student[
        "Payment Type"
      ] ===
      "Teacher Subsidy"
  ).length;

const scholarshipStudents =
  filteredData.filter(
    (student) =>
      student[
        "Payment Type"
      ] ===
      "Academic Scholarship"
  ).length;

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

        {/* KPI Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applicants"
            value={String(
              totalApplicants
            )}
          />

          <StatCard
            title="Completed"
            value={String(
              completedStudents
            )}
          />

          <StatCard
            title="Pending"
            value={String(
              pendingStudents
            )}
          />

          <StatCard
            title="In Progress"
            value={String(
              inProgressStudents
            )}
          />

          <StatCard
  title="Fully Paying"
  value={String(
    fullyPayingStudents
  )}
/>

<StatCard
  title="Teacher Subsidy"
  value={String(
    teacherSubsidyStudents
  )}
/>

<StatCard
  title="Academic Scholarship"
  value={String(
    scholarshipStudents
  )}
/>
        </div>

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
                      className="py-16 text-center text-slate-400"
                    >
                      Loading enrollment
                      data...
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
  className="cursor-pointer border-b border-slate-100 transition-colors duration-200 hover:bg-blue-50/40"
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
    student[
      "Current Stage"
    ] === "Inquiry"
      ? "bg-slate-100 text-slate-700"

      : student[
          "Current Stage"
        ] === "Observation"
      ? "bg-indigo-100 text-indigo-700"

      : student[
          "Current Stage"
        ] === "MAP Test"
      ? "bg-blue-100 text-blue-700"

      : student[
          "Current Stage"
        ] ===
        "Documents Pending"
      ? "bg-amber-100 text-amber-700"

      : student[
    "Current Stage"
      ] === "Onboarding"
      ? "bg-cyan-100 text-cyan-700"

      : student[
          "Current Stage"
        ] === "Accepted"
      ? "bg-green-100 text-green-700"

      : student[
          "Current Stage"
        ] ===
        "Payment Completed"
      ? "bg-emerald-100 text-emerald-700"

      : student[
          "Current Stage"
        ] === "Enrolled"
      ? "bg-emerald-100 text-emerald-700"

      : student[
          "Current Stage"
        ] === "Withdrawn"
      ? "bg-red-100 text-red-700"

      : "bg-gray-100 text-gray-500"
  }`}
>
  {student["Current Stage"] ||
    "No Stage"}
</span>
</td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              student[
                                "Documents Status"
                              ] ===
                              "Complete"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {
                              student[
                                "Documents Status"
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              student[
                                "Onboarding Status"
                              ] ===
                              "Complete"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {
                              student[
                                "Onboarding Status"
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
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-slate-400"
                    >
                      No enrollment data
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* Student Detail Modal */}
{selectedStudent && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl">
      {/* Header */}
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
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
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
          selectedStudent[
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
          selectedStudent[
            doc as keyof EnrollmentStudent
          ] === "TRUE";

        return (
          <div
            key={doc}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
              isComplete
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <span className="text-sm font-semibold text-[#071739]">
              {doc}
            </span>

            <span className="text-lg">
              {isComplete
                ? "✅"
                : "❌"}
            </span>
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
          selectedStudent[
            doc as keyof EnrollmentStudent
          ] === "TRUE";

        return (
          <div
            key={doc}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
              isComplete
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className="text-sm font-semibold text-[#071739]">
              {doc}
            </span>

            <span className="text-lg">
              {isComplete
                ? "✅"
                : "➖"}
            </span>
          </div>
        );
      })}
    </div>
  </div>
</div>

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
          selectedStudent[
            "NJIS System Waived"
          ] === "TRUE";

        const isComplete =
          selectedStudent[
            item as keyof EnrollmentStudent
          ] === "TRUE";

        return (
          <div
            key={item}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
              isWaived
                ? "border-slate-200 bg-slate-100"
                : isComplete
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <span className="text-sm font-semibold text-[#071739]">
              {item}
            </span>

            <span className="text-lg">
              {isWaived
                ? "➖"
                : isComplete
                ? "✅"
                : "❌"}
            </span>
          </div>
        );
      }
    )}
  </div>
</div>

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