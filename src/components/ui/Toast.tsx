"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
  portal?: boolean;
  overlayClassName?: string;
  shellClassName?: string;
  subtitleClassName?: string;
  progressClassName?: string;
}

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
  portal = true,
  overlayClassName = "",
  shellClassName = "",
  subtitleClassName = "",
  progressClassName = "",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [mounted, setMounted] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(prev - 2, 0));
    }, duration / 50);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!mounted || !isVisible) return null;

  const shellTypeClass = type === "success" ? "app-alert-shell--success" : type === "error" ? "app-alert-shell--error" : "app-alert-shell--info";
  const titleTypeClass = type === "success" ? "app-alert-title--success" : type === "error" ? "app-alert-title--error" : "app-alert-title--info";
  const subtitleTypeClass = type === "success" ? "app-alert-subtitle--success" : type === "error" ? "app-alert-subtitle--error" : "app-alert-subtitle--info";
  const progressTypeClass = type === "success" ? "app-alert-progress--success" : type === "error" ? "app-alert-progress--error" : "app-alert-progress--info";

  const content = (
    <div
      className={
        portal
          ? `app-modal-overlay z-[2147483647] ${overlayClassName}`
          : `absolute inset-0 z-[2147483647] flex items-center justify-center rounded-[40px] ${overlayClassName}`
      }
    >
      <div className={`app-modal-shell app-alert-shell ${shellTypeClass} relative backdrop-blur-xl border px-10 py-7 ${shellClassName}`}>
        <h2 className={`text-2xl font-extrabold tracking-tight ${titleTypeClass}`}>
          {type === "success" ? "✓" : type === "error" ? "" : "ℹ"} {message}
        </h2>
        <p className={`mt-2 text-sm ${subtitleTypeClass} ${subtitleClassName}`}>Loading platform...</p>
        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className={`${progressTypeClass} h-full rounded-full transition-all ${progressClassName}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (!portal) return content;

  return createPortal(content, document.body);

}

}

