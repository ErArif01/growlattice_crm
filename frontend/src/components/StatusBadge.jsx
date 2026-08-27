// Central place mapping every status string in the app to a color, so
// "Paid" is always the same green everywhere, "Overdue" always the same red, etc.
const STYLES = {
  // Lead statuses
  New: "bg-lattice-50 text-lattice-700",
  Contacted: "bg-sky-50 text-sky-700",
  Qualified: "bg-signal-50 text-signal-600",
  Converted: "bg-emerald-50 text-emerald-700",
  Lost: "bg-slate-100 text-slate-500",
  // Project statuses
  "In Process": "bg-signal-50 text-signal-600",
  Completed: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-slate-100 text-slate-500",
  // Installment statuses
  Pending: "bg-signal-50 text-signal-600",
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-600",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}
