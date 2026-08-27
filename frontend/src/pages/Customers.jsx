import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Phone, Mail, Building2 } from "lucide-react";
import api from "../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";
import { formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";

const EMPTY_FORM = { name: "", phone: "", email: "", company: "", address: "", notes: "" };

export default function Customers() {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await api.get("/customers", { params });
      setCustomers(res.data);
    } catch {
      showToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openAddModal() {
    setForm(EMPTY_FORM);
    setEditingCustomer({});
  }

  function openEditModal(customer, e) {
    e.preventDefault(); // stop the row's <Link> from navigating away
    e.stopPropagation();
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      company: customer.company || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setEditingCustomer(customer);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCustomer._id) {
        await api.put(`/customers/${editingCustomer._id}`, form);
        showToast("Customer updated");
      } else {
        await api.post("/customers", form);
        showToast("Customer added");
      }
      setEditingCustomer(null);
      loadCustomers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save customer", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      showToast("Customer deleted");
      setDeleteTarget(null);
      loadCustomers();
    } catch {
      showToast("Failed to delete customer", "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer records, projects, and payments.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="mb-4 w-64">
        <SearchInput placeholder="Search name, phone, company..." onSearch={setSearch} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading customers...</p>
      ) : customers.length === 0 ? (
        <div className="card py-10 text-center text-sm text-slate-400">
          No customers yet. Add one directly, or convert a lead from the Leads page.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Link
              to={`/customers/${c._id}`}
              key={c._id}
              className="card group flex flex-col transition hover:border-lattice-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lattice-100 text-sm font-bold text-lattice-700">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={(e) => openEditModal(c, e)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(c);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-slate-900">{c.name}</p>
              {c.company && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 size={12} /> {c.company}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={12} /> {c.phone}
              </p>
              {c.email && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail size={12} /> {c.email}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-400">Added {formatDate(c.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      {editingCustomer && (
        <Modal title={editingCustomer._id ? "Edit Customer" : "Add Customer"} onClose={() => setEditingCustomer(null)}>
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

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Company</label>
                <input
                  className="input-field"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Address</label>
              <input
                className="input-field"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
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
              <button type="button" className="btn-secondary" onClick={() => setEditingCustomer(null)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Delete "${deleteTarget.name}"? Their projects and payment records will be deleted too. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
