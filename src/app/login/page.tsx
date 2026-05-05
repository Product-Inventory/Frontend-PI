"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.login({ usuario, password });
      setSession(res.token, res.user);
      window.location.href = "/dashboard/permissions";
    } catch {
      alert("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400">

      <form
        onSubmit={handleLogin}
        className="w-80 bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/30"
      >
        <h2 className="text-2xl font-semibold text-center text-white mb-4">
          Inventory Pro
        </h2>

        <p className="text-center text-sm text-white/80 mb-6">
          Sign in to continue
        </p>

        <input
          type="text"
          placeholder="Username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-lg bg-white/80 focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/80 focus:outline-none"
          required
        />

        <button
          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}