"use client";

import Image from "next/image";
import Link from "next/link";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Database,
  LogOut,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    name: "Homepage",
    path: "/homepage",
    icon: LayoutDashboard,
  },

  {
    name: "Enrollment Status",
    path: "/enrollment-status",
    icon: Users,
  },

  {
    name: "Leads Database",
    path: "/leads-database",
    icon: Database,
  },

  {
    name: "Internal Documents",
    path: "/internal-documents",
    icon: FileText,
  },

  {
    name: "Student Exit Analysis",
    path: "/student-exit",
    icon: GraduationCap,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("njis-auth");
    router.push("/");
  }

  return (
    <aside className="z-20 hidden w-72 flex-col border-r border-white/10 bg-gradient-to-b from-[#071739] via-[#0B1F4D] to-[#071739] px-5 py-6 text-white shadow-2xl md:flex">

      {/* =========================
          BRAND
      ========================== */}
      <div className="px-2">
        <Link
          href="/homepage"
          className="group flex items-center gap-3.5"
        >
          {/* NJIS Logo */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] bg-white p-2 shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-[1.02]">
            <Image
              src="/njis-logo.png"
              alt="NJIS Logo"
              width={44}
              height={44}
              loading="eager"
              className="h-11 w-11 object-contain"
            />
          </div>

          {/* School Identity */}
          <div className="min-w-0">
            <h1 className="text-[21px] font-extrabold leading-none tracking-[-0.03em] text-white">
              NJIS
            </h1>

            <p className="mt-1.5 text-[9px] font-semibold uppercase leading-[1.35] tracking-[0.08em] text-slate-300">
              North Jakarta
              <br />
              Intercultural School
            </p>
          </div>
        </Link>

        {/* Small system label */}
        <div className="mt-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Admissions
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* =========================
          NAVIGATION
      ========================== */}
      <nav className="mt-7 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.path ||
            pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative overflow-hidden rounded-2xl px-3.5 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.12] text-white shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-cyan-400" />
              )}

              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.10] text-white"
                      : "text-slate-400 group-hover:bg-white/[0.06] group-hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[13px] ${
                    isActive
                      ? "font-bold text-white"
                      : "font-semibold text-slate-300 group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* =========================
          BOTTOM SECTION
      ========================== */}
      <div className="mt-auto">

        {/* System Card */}
        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-md">

          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              NJIS System
            </p>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="text-[8px] font-semibold uppercase tracking-wide text-emerald-400">
                Online
              </span>
            </div>
          </div>

          <h3 className="mt-2 text-[16px] font-extrabold tracking-tight text-white">
            Admissions CRM
          </h3>

          <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
            Enrollment, lead management,
            and student analytics.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-3.5 flex w-full items-center justify-center gap-2.5 rounded-xl border border-red-400/15 bg-red-500/[0.07] px-4 py-2.5 text-[12px] font-semibold text-red-200 transition-all duration-200 hover:border-red-400/25 hover:bg-red-500/[0.14] hover:text-white"
        >
          <LogOut
            size={16}
            strokeWidth={1.8}
          />

          Logout
        </button>

        {/* Copyright */}
        <div className="mt-5 px-1 text-center">
          <p className="text-[8px] font-medium leading-relaxed text-slate-600">
            © {new Date().getFullYear()} North Jakarta
            <br />
            Intercultural School
          </p>

          <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-slate-700">
            Admissions Dashboard
          </p>
        </div>
      </div>
    </aside>
  );
}