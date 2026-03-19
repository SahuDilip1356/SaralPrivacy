"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error || "Login failed.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-pearl-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-700 mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-700">Admin Access</h1>
          <p className="text-pearl-500 text-sm mt-1">DPDPAIndia — Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-pearl-200 p-6 shadow-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-pearl-200 text-sm text-pearl-800 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-3 flex items-center text-pearl-400"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
