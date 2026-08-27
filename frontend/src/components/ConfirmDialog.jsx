import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

// Every destructive delete action in the app routes through this, so a
// misclick can never silently wipe a customer/lead/payment.
export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <p className="pt-1.5 text-sm text-slate-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
