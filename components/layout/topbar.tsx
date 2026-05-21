"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ChevronDown,
  LogOut,
  UserCircle2,
} from "lucide-react";

type TopbarProps = {
  title?: string;
  subtitle?: string;
};

export default function Topbar({
  title = "Dashboard Overview",
  subtitle = "Welcome back to NJIS internal admissions management system.",
}: TopbarProps) {
  const router =
    useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] = useState<any>(null);

  const [
    openProfile,
    setOpenProfile,
  ] = useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        "njis-user"
      );

    if (storedUser) {
      setCurrentUser(
        JSON.parse(storedUser)
      );
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem(
      "njis-auth"
    );

    localStorage.removeItem(
      "njis-user"
    );

    router.push("/");
  }

  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      {/* Left */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-700">
          NJIS Admissions CRM
        </p>

        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-[#071739]">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-500">
          {subtitle}
        </p>
      </div>

      {/* Right */}
      <div className="relative">
        <button
          onClick={() =>
            setOpenProfile(
              !openProfile
            )
          }
          className="flex items-center gap-4 rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-xl"
        >
          {/* Avatar */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
            <UserCircle2
              size={30}
            />
          </div>

          {/* User Info */}
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Welcome
            </p>

            <h3 className="mt-1 text-xl font-extrabold text-[#071739]">
              Hi,{" "}
              {currentUser?.name ||
                "User"}
            </h3>
          </div>

          {/* Arrow */}
          <ChevronDown
            size={20}
            className={`transition duration-300 ${
              openProfile
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {openProfile && (
          <div className="absolute right-0 top-24 z-50 w-80 rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <UserCircle2
                  size={34}
                />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#071739]">
                  {
                    currentUser?.name
                  }
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    currentUser?.role
                  }
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <p className="mt-2 font-bold text-green-600">
                System Active
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={
                handleLogout
              }
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 px-5 py-4 font-bold text-white transition-all duration-300 hover:bg-red-600"
            >
              <LogOut
                size={20}
              />

              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}