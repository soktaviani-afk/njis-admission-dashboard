"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ArrowRight,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type EnrollmentStudent = {
  "Current Stage": string;
  "Final Status": string;
};

export default function Homepage() {
    const router = useRouter();
const [enrollmentData, setEnrollmentData] =
  useState<EnrollmentStudent[]>(
    []
  );

const [loading, setLoading] =
  useState(true);
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, []);

const dashboardStats = useMemo(() => {
  const totalApplicants =
    enrollmentData.length;

  const activeEnrollment =
    enrollmentData.filter(
      (student) =>
        student[
          "Final Status"
        ] === "Completed"
    ).length;

  const inProgress =
    enrollmentData.filter(
      (student) =>
        student[
          "Final Status"
        ] === "In Progress"
    ).length;

  const completionRate =
    totalApplicants > 0
      ? Math.round(
          (activeEnrollment /
            totalApplicants) *
            100
        )
      : 0;

  return {
    totalApplicants,
    activeEnrollment,
    inProgress,
    completionRate,
  };
}, [enrollmentData]);

useEffect(() => {
  const isAuthenticated =
    localStorage.getItem(
      "njis-auth"
    );

  if (!isAuthenticated) {
    router.push("/");
  }
}, [router]);

function handleLogout() {
  localStorage.removeItem(
    "njis-auth"
  );

  router.push("/");
}

  return (
    <main className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="flex w-[260px] flex-col bg-[#071739] px-6 py-8 text-white">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Image
            src="/njis-logo.png"
            alt="NJIS Logo"
            width={60}
            height={60}
            className="object-contain"
          />

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
              NJIS
            </p>

            <h2 className="text-lg font-bold">
              Dashboard
            </h2>
          </div>
        </div>

        <button
  onClick={handleLogout}
  className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-4 font-semibold text-slate-300 transition hover:bg-red-500/20 hover:text-white"
>
  <LogOut size={20} />
  Logout
</button>

        {/* Menu */}
        <nav className="mt-14 flex flex-col gap-3">
          <Link
            href="/homepage"
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 font-semibold text-white"
          >
            <LayoutDashboard size={20} />
            Homepage
          </Link>

          <Link
            href="/enrollment-status"
            className="flex items-center gap-3 rounded-2xl px-5 py-4 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Users size={20} />
            Enrollment Status
          </Link>

          <Link
            href="/student-exit"
            className="flex items-center gap-3 rounded-2xl px-5 py-4 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <GraduationCap size={20} />
            Student Exit
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
              NJIS INTERNAL PORTAL
            </p>

            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-[#071739]">
              Admissions Homepage
            </h1>

            <p className="mt-4 text-slate-500">
              Overview analytics and
              operational monitoring
              dashboard.
            </p>
          </div>

          <div className="rounded-[28px] bg-white px-6 py-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Status
            </p>

            <h3 className="mt-2 text-2xl font-bold text-green-600">
              System Active
            </h3>
          </div>
        </div>

        {/* KPI */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[30px] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Total Applicants
            </p>

            <h2 className="mt-4 text-5xl font-extrabold text-[#071739]">
              {loading
  ? "..."
  : dashboardStats.totalApplicants}
            </h2>
          </div>

          <div className="rounded-[30px] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Active Enrollment
            </p>

            <h2 className="mt-4 text-5xl font-extrabold text-[#071739]">
              {loading
  ? "..."
  : dashboardStats.activeEnrollment}
            </h2>
          </div>

          <div className="rounded-[30px] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Student Exits
            </p>

            <h2 className="mt-4 text-5xl font-extrabold text-[#071739]">
              {loading
  ? "..."
  : dashboardStats.inProgress}
            </h2>
          </div>

          <div className="rounded-[30px] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Completion Rate
            </p>

            <h2 className="mt-4 text-5xl font-extrabold text-[#071739]">
              {loading
  ? "..."
  : `${dashboardStats.completionRate}%`}
            </h2>
          </div>
        </div>

{/* Quick Navigation */}
<div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-2">
  <Link
    href="/enrollment-status"
    className="group rounded-[32px] bg-gradient-to-br from-[#071739] to-[#123D82] p-8 text-white shadow-[0_20px_60px_rgba(7,23,57,0.18)] transition-all duration-300 hover:-translate-y-2"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-blue-200">
          Dashboard
        </p>

        <h2 className="mt-4 text-4xl font-extrabold">
          Enrollment Status
        </h2>

        <p className="mt-4 max-w-md text-slate-300">
          Monitor admissions
          progress, onboarding,
          documents, and student
          pipeline.
        </p>
      </div>

      <ArrowRight className="transition duration-300 group-hover:translate-x-2" />
    </div>
  </Link>

  <Link
    href="/student-exit"
    className="group rounded-[32px] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Dashboard
        </p>

        <h2 className="mt-4 text-4xl font-extrabold text-[#071739]">
          Student Exit
        </h2>

        <p className="mt-4 max-w-md text-slate-500">
          Analyze withdrawal
          reasons, academic
          trends, and retention
          insights.
        </p>
      </div>

      <ArrowRight className="text-[#071739] transition duration-300 group-hover:translate-x-2" />
    </div>
  </Link>
</div>
      </section>
    </main>
  );
}