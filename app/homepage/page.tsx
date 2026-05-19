"use client";

import Sidebar from "@/components/layout/sidebar";
import StatCard from "@/components/cards/stat-card";

import Link from "next/link";

import {
  ArrowRight,
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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

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
              title="Active Enrollment"
              value={String(
                dashboardStats.activeEnrollment
              )}
            />

            <StatCard
              title="Student Exits"
              value={String(
                dashboardStats.inProgress
              )}
            />

            <StatCard
              title="Completion Rate"
              value={`${dashboardStats.completionRate}%`}
            />
          </div>
        )}

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
    </div>
  );
}