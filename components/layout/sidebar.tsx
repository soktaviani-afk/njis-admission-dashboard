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
    localStorage.removeItem(
      "njis-auth"
    );

    router.push("/");
  }

  return (
    <aside className="z-20 hidden w-72 flex-col border-r border-white/10 bg-gradient-to-b from-[#071739] via-[#0B1F4D] to-[#071739] p-6 text-white shadow-2xl md:flex">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-white p-2 shadow-lg">
          <Image
            src="/njis-logo.png"
            alt="NJIS Logo"
            width={52}
            height={52}
            loading="eager"
            className="rounded-xl"
          />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            NJIS
          </h1>

          <p className="text-sm text-slate-300">
            Admissions Dashboard
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Navigation */}
      <nav className="mt-10 flex flex-col gap-3">
        {menuItems.map(
          (item, index) => {
            const Icon =
              item.icon;

            const isActive =
              pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                className={`group relative overflow-hidden rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white/15 text-white shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* Active Glow */}
                {isActive && (
                  <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-cyan-400" />
                )}

                <div className="relative flex items-center gap-3">
                  <div
                    className={`rounded-xl p-2 transition-all duration-300 ${
                      isActive
                        ? "bg-white/10"
                        : "bg-transparent group-hover:bg-white/10"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <span>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          }
        )}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        {/* Quick Stats */}
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            NJIS System
          </p>

          <h3 className="mt-3 text-2xl font-extrabold text-white">
            Admissions CRM
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Internal dashboard for
            enrollment tracking,
            lead management, and
            student analytics.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 font-semibold text-red-100 transition-all duration-300 hover:bg-red-500/20 hover:text-white"
        >
          <LogOut size={20} />

          Logout
        </button>
      </div>
    </aside>
  );
}