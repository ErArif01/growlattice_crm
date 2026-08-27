import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Phone, Mail, Building2, MapPin, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import ProjectModal from "../components/ProjectModal";
import PaymentModal from "../components/PaymentModal";
import MarkPaidModal from "../components/MarkPaidModal";
import { formatDate, formatCurrency } from "../utils/format";
import { useToast } from "../context/ToastContext";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null); // { customer, projects, payments }
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("projects");

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [deleteCustomerConfirm, setDeleteCustomerConfirm] = useState(false);

  const [projectModal, setProjectModal] = useState(null); // null closed, {} new, {...} editing
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deletePaymentTarget, setDeletePaymentTarget] = useState(null);
  const [markPaidTarget, setMarkPaidTarget] = useState(null); // { payment, installment }

  const loadData = useCallback(async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setData(res.data);
    } catch {
      showToast("Failed to load customer", "error");
      navigate("/customers");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openEditCustomer() {
    setCustomerForm({
      name: data.customer.name,
      phone: data.customer.phone,
      email: data.customer.email || "",
      company: data.customer.company || "",
      address: data.customer.address || "",
      notes: data.customer.notes || "",
    });
    setEditingCustomer(true);
  }

  async function handleSaveCustomer(e) {
    e.preventDefault();
    setSavingCustomer(true);
    try {
      await api.put(`/customers/${id}`, customerForm);
      showToast("Customer updated");
      setEditingCustomer(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update customer", "error");
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleDeleteCustomer() {
    try {
      await api.delete(`/customers/${id}`);
      showToast("Customer deleted");
      navigate("/customers");
    } catch {
      showToast("Failed to delete customer", "error");
    }
  }

  async function handleDeleteProject() {
    try {
      await api.delete(`/projects/${deleteProjectTarget._id}`);
      showToast("Project deleted");
      setDeleteProjectTarget(null);
      loadData();
    } catch {
      showToast("Failed to delete project", "error");
    }
  }

  async function handleDeletePayment() {
    try {
      await api.delete(`/payments/${deletePaymentTarget._id}`);
      showToast("Payment deleted");
      setDeletePaymentTarget(null);
      loadData();
    } catch {
      showToast("Failed to delete payment", "error");
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading customer...</p>;
  if (!data) return null;

  const { customer, projects, payments } = data;

  return (
    <div>
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back to Customers
      </Link>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Customer info card */}
        <div className="card lg:col-span-1">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lattice-100 text-lg font-bold text-lattice-700">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex gap-1">
              <button onClick={openEditCustomer} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <Pencil size={15} />
              </button>
              <button onClick={() => setDeleteCustomerConfirm(true)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <h1 className="text-lg font-bold text-slate-900">{customer.name}</h1>
          {customer.company && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 size={13} /> {customer.company}
            </p>
          )}
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" /> {customer.phone}
            </p>
            {customer.email && (
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" /> {customer.email}
              </p>
            )}
            {customer.address && (
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" /> {customer.address}
              </p>
            )}
          </div>
          {customer.notes && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="mb-1 font-semibold uppercase tracking-wide text-slate-400">Notes</p>
              {customer.notes}
            </div>
          )}
          <p className="mt-4 text-xs text-slate-400">Customer since {formatDate(customer.createdAt)}</p>
        </div>

        {/* Tabs content */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("projects")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "projects" ? "bg-lattice-700 text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setTab("payments")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "payments" ? "bg-lattice-700 text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              Payments ({payments.length})
            </button>
          </div>

          {tab === "projects" && (
            <div>
              <div className="mb-3 flex justify-end">
                <button onClick={() => setProjectModal({})} className="btn-primary">
                  <Plus size={16} /> Add Project
                </button>
              </div>
              {projects.length === 0 ? (
                <div className="card py-10 text-center text-sm text-slate-400">No projects yet for this customer.</div>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p._id} className="card">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{p.title}</h3>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {p.requirements.map((r) => (
                              <span key={r} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={p.status} />
                          <button onClick={() => setProjectModal(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteProjectTarget(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {p.notes && <p className="mt-2 text-sm text-slate-500">{p.notes}</p>}
                      <p className="mt-3 text-xs text-slate-400">
                        Started {formatDate(p.startDate)}
                        {p.completedDate && <> · Completed {formatDate(p.completedDate)}</>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "payments" && (
            <div>
              <div className="mb-3 flex justify-end">
                <button onClick={() => setPaymentModalOpen(true)} className="btn-primary">
                  <Plus size={16} /> Add Payment
                </button>
              </div>
              {payments.length === 0 ? (
                <div className="card py-10 text-center text-sm text-slate-400">No payments recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {payments.map((pay) => (
                    <div key={pay._id} className="card">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{formatCurrency(pay.totalAmount)}</p>
                          <p className="text-xs text-slate-400">{pay.paymentType}</p>
                        </div>
                        <button onClick={() => setDeletePaymentTarget(pay)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="divide-y divide-slate-50 border-t border-slate-100">
                        {pay.installments.map((inst) => (
                          <div key={inst._id} className="flex items-center justify-between py-2.5">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{inst.label}</p>
                              <p className="text-xs text-slate-400">
                                Due {formatDate(inst.dueDate)}
                                {inst.status === "Paid" && <> · Paid {formatDate(inst.paidDate)}</>}
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm font-semibold text-slate-800">{formatCurrency(inst.amount)}</span>
                              <StatusBadge status={inst.status} />
                              {inst.status !== "Paid" && (
                                <button
                                  onClick={() => setMarkPaidTarget({ payment: pay, installment: inst })}
                                  className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50"
                                  title="Mark as paid"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {pay.notes && <p className="mt-2 text-xs text-slate-400">{pay.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit customer modal */}
      {editingCustomer && customerForm && (
        <Modal title="Edit Customer" onClose={() => setEditingCustomer(false)}>
          <form onSubmit={handleSaveCustomer}>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input required className="input-field" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input required className="input-field" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input-field" value={customerForm.company} onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })} />
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Address</label>
              <input className="input-field" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} />
            </div>
            <div className="mb-6">
              <label className="label">Notes</label>
              <textarea rows={3} className="input-field" value={customerForm.notes} onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditingCustomer(false)}>Cancel</button>
              <button type="submit" disabled={savingCustomer} className="btn-primary">{savingCustomer ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteCustomerConfirm && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Delete "${customer.name}"? Their projects and payment records will be deleted too. This cannot be undone.`}
          onConfirm={handleDeleteCustomer}
          onCancel={() => setDeleteCustomerConfirm(false)}
        />
      )}

      {projectModal && (
        <ProjectModal
          customerId={id}
          project={projectModal._id ? projectModal : null}
          onClose={() => setProjectModal(null)}
          onSaved={() => {
            setProjectModal(null);
            loadData();
          }}
        />
      )}

      {deleteProjectTarget && (
        <ConfirmDialog
          title="Delete Project"
          message={`Delete "${deleteProjectTarget.title}"? This cannot be undone.`}
          onConfirm={handleDeleteProject}
          onCancel={() => setDeleteProjectTarget(null)}
        />
      )}

      {paymentModalOpen && (
        <PaymentModal
          customerId={id}
          projects={projects}
          onClose={() => setPaymentModalOpen(false)}
          onSaved={() => {
            setPaymentModalOpen(false);
            loadData();
          }}
        />
      )}

      {deletePaymentTarget && (
        <ConfirmDialog
          title="Delete Payment"
          message="Delete this payment record? This cannot be undone."
          onConfirm={handleDeletePayment}
          onCancel={() => setDeletePaymentTarget(null)}
        />
      )}

      {markPaidTarget && (
        <MarkPaidModal
          payment={markPaidTarget.payment}
          installment={markPaidTarget.installment}
          onClose={() => setMarkPaidTarget(null)}
          onSaved={() => {
            setMarkPaidTarget(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
