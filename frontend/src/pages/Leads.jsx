import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowRightCircle, Phone, Mail } from "lucide-react";
import api from "../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import SearchInput from "../components/SearchInput";
import { formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";

const LEAD_SOURCES = ["Offline", "Instagram", "Facebook", "Twitter", "YouTube", "WhatsApp", "Call", "Other"];
const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

const EMPTY_FORM = { name: "", phone: "", email: "", source: "Offline", interestedIn: "", status: "New", notes: "" };

export default function Leads() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editingLead, setEditingLead] = useState(null); // null = closed, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/leads", { params });
      setLeads(res.data);
    } catch {
      showToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sourceFilter, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  function openAddModal() {
    setForm(EMPTY_FORM);
    setEditingLead({});
  }

  function openEditModal(lead) {
    setForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || "",
      source: lead.source,
      interestedIn: lead.interestedIn || "",
      status: lead.status,
      notes: lead.notes || "",
    });
    setEditingLead(lead);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLead._id) {
        await api.put(`/leads/${editingLead._id}`, form);
        showToast("Lead updated");
      } else {
        await api.post("/leads", form);
        showToast("Lead added");
      }
      setEditingLead(null);
      loadLeads();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save lead", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      showToast("Lead deleted");
      setDeleteTarget(null);
      loadLeads();
    } catch {
      showToast("Failed to delete lead", "error");
    }
  }

  async function handleConvert(lead) {
    try {
      const res = await api.post(`/leads/${lead._id}/convert`);
      showToast(`${lead.name} converted to a customer`);
      navigate(`/customers/${res.data.customer._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to convert lead", "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Every lead, from any channel, in one place.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <SearchInput placeholder="Search name, phone, email..." onSearch={setSearch} />
        </div>
        <select className="input-field w-40" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input-field w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-400">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">
            No leads yet. Click "Add Lead" to create your first one.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Interested In</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Added</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead) => (
                <tr key={lead._id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{lead.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} /> {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                        <Mail size={12} /> {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{lead.source}</td>
                  <td className="px-5 py-3.5 text-slate-500">{lead.interestedIn || "—"}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDate(lead.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {!lead.convertedToCustomer && lead.status !== "Lost" && (
                        <button
                          onClick={() => handleConvert(lead)}
                          title="Convert to Customer"
                          className="rounded-lg p-2 text-emerald-500 transition hover:bg-emerald-50"
                        >
                          <ArrowRightCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(lead)}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(lead)}
                        title="Delete"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingLead && (
        <Modal title={editingLead._id ? "Edit Lead" : "Add Lead"} onClose={() => setEditingLead(null)}>
          <form onSubmit={handleSave}>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input
                  required
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Source *</label>
                <select
                  required
                  className="input-field"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Interested In</label>
              <input
                className="input-field"
                placeholder="e.g. Website + Google Ads"
                value={form.interestedIn}
                onChange={(e) => setForm({ ...form, interestedIn: e.target.value })}
              />
            </div>

            <div className="mb-6">
              <label className="label">Notes</label>
              <textarea
                rows={3}
                className="input-field"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditingLead(null)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Lead"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Lead"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
