import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { formatDate, formatCurrency, daysUntil } from "../utils/format";

const CARD_CONFIG = [
  { key: "totalLeads", label: "Total Leads", icon: UserPlus, color: "text-lattice-600 bg-lattice-50" },
  { key: "newLeads", label: "New Leads", icon: AlertCircle, color: "text-signal-600 bg-signal-50" },
  { key: "totalCustomers", label: "Customers", icon: Users, color: "text-emerald-600 bg-emerald-50" },
  { key: "projectsInProcess", label: "Projects In Process", icon: Clock, color: "text-signal-600 bg-signal-50" },
  { key: "projectsCompleted", label: "Projects Completed", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">A quick look at leads, customers, and what's due soon.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {CARD_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary[key]}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 text-base font-bold text-slate-900">Payments Due in Next 7 Days</h2>
        {summary.upcomingDues.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Nothing due in the next 7 days. 🎉</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {summary.upcomingDues.map((due, i) => {
              const left = daysUntil(due.dueDate);
              return (
                <Link
                  to={`/customers/${due.customer?._id}`}
                  key={i}
                  className="flex items-center justify-between py-3 transition hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{due.customer?.name}</p>
                    <p className="text-xs text-slate-400">{due.label} · Due {formatDate(due.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(due.amount)}</p>
                    <p className={`text-xs font-semibold ${left <= 1 ? "text-red-500" : "text-signal-600"}`}>
                      {left === 0 ? "Due today" : left === 1 ? "Due tomorrow" : `In ${left} days`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
