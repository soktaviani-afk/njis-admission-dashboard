"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

if (
  username === "admin" &&
  password === "njis2026"
) {
  localStorage.setItem(
    "njis-auth",
    "true"
  );

  router.push("/homepage");
} else {
  alert(
    "Invalid username or password"
  );
}
}

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071f5f] px-6">
      {/* Background image */}
      <Image
        src="/njis-login-bg.png"
        alt="NJIS background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#061b54]/40 backdrop-blur-[2px]" />

      {/* Glow */}
      <div className="absolute left-0 top-0 h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-cyan-300/20 blur-3xl" />

      {/* Login card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 mt-16 w-full max-w-[600px] rounded-[30px] border border-white/20 bg-white/95 px-10 pb-10 pt-28 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl"
      >
        {/* Avatar */}
        <div className="absolute left-1/2 top-0 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#d9deea] shadow-2xl">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#a8adb8] text-[#d9deea]">
            <User
              size={78}
              strokeWidth={1.5}
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
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
            NJIS Internal Portal
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#071739]">
            Admissions Dashboard
          </h1>
        </div>

        {/* Inputs */}
        <div className="mx-auto flex max-w-[440px] flex-col gap-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            className="h-14 rounded-full border border-slate-200 bg-slate-100 px-6 text-center text-xl font-semibold text-[#071739] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            className="h-14 rounded-full border border-slate-200 bg-slate-100 px-6 text-center text-xl font-semibold text-[#071739] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="submit"
            className="mt-4 rounded-full bg-[#071739] px-6 py-4 text-lg font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#12337a] hover:shadow-2xl"
          >
            Login
          </button>
        </div>
      </form>
    </main>
  );
}