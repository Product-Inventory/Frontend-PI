"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { Toast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const setSession = useAuthStore((state) => state.setSession);
  const setLoginSuccessPending = useAuthStore((state) => state.setLoginSuccessPending);

  const handleSuccessClose = () => {
    setLoginSuccessPending(false);
    router.replace("/dashboard");
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authService.login({ usuario, password });
      setSession(res.token, res.user);
      setLoginSuccessPending(true);
      setShowSuccess(true);
    } catch {
      setLoginSuccessPending(false);
      setError("Incorrect credentials");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <main className="app-atmosphere flex min-h-screen items-center justify-center px-4 py-10">
        <Toast
          message="Successful login"
          type="success"
          duration={1000}
          overlayClassName="app-alert-overlay--login"
          onClose={handleSuccessClose}
        />
      </main>
    );
  }

  return (
    <main className="app-atmosphere flex min-h-screen items-center justify-center px-4 py-10">
      {error && (
        <Toast
          message={error}
          type="error"
          duration={1000}
          onClose={() => setError("")}
        />
      )}
      <section className="app-shell glass-card w-full max-w-[420px] rounded-[28px] px-7 py-8 sm:px-8 sm:py-9">
        <div className="mb-8 flex justify-center">
          <div className="glass-chip flex h-20 w-20 items-center justify-center rounded-3xl">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3 4 7.5 12 12l8-4.5L12 3Z" />
              <path d="M4 16.5 12 21l8-4.5" />
              <path d="M4 7.5V16.5L12 21V12" />
              <path d="M20 7.5V16.5L12 21" />
            </svg>
          </div>
        </div>

        <header className="text-center">
          <h1 className="text-[2rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.15rem]">
            Inventory Pro
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Sign in to continue
          </p>
        </header>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
              Username
            </span>
            <div className="glass-input flex items-center gap-3 rounded-2xl px-4 py-3">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="8" r="4" />
              </svg>
              <input
                type="text"
                placeholder="Username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
              Password
            </span>
            <div className="glass-input flex items-center gap-3 rounded-2xl px-4 py-3">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                <rect x="5" y="10" width="14" height="10" rx="3" />
                <path d="M12 14v2" />
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          <button className="signin-btn w-full py-3 text-base" disabled={loading}>
            {loading ? "Loading..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}