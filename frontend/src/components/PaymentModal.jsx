import { useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import api from "../api/axios";
import Modal from "./Modal";
import { useToast } from "../context/ToastContext";

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PaymentModal({ customerId, projects, onClose, onSaved }) {
  const { showToast } = useToast();

  const [paymentType, setPaymentType] = useState("One-Time");
  const [totalAmount, setTotalAmount] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // One-time payment just needs a single due date
  const [oneTimeDueDate, setOneTimeDueDate] = useState(todayISO());

  // Installment plan: an editable list of {label, amount, dueDate}
  const [installments, setInstallments] = useState([
    { label: "Installment 1", amount: "", dueDate: todayISO() },
  ]);
  const [splitCount, setSplitCount] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState(todayISO());

  // Quick helper: "split ₹30,000 into 3 monthly installments starting on X"
  // instead of making the user type out every row by hand - covers the
  // common "customer pays monthly / in 2-3 parts" case in one click.
  function handleAutoSplit() {
    const total = Number(totalAmount);
    if (!total || total <= 0) {
      showToast("Enter the total amount first", "error");
      return;
    }
    const count = Math.max(2, Number(splitCount) || 2);
    const base = Math.floor((total / count) * 100) / 100;
    const rows = [];
    let allocated = 0;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const amount = isLast ? Math.round((total - allocated) * 100) / 100 : base;
      allocated += amount;
      rows.push({
        label: `Installment ${i + 1}`,
        amount,
        dueDate: addMonths(firstDueDate, i),
      });
    }
    setInstallments(rows);
  }

  function updateInstallment(index, field, value) {
    setInstallments((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addInstallmentRow() {
    setInstallments((rows) => [
      ...rows,
      { label: `Installment ${rows.length + 1}`, amount: "", dueDate: todayISO() },
    ]);
  }

  function removeInstallmentRow(index) {
    setInstallments((rows) => rows.filter((_, i) => i !== index));
  }

  const installmentTotal = installments.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const amountsMatch = paymentType === "One-Time" || Math.abs(installmentTotal - Number(totalAmount)) < 0.01;

  async function handleSave(e) {
    e.preventDefault();
    if (!totalAmount || Number(totalAmount) <= 0) {
      showToast("Enter a valid total amount", "error");
      return;
    }
    if (!amountsMatch) {
      showToast(`Installments (₹${installmentTotal}) must add up to the total (₹${totalAmount})`, "error");
      return;
    }

    const finalInstallments =
      paymentType === "One-Time"
        ? [{ label: "Full Payment", amount: Number(totalAmount), dueDate: oneTimeDueDate }]
        : installments.map((r) => ({ ...r, amount: Number(r.amount) }));

    setSaving(true);
    try {
      await api.post("/payments", {
        customer: customerId,
        project: project || null,
        totalAmount: Number(totalAmount),
        paymentType,
        installments: finalInstallments,
        notes,
      });
      showToast("Payment plan added");
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add payment", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Payment" onClose={onClose} size="lg">
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="label">Payment Type</label>
          <div className="flex gap-2">
            {["One-Time", "Installments"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setPaymentType(type)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  paymentType === type
                    ? "border-lattice-700 bg-lattice-700 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {type === "One-Time" ? "One-Time Payment" : "Installments"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label">Total Amount (₹) *</label>
            <input
              required
              type="number"
              min="1"
              className="input-field"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Link to Project (optional)</label>
            <select className="input-field" value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {paymentType === "One-Time" ? (
          <div className="mb-4">
            <label className="label">Due Date *</label>
            <input
              required
              type="date"
              className="input-field"
              value={oneTimeDueDate}
              onChange={(e) => setOneTimeDueDate(e.target.value)}
            />
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="label">Split into</label>
                <input
                  type="number"
                  min="2"
                  className="input-field w-24"
                  value={splitCount}
                  onChange={(e) => setSplitCount(e.target.value)}
                />
              </div>
              <div>
                <label className="label">First due date</label>
                <input
                  type="date"
                  className="input-field"
                  value={firstDueDate}
                  onChange={(e) => setFirstDueDate(e.target.value)}
                />
              </div>
              <button type="button" onClick={handleAutoSplit} className="btn-secondary">
                <Wand2 size={15} /> Auto-split monthly
              </button>
            </div>

            <div className="space-y-2">
              {installments.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="Label"
                    value={row.label}
                    onChange={(e) => updateInstallment(i, "label", e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    className="input-field w-28"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => updateInstallment(i, "amount", e.target.value)}
                  />
                  <input
                    type="date"
                    className="input-field w-40"
                    value={row.dueDate}
                    onChange={(e) => updateInstallment(i, "dueDate", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeInstallmentRow(i)}
                    disabled={installments.length === 1}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addInstallmentRow} className="mt-2 flex items-center gap-1 text-xs font-semibold text-lattice-600 hover:underline">
              <Plus size={13} /> Add another installment
            </button>

            {totalAmount && (
              <p className={`mt-3 text-xs font-medium ${amountsMatch ? "text-emerald-600" : "text-red-500"}`}>
                Installments total: ₹{installmentTotal} {amountsMatch ? "✓ matches" : `(should equal ₹${totalAmount})`}
              </p>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="label">Notes</label>
          <textarea rows={2} className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
