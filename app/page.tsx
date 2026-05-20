"use client";

import Image from "next/image";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  User,
} from "lucide-react";

export default function LoginPage() {
  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const router =
    useRouter();

  function handleLogin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const USERS = [
      {
        name:
          "Nathalia Atmaja",

        username:
          "nathalia.atmaja",

        password:
          "NJISNatalia26!",

        role:
          "Marketing Manager",
      },

      {
        name:
          "Siska Wati",

        username:
          "siska.wati",

        password:
          "NJISSiska26!",

        role:
          "Senior Admission Consultant",
      },

      {
        name:
          "Dewi Asmawi Putri",

        username:
          "dewi.asmawi",

        password:
          "NJISDewi26!",

        role:
          "Admission Consultant",
      },

      {
        name:
          "Sella Oktaviani",

        username:
          "sella.oktaviani",

        password:
          "NJISSuperAdmin26!",

        role:
          "Super Admin",
      },

      {
        name: "Naomi",

        username:
          "naomi",

        password:
          "NJISNaomi26!",

        role:
          "Secretary of School",
      },

      {
        name:
          "Ezra Alexander",

        username:
          "ezra.alexander",

        password:
          "NJISEzra26!",

        role:
          "Head of School",
      },
    ];

    const matchedUser =
      USERS.find(
        (user) =>
          user.username ===
            username &&
          user.password ===
            password
      );

    if (matchedUser) {
      localStorage.setItem(
        "njis-auth",
        "true"
      );

      localStorage.setItem(
        "njis-user",
        JSON.stringify(
          matchedUser
        )
      );

      router.push(
        "/homepage"
      );
    } else {
      alert(
        "Invalid username or password"
      );
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071f5f] px-6">
      {/* Background */}
      <Image
        src="/njis-login-bg.png"
        alt="NJIS background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#061b54]/50 backdrop-blur-[2px]" />

      {/* Glow Effects */}
      <div className="absolute left-0 top-0 h-[320px] w-[320px] rounded-full bg-blue-400/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-cyan-300/20 blur-3xl" />

      {/* Login Card */}
      <form
        onSubmit={
          handleLogin
        }
        className="relative z-10 mt-16 w-full max-w-[620px] rounded-[36px] border border-white/20 bg-white/95 px-10 pb-10 pt-28 shadow-[0_35px_100px_rgba(0,0,0,0.30)] backdrop-blur-xl"
      >
        {/* Avatar */}
        <div className="absolute left-1/2 top-0 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#d9deea] shadow-2xl">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#7C879B] to-[#98A2B3] text-[#d9deea]">
            <User
              size={78}
              strokeWidth={
                1.5
              }
            />
          </div>
        </div>

        {/* Logo */}
        <div className="absolute right-10 top-10">
          <Image
            src="/njis-logo.png"
            alt="NJIS Logo"
            width={140}
            height={140}
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-700">
            NJIS Internal Portal
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#071739]">
            Admissions Dashboard
          </h1>

          <p className="mt-4 text-base text-slate-500">
            Secure internal access
            for admissions,
            marketing, and school
            management teams.
          </p>
        </div>

        {/* Inputs */}
        <div className="mx-auto flex max-w-[460px] flex-col gap-6">
          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(
              event
            ) =>
              setUsername(
                event.target
                  .value
              )
            }
            className="h-14 rounded-full border border-slate-200 bg-slate-100 px-6 text-center text-lg font-semibold text-[#071739] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(
              event
            ) =>
              setPassword(
                event.target
                  .value
              )
            }
            className="h-14 rounded-full border border-slate-200 bg-slate-100 px-6 text-center text-lg font-semibold text-[#071739] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          {/* Login Button */}
          <button
            type="submit"
            className="mt-4 rounded-full bg-[#071739] px-6 py-4 text-lg font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#12337a] hover:shadow-2xl"
          >
            Login
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-400">
            © 2026 NJIS Admissions
            Dashboard
          </p>
        </div>
      </form>
    </main>
  );
}