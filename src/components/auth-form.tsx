"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { savePendingDiagnosticForUser } from "@/lib/supabase/diagnostics";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      window.localStorage.setItem(
        "simple-marketing-hq:user",
        JSON.stringify({ email, name: name || email.split("@")[0], mode, createdAt: new Date().toISOString() }),
      );
      router.push("/dashboard");
      return;
    }

    const response =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name || email.split("@")[0],
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (response.error) {
      setError(response.error.message);
      return;
    }

    window.localStorage.setItem(
      "simple-marketing-hq:user",
      JSON.stringify({ email, name: name || email.split("@")[0], mode, createdAt: new Date().toISOString() }),
    );

    try {
      await savePendingDiagnosticForUser(supabase);
    } catch (saveError) {
      setStatus(`Account created, but the pending diagnostic was not saved yet: ${(saveError as Error).message}`);
      return;
    }

    router.push("/dashboard");
  }

  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">
            {isSignup ? "Create your account and save your Growth Plan." : "Log back into your growth dashboard."}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Create an account to save LaunchPad Diagnostics, business profiles, and customer dashboard history in Supabase.
          </p>
        </section>
        <form onSubmit={submitForm} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-semibold text-slate-950">{isSignup ? "Sign up" : "Login"}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isSignup ? "Start free. Upgrade paths are ready for paid plans later." : "Use the same email you started with."}
          </p>
          {isSignup ? (
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                placeholder="Your name"
              />
            </label>
          ) : null}
          <label className="mt-5 block text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              placeholder="you@company.com"
            />
          </label>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            Password
            <input
              required
              type="password"
              value={password}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              placeholder="At least 6 characters"
            />
          </label>
          {!isSignup ? (
            <div className="mt-3 text-right">
              <Link className="text-sm font-semibold text-cyan-800" href="/forgot-password">
                Forgot password?
              </Link>
            </div>
          ) : null}
          <button className="mt-6 w-full rounded-md bg-cyan-900 px-4 py-3 font-semibold text-white transition hover:bg-cyan-800">
            {isSignup ? "Create account" : "Login"}
          </button>
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          {status ? <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-800">{status}</p> : null}
          <p className="mt-4 text-center text-sm text-slate-600">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-semibold text-cyan-800" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Login" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
