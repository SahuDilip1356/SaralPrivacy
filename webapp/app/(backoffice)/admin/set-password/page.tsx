"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const MIN_PASSWORD = 12;

/**
 * /admin/set-password?token_hash=…&type=invite|recovery
 * Completes a Supabase invite (first password) or a password reset. The link
 * is generated server-side and emailed by us — see lib/auth/adminAuth.ts.
 */
function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const tokenHash = searchParams.get("token_hash") || "";
  const rawType   = searchParams.get("type") || "invite";
  const type      = rawType === "recovery" ? "recovery" : "invite";
  const isReset   = type === "recovery";

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState(false);

  useEffect(() => {
    if (!tokenHash) setError("Invalid link. Please contact the admin for a new one.");
  }, [tokenHash]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token_hash: tokenHash, type, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/admin/login"), 3000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {isReset ? "Password updated" : "Account activated!"}
        </h2>
        <p className="text-sm text-slate-500">
          Redirecting you to sign in{isReset ? "" : " — you'll set up your verification app there"}…
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">
          {isReset ? "Choose a new password" : "Set your password"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isReset
            ? "You're resetting the password for your SaralPrivacy admin account."
            : "You're setting up your SaralPrivacy account. After this you'll sign in with your password and a code from an authenticator app."}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Minimum ${MIN_PASSWORD} characters`}
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !tokenHash}
          className="w-full py-2.5 rounded-lg bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : isReset ? "Update Password" : "Activate My Account"}
        </button>
      </form>
    </>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-[96px]">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-navy-700">
              Saral<span className="text-saffron-500">Privacy</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">Account Setup</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
            <SetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Having trouble?{" "}
          <a href="mailto:dilip.sahu@gmail.com" className="text-navy-600 hover:underline">
            Contact admin
          </a>
        </p>
      </div>
    </div>
  );
}
