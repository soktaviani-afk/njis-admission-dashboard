"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071f5f] px-6">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(53,97,171,0.45),rgba(4,22,72,0.98))]" />

      <div className="absolute inset-0 opacity-20">
        <div className="grid h-full w-full grid-cols-3 gap-20 p-10 md:grid-cols-5">
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-[170px] font-extrabold text-white/30"
            >
              NJ
            </div>
          ))}
        </div>
      </div>

      {/* Login card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 mt-16 w-full max-w-[600px] rounded-[22px] bg-white px-10 pb-10 pt-28 shadow-[0_30px_90px_rgba(0,0,0,0.25)]"
      >
        {/* Avatar */}
        <div className="absolute left-1/2 top-0 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#d9deea]">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#a8adb8] text-[#d9deea]">
            <User size={78} strokeWidth={1.5} />
          </div>
        </div>

        {/* Logo text */}
        <div className="absolute right-9 top-8 text-right">
          <div className="relative inline-block">
            <div className="absolute -right-2 -top-2 h-5 w-5 rotate-45 bg-red-600" />
            <div className="absolute -right-5 top-1 h-5 w-5 rotate-45 bg-blue-600" />
            <h1 className="text-4xl font-serif font-bold tracking-wide text-[#173d79]">
              NJIS
            </h1>
          </div>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-wide text-[#173d79]">
            North Jakarta Intercultural School
          </p>
        </div>

        <div className="mx-auto flex max-w-[440px] flex-col gap-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-12 rounded-full bg-[#d3d3d3] px-6 text-center text-3xl text-black outline-none placeholder:text-black focus:ring-4 focus:ring-blue-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-full bg-[#d3d3d3] px-6 text-center text-3xl text-black outline-none placeholder:text-black focus:ring-4 focus:ring-blue-200"
          />

          <button
            type="submit"
            className="mt-6 rounded-full bg-[#071739] px-6 py-3 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-[#12337a]"
          >
            Login
          </button>

          <p className="mt-4 text-center text-xl font-extrabold tracking-wide text-black">
            NJIS MARKETING DEPARTMENT
          </p>
        </div>
      </form>
    </main>
  );
}