"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(prev - 2, 0));
    }, duration / 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-white/30" : type === "error" ? "bg-red-500/30" : "bg-blue-500/30";
  const borderColor = type === "success" ? "border-white/40" : type === "error" ? "border-red-500/40" : "border-blue-500/40";
  const progressColor = type === "success" ? "bg-gradient-to-r from-cyan-300 to-pink-400" : type === "error" ? "bg-red-400" : "bg-blue-400";
  const textColor = type === "success" ? "text-slate-900" : type === "error" ? "text-red-100" : "text-blue-100";
  const subTextColor = type === "success" ? "text-slate-600" : type === "error" ? "text-red-200" : "text-blue-200";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-black/40">
      <div className={`${bgColor} ${borderColor} backdrop-blur-xl border rounded-3xl px-10 py-7 w-full max-w-md shadow-2xl`}>
        <h2 className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
          {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"} {message}
        </h2>
        <p className={`mt-2 text-sm ${subTextColor}`}>
          Loading platform...
        </p>
        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className={`${progressColor} h-full rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
