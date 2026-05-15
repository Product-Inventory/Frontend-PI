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
    <div className="app-modal-overlay">

      <div className="app-modal-shell app-modal-shell--tight glass-card p-6">

        <h2 className="text-3xl font-extrabold text-[#392750] mb-3">
          {title}
        </h2>

        <p className="text-[#392750] mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={onCancel}
            className={`px-4 py-2 ${cancelButtonClassName}`}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${confirmButtonClassName}`}
          >
            Confirm
          </button>

        </div>
      </div>
    </div>
  );
}