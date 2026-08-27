import { useState } from "react";
import api from "../api/axios";
import Modal from "./Modal";
import { useToast } from "../context/ToastContext";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function MarkPaidModal({ payment, installment, onClose, onSaved }) {
  const { showToast } = useToast();
  const [paidAmount, setPaidAmount] = useState(installment.amount);
  const [paidDate, setPaidDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/payments/${payment._id}/installments/${installment._id}/mark-paid`, {
        paidAmount: Number(paidAmount),
        paidDate,
      });
      showToast(`Marked "${installment.label}" as paid`);
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Mark "${installment.label}" as Paid`} onClose={onClose} size="sm">
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="label">Amount Received (₹)</label>
          <input
            required
            type="number"
            min="0"
            className="input-field"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="label">Date Received</label>
          <input
            required
            type="date"
            className="input-field"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Confirm Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
