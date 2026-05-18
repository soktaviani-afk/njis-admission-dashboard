"use client";

import Image from "next/image";
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
      {/* Background image */}
      <Image
        src="/njis-login-bg.png"
        alt="NJIS background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[#061b54]/20" />

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

        {/* Logo */}
        <div className="absolute right-8 top-8">
          <Image
            src="/njis-logo.png"
            alt="NJIS logo"
            width={130}
            height={70}
            priority
            className="h-auto w-[130px]"
          />
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