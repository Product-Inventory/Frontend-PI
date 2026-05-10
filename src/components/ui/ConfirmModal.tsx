interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="glass-card rounded-2xl p-6 w-96">

        <h2 className="text-xl font-semibold text-white mb-3">
          {title}
        </h2>

        <p className="text-white/80 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={onCancel}
            className="px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2"
          >
            Confirm
          </button>

        </div>
      </div>
    </div>
  );
}