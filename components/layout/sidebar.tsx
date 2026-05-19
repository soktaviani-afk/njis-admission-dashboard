"use client";

import Image from "next/image";
import Link from "next/link";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
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
    <aside className="z-20 hidden w-72 flex-col border-r border-white/10 bg-[#071739] p-6 text-white shadow-2xl md:flex">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="mt-12 flex flex-col gap-3">
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
                className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} />

                {item.name}
              </Link>
            );
          }
        )}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-4 font-semibold text-slate-300 transition-all duration-300 hover:bg-red-500/20 hover:text-white"
      >
        <LogOut size={20} />

        Logout
      </button>
    </aside>
  );
}