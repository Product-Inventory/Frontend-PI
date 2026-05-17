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

  if (!open) return null;

  return (
    <div className="app-alert-overlay--module absolute inset-0 z-[2147483647] flex items-center justify-center rounded-[40px]">
      <div className="app-modal-shell app-modal-shell--tight glass-card relative overflow-hidden rounded-[40px] p-6">
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
    </div>
  );
}