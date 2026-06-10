"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable password reset.");
      return;
    }

    setIsSending(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setIsSending(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setStatus("If an account exists for that email, Supabase will send a password reset link.");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-8 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">Reset your password.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Enter the email tied to your Simple Marketing HQ account. We will send a secure link so you can choose a new password.
          </p>
        </section>

        <form onSubmit={requestReset} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-semibold text-slate-950">Forgot password</h2>
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
          <button disabled={isSending} className="mt-6 w-full rounded-md bg-cyan-900 px-4 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50">
            {isSending ? "Sending..." : "Send reset link"}
          </button>
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          {status ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{status}</p> : null}
          <p className="mt-4 text-center text-sm text-slate-600">
            Remembered it?{" "}
            <Link className="font-semibold text-cyan-800" href="/login">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
