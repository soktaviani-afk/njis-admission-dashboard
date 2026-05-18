"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { Plus_Jakarta_Sans } from "next/font/google";

import {
  Users,
  GraduationCap,
  TrendingDown,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type StudentExit = {
  "Student Name": string;
  "Reason for Leaving": string;
};

type EnrollmentStudent = {
  "Student Name": string;
  "Final Status": string;
  "Onboarding Status": string;
};

export default function Home() {
  const [exitData, setExitData] = useState<StudentExit[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<
    EnrollmentStudent[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const exitRes = await fetch(
          "https://opensheet.elk.sh/1fCLWJ4uA3nztHOgxCNuM983QEFPdJn5AJCULPLTmYi4/StudentExitAnalysis"
        );

        const exitJson = await exitRes.json();
        setExitData(exitJson);

        const enrollmentRes = await fetch(
          "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/MASTER_ENROLLMENT"
        );

        const enrollmentJson =
          await enrollmentRes.json();

        setEnrollmentData(enrollmentJson);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const totalExits = exitData.length;

  const totalEnrollment =
    enrollmentData.length;

  const completedEnrollment =
    enrollmentData.filter(
      (student) =>
        student["Final Status"] ===
        "Enrolled"
    ).length;

  const onboardingPending =
    enrollmentData.filter(
      (student) =>
        student[
          "Onboarding Status"
        ] !== "Complete"
    ).length;

  return (
    <main
      className={`${jakarta.className} min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-8 lg:p-12`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="rounded-[40px] border border-white bg-white/90 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
            Admissions & Marketing Dashboard
          </p>

          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-[#071739]">
            NJIS Main Dashboard
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-500">
            Centralized overview for admissions,
            enrollment operations, onboarding,
            and student exit analytics.
          </p>
        </div>

        {/* KPI CARDS */}
        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total Enrollment"
            value={String(totalEnrollment)}
            icon={<Users size={28} />}
          />

          <DashboardCard
            title="Enrolled Students"
            value={String(completedEnrollment)}
            icon={<GraduationCap size={28} />}
          />

          <DashboardCard
            title="Student Exits"
            value={String(totalExits)}
            icon={<TrendingDown size={28} />}
          />

          <DashboardCard
            title="Pending Onboarding"
            value={String(onboardingPending)}
            icon={<ClipboardCheck size={28} />}
          />
        </section>

        {/* MAIN MODULES */}
        <section className="mt-12 grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Student Exit */}
          <Link
            href="/student-exit"
            className="group rounded-[36px] border border-white bg-[#071739] p-10 text-white shadow-[0_20px_60px_rgba(2,6,23,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(2,6,23,0.28)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
                  Analytics Module
                </p>

                <h2 className="mt-4 text-4xl font-extrabold">
                  Student Exit Analysis
                </h2>
              </div>

              <ArrowRight
                size={38}
                className="transition-transform group-hover:translate-x-2"
              />
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
              Analyze retention trends, exit
              reasons, grade impact, and
              student movement insights.
            </p>

            <div className="mt-10 flex items-center justify-between rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
              <div>
                <p className="text-sm text-slate-300">
                  Total Student Exits
                </p>

                <h3 className="mt-2 text-5xl font-extrabold">
                  {totalExits}
                </h3>
              </div>

              <TrendingDown
                size={54}
                className="text-red-400"
              />
            </div>
          </Link>

          {/* Enrollment */}
          <Link
            href="/enrollment-status"
            className="group rounded-[36px] border border-white bg-gradient-to-br from-blue-600 to-cyan-500 p-10 text-white shadow-[0_20px_60px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(37,99,235,0.28)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-100">
                  Operations Module
                </p>

                <h2 className="mt-4 text-4xl font-extrabold">
                  Enrollment Status
                </h2>
              </div>

              <ArrowRight
                size={38}
                className="transition-transform group-hover:translate-x-2"
              />
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-blue-100">
              Monitor admissions pipeline,
              onboarding completion, document
              tracking, and enrollment status.
            </p>

            <div className="mt-10 flex items-center justify-between rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
              <div>
                <p className="text-sm text-blue-100">
                  Total Applicants
                </p>

                <h3 className="mt-2 text-5xl font-extrabold">
                  {totalEnrollment}
                </h3>
              </div>

              <Users
                size={54}
                className="text-white"
              />
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: any;
}) {
    
  return (
    <div className="rounded-[30px] border border-white bg-white/90 p-7 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <h3 className="mt-4 text-5xl font-extrabold tracking-tight text-[#071739]">
            {value}
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4 text-[#071739]">
          {icon}
        </div>
      </div>
    </div>
  );
}