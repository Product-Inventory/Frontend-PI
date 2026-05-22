"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonClassName = "",
  cancelButtonClassName = "",
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="app-alert-overlay--module">
      <div className="app-modal-shell app-modal-shell--tight glass-card relative overflow-hidden p-6">
        <h2 className="mb-3 text-3xl font-extrabold text-[#392750]">{title}</h2>
        <p className="mb-6 text-[#392750]">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className={`px-4 py-2 ${cancelButtonClassName}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 ${confirmButtonClassName}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
