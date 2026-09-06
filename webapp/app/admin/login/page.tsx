"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";

/**
 * Admin login — three screens, one page (Blueprint P3):
 *   password → (first time) scan QR + code | (returning) code → dashboard
 * The API decides which second screen applies; this page never guesses.
 */
type Step = "password" | "enroll" | "verify";

interface Enrollment {
  factorId: string;
  qr: string;     // SVG data URL (or raw SVG) from Supabase
  secret: string; // manual-entry fallback
}

function qrSrc(qr: string): string {
  return qr.startsWith("data:") ? qr : `data:image/svg+xml;utf-8,${encodeURIComponent(qr)}`;
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
const buttonClass =
  "w-full py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60";

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep]         = useState<Step>("password");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [code, setCode]         = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function backToPassword(message?: string) {
    setStep("password");
    setPassword("");
    setCode("");
    setEnrollment(null);
    setError(message ?? "");
  }

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function startEnrollment() {
    const { ok, data } = await post("/api/admin/mfa/enroll", {});
    if (ok) {
      setEnrollment({ factorId: data.factorId, qr: data.qr, secret: data.secret });
      setStep("enroll");
    } else if (data.step === "verify") {
      setStep("verify");
    } else if (data.step === "login") {
      backToPassword(data.error);
    } else {
      setError(data.error || "Could not start verification setup.");
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { ok, data } = await post("/api/admin/login", { email, password });
      if (!ok) {
        setError(data.error || "Login failed.");
      } else if (data.step === "enroll") {
        await startEnrollment();
      } else {
        setStep("verify");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { ok, data } = await post("/api/admin/mfa/verify", {
        code,
        ...(enrollment ? { factorId: enrollment.factorId } : {}),
      });
      if (ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      if (data.step === "login") backToPassword(data.error);
      else if (data.step === "enroll") await startEnrollment();
      else { setError(data.error || "Verification failed."); setCode(""); }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="SaralPrivacy"
            width={180}
            height={72}
            className="h-16 w-auto object-contain mx-auto mb-3"
            priority
          />
          <p className="text-slate-500 text-sm">Admin Dashboard</p>
        </div>

        {step === "password" && (
          <form
            onSubmit={handlePassword}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400"
                  tabIndex={-1}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>
        )}

        {step === "enroll" && enrollment && (
          <form
            onSubmit={handleCode}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-navy-700">Set up your verification app</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  One-time step. Scan this code with Google Authenticator, 1Password, Authy or any TOTP app, then enter the 6-digit code it shows.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc(enrollment.qr)}
                alt="QR code for your authenticator app"
                width={192}
                height={192}
                className="rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer select-none">Can&apos;t scan? Enter the key manually</summary>
              <code className="block mt-2 p-2 rounded bg-slate-50 border border-slate-200 break-all text-slate-700">
                {enrollment.secret}
              </code>
            </details>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} tracking-[0.3em] text-center font-mono`}
                placeholder="000000"
                required
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
              {loading ? "Verifying…" : "Activate & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => backToPassword()}
              className="w-full text-xs text-slate-400 hover:text-slate-600"
            >
              Start over
            </button>
          </form>
        )}

        {step === "verify" && (
          <form
            onSubmit={handleCode}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-navy-700">Two-step verification</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} tracking-[0.3em] text-center font-mono`}
                placeholder="000000"
                required
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
              {loading ? "Verifying…" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => backToPassword()}
              className="w-full text-xs text-slate-400 hover:text-slate-600"
            >
              Use a different account
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          SaralPrivacy · DPDPA Compliance Platform
        </p>
      </div>
    </div>
  );
}
