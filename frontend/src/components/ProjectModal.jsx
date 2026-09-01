import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import api from "../api/axios";
import Modal from "./Modal";
import CustomerSearchSelect from "./CustomerSearchSelect";
import { useToast } from "../context/ToastContext";

const STATUSES = ["In Process", "Completed", "On Hold"];

export default function ProjectModal({ customerId, project, onClose, onSaved }) {
  const { showToast } = useToast();
  const isEditing = Boolean(project?._id);
  const needsCustomerPick = !customerId && !isEditing;

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [addingOption, setAddingOption] = useState(false);

  const [form, setForm] = useState({
    title: project?.title || "",
    requirements: project?.requirements || [],
    status: project?.status || "In Process",
    notes: project?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/requirements").then((res) => setOptions(res.data));
  }, []);

  function toggleRequirement(name) {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.includes(name)
        ? f.requirements.filter((r) => r !== name)
        : [...f.requirements, name],
    }));
  }

  async function handleAddOption() {
    const name = newOption.trim();
    if (!name) return;
    setAddingOption(true);
    try {
      const res = await api.post("/requirements", { name });
      setOptions((prev) =>
        prev.some((o) => o.name.toLowerCase() === res.data.name.toLowerCase()) ? prev : [...prev, res.data]
      );
      setForm((f) => (f.requirements.includes(res.data.name) ? f : { ...f, requirements: [...f.requirements, res.data.name] }));
      setNewOption("");
    } catch {
      showToast("Failed to add option", "error");
    } finally {
      setAddingOption(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    const targetCustomerId = customerId || selectedCustomer?._id;
    if (needsCustomerPick && !targetCustomerId) {
      showToast("Select a customer first", "error");
      return;
    }
    if (form.requirements.length === 0) {
      showToast("Select at least one requirement", "error");
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/projects/${project._id}`, form);
        showToast("Project updated");
      } else {
        await api.post("/projects", { ...form, customer: targetCustomerId });
        showToast("Project added");
      }
      onSaved(targetCustomerId);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save project", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit Project" : "Add Project"} onClose={onClose} size="lg">
      <form onSubmit={handleSave} className="space-y-4">
        {needsCustomerPick && (
          <div>
            <label className="label text-sm sm:text-base">Customer *</label>
            <CustomerSearchSelect selected={selectedCustomer} onSelect={setSelectedCustomer} />
          </div>
        )}

        <div>
          <label className="label text-sm sm:text-base">Project Title *</label>
          <input
            required
            className="w-full input-field text-sm sm:text-base"
            placeholder="e.g. GermanPurje Website Redesign"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label text-sm sm:text-base">Requirements * (select all that apply)</label>
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-lg border border-slate-200 p-2 sm:gap-2 sm:p-3">
            {options.length === 0 && <p className="text-xs text-slate-400">No options yet - add one below.</p>}
            {options.map((opt) => {
              const selected = form.requirements.includes(opt.name);
              return (
                <button
                  type="button"
                  key={opt._id}
                  onClick={() => toggleRequirement(opt.name)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition touch-manipulation sm:px-3 sm:py-1.5 ${
                    selected
                      ? "border-lattice-700 bg-lattice-700 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-lattice-300"
                  }`}
                >
                  {opt.name}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="flex-1 input-field text-sm sm:text-base"
              placeholder="Not in the list? Type a new requirement..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddOption}
              disabled={addingOption || !newOption.trim()}
              className="btn-secondary w-full sm:w-auto text-sm touch-manipulation"
            >
              <Plus size={15} className="inline mr-1" /> Add
            </button>
          </div>
        </div>

        <div>
          <label className="label text-sm sm:text-base">Status</label>
          <select
            className="w-full input-field text-sm sm:text-base"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm sm:text-base">Requirement / Notes</label>
          <textarea
            rows={3}
            className="w-full input-field text-sm sm:text-base"
            placeholder="Anything specific the customer asked for..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary w-full sm:w-auto text-sm touch-manipulation" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto text-sm touch-manipulation">
            {saving ? "Saving..." : "Save Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}




// import { useState, useEffect } from "react";
// import { Plus } from "lucide-react";
// import api from "../api/axios";
// import Modal from "./Modal";
// import { useToast } from "../context/ToastContext";

// const STATUSES = ["In Process", "Completed", "On Hold"];

// export default function ProjectModal({ customerId, project, onClose, onSaved }) {
//   const { showToast } = useToast();
//   const isEditing = Boolean(project?._id);

//   const [options, setOptions] = useState([]);
//   const [newOption, setNewOption] = useState("");
//   const [addingOption, setAddingOption] = useState(false);

//   const [form, setForm] = useState({
//     title: project?.title || "",
//     requirements: project?.requirements || [],
//     status: project?.status || "In Process",
//     notes: project?.notes || "",
//   });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     api.get("/requirements").then((res) => setOptions(res.data));
//   }, []);

//   function toggleRequirement(name) {
//     setForm((f) => ({
//       ...f,
//       requirements: f.requirements.includes(name)
//         ? f.requirements.filter((r) => r !== name)
//         : [...f.requirements, name],
//     }));
//   }

//   async function handleAddOption() {
//     const name = newOption.trim();
//     if (!name) return;
//     setAddingOption(true);
//     try {
//       const res = await api.post("/requirements", { name });
//       setOptions((prev) =>
//         prev.some((o) => o.name.toLowerCase() === res.data.name.toLowerCase()) ? prev : [...prev, res.data]
//       );
//       setForm((f) => (f.requirements.includes(res.data.name) ? f : { ...f, requirements: [...f.requirements, res.data.name] }));
//       setNewOption("");
//     } catch {
//       showToast("Failed to add option", "error");
//     } finally {
//       setAddingOption(false);
//     }
//   }

//   async function handleSave(e) {
//     e.preventDefault();
//     if (form.requirements.length === 0) {
//       showToast("Select at least one requirement", "error");
//       return;
//     }
//     setSaving(true);
//     try {
//       if (isEditing) {
//         await api.put(`/projects/${project._id}`, form);
//         showToast("Project updated");
//       } else {
//         await api.post("/projects", { ...form, customer: customerId });
//         showToast("Project added");
//       }
//       onSaved();
//     } catch (err) {
//       showToast(err.response?.data?.message || "Failed to save project", "error");
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <Modal title={isEditing ? "Edit Project" : "Add Project"} onClose={onClose} size="lg">
//       <form onSubmit={handleSave}>
//         <div className="mb-4">
//           <label className="label">Project Title *</label>
//           <input
//             required
//             className="input-field"
//             placeholder="e.g. GermanPurje Website Redesign"
//             value={form.title}
//             onChange={(e) => setForm({ ...form, title: e.target.value })}
//           />
//         </div>

//         <div className="mb-4">
//           <label className="label">Requirements * (select all that apply)</label>
//           <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
//             {options.length === 0 && <p className="text-xs text-slate-400">No options yet - add one below.</p>}
//             {options.map((opt) => {
//               const selected = form.requirements.includes(opt.name);
//               return (
//                 <button
//                   type="button"
//                   key={opt._id}
//                   onClick={() => toggleRequirement(opt.name)}
//                   className={`rounded-full border px-2.5 py-1 text-xs font-medium transition sm:px-3 ${
//                     selected
//                       ? "border-lattice-700 bg-lattice-700 text-white"
//                       : "border-slate-200 bg-white text-slate-600 hover:border-lattice-300"
//                   }`}
//                 >
//                   {opt.name}
//                 </button>
//               );
//             })}
//           </div>
//           <div className="flex flex-col gap-2 sm:flex-row">
//             <input
//               className="input-field"
//               placeholder="Not in the list? Type a new requirement..."
//               value={newOption}
//               onChange={(e) => setNewOption(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   handleAddOption();
//                 }
//               }}
//             />
//             <button
//               type="button"
//               onClick={handleAddOption}
//               disabled={addingOption || !newOption.trim()}
//               className="btn-secondary flex-shrink-0 w-full sm:w-auto"
//             >
//               <Plus size={15} /> Add
//             </button>
//           </div>
//         </div>

//         <div className="mb-4">
//           <label className="label">Status</label>
//           <select
//             className="input-field"
//             value={form.status}
//             onChange={(e) => setForm({ ...form, status: e.target.value })}
//           >
//             {STATUSES.map((s) => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-6">
//           <label className="label">Requirement / Notes</label>
//           <textarea
//             rows={3}
//             className="input-field"
//             placeholder="Anything specific the customer asked for..."
//             value={form.notes}
//             onChange={(e) => setForm({ ...form, notes: e.target.value })}
//           />
//         </div>

//         <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//           <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onClose}>
//             Cancel
//           </button>
//           <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
//             {saving ? "Saving..." : "Save Project"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// }

















// // import { useState, useEffect } from "react";
// // import { Plus } from "lucide-react";
// // import api from "../api/axios";
// // import Modal from "./Modal";
// // import { useToast } from "../context/ToastContext";

// // const STATUSES = ["In Process", "Completed", "On Hold"];

// // export default function ProjectModal({ customerId, project, onClose, onSaved }) {
// //   const { showToast } = useToast();
// //   const isEditing = Boolean(project?._id);

// //   const [options, setOptions] = useState([]);
// //   const [newOption, setNewOption] = useState("");
// //   const [addingOption, setAddingOption] = useState(false);

// //   const [form, setForm] = useState({
// //     title: project?.title || "",
// //     requirements: project?.requirements || [],
// //     status: project?.status || "In Process",
// //     notes: project?.notes || "",
// //   });
// //   const [saving, setSaving] = useState(false);

// //   useEffect(() => {
// //     api.get("/requirements").then((res) => setOptions(res.data));
// //   }, []);

// //   function toggleRequirement(name) {
// //     setForm((f) => ({
// //       ...f,
// //       requirements: f.requirements.includes(name)
// //         ? f.requirements.filter((r) => r !== name)
// //         : [...f.requirements, name],
// //     }));
// //   }

// //   // "Add to dropdown if it's not already there" - the backend handles the
// //   // dedupe (case-insensitive), so this can be called freely.
// //   async function handleAddOption() {
// //     const name = newOption.trim();
// //     if (!name) return;
// //     setAddingOption(true);
// //     try {
// //       const res = await api.post("/requirements", { name });
// //       setOptions((prev) =>
// //         prev.some((o) => o.name.toLowerCase() === res.data.name.toLowerCase()) ? prev : [...prev, res.data]
// //       );
// //       setForm((f) => (f.requirements.includes(res.data.name) ? f : { ...f, requirements: [...f.requirements, res.data.name] }));
// //       setNewOption("");
// //     } catch {
// //       showToast("Failed to add option", "error");
// //     } finally {
// //       setAddingOption(false);
// //     }
// //   }

// //   async function handleSave(e) {
// //     e.preventDefault();
// //     if (form.requirements.length === 0) {
// //       showToast("Select at least one requirement", "error");
// //       return;
// //     }
// //     setSaving(true);
// //     try {
// //       if (isEditing) {
// //         await api.put(`/projects/${project._id}`, form);
// //         showToast("Project updated");
// //       } else {
// //         await api.post("/projects", { ...form, customer: customerId });
// //         showToast("Project added");
// //       }
// //       onSaved();
// //     } catch (err) {
// //       showToast(err.response?.data?.message || "Failed to save project", "error");
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   return (
// //     <Modal title={isEditing ? "Edit Project" : "Add Project"} onClose={onClose} size="lg">
// //       <form onSubmit={handleSave}>
// //         <div className="mb-4">
// //           <label className="label">Project Title *</label>
// //           <input
// //             required
// //             className="input-field"
// //             placeholder="e.g. GermanPurje Website Redesign"
// //             value={form.title}
// //             onChange={(e) => setForm({ ...form, title: e.target.value })}
// //           />
// //         </div>

// //         <div className="mb-4">
// //           <label className="label">Requirements * (select all that apply)</label>
// //           <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
// //             {options.length === 0 && <p className="text-xs text-slate-400">No options yet - add one below.</p>}
// //             {options.map((opt) => {
// //               const selected = form.requirements.includes(opt.name);
// //               return (
// //                 <button
// //                   type="button"
// //                   key={opt._id}
// //                   onClick={() => toggleRequirement(opt.name)}
// //                   className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
// //                     selected
// //                       ? "border-lattice-700 bg-lattice-700 text-white"
// //                       : "border-slate-200 bg-white text-slate-600 hover:border-lattice-300"
// //                   }`}
// //                 >
// //                   {opt.name}
// //                 </button>
// //               );
// //             })}
// //           </div>
// //           <div className="flex gap-2">
// //             <input
// //               className="input-field"
// //               placeholder="Not in the list? Type a new requirement..."
// //               value={newOption}
// //               onChange={(e) => setNewOption(e.target.value)}
// //               onKeyDown={(e) => {
// //                 if (e.key === "Enter") {
// //                   e.preventDefault();
// //                   handleAddOption();
// //                 }
// //               }}
// //             />
// //             <button
// //               type="button"
// //               onClick={handleAddOption}
// //               disabled={addingOption || !newOption.trim()}
// //               className="btn-secondary flex-shrink-0"
// //             >
// //               <Plus size={15} /> Add
// //             </button>
// //           </div>
// //         </div>

// //         <div className="mb-4">
// //           <label className="label">Status</label>
// //           <select
// //             className="input-field"
// //             value={form.status}
// //             onChange={(e) => setForm({ ...form, status: e.target.value })}
// //           >
// //             {STATUSES.map((s) => (
// //               <option key={s} value={s}>{s}</option>
// //             ))}
// //           </select>
// //         </div>

// //         <div className="mb-6">
// //           <label className="label">Requirement / Notes</label>
// //           <textarea
// //             rows={3}
// //             className="input-field"
// //             placeholder="Anything specific the customer asked for..."
// //             value={form.notes}
// //             onChange={(e) => setForm({ ...form, notes: e.target.value })}
// //           />
// //         </div>

// //         <div className="flex justify-end gap-2">
// //           <button type="button" className="btn-secondary" onClick={onClose}>
// //             Cancel
// //           </button>
// //           <button type="submit" disabled={saving} className="btn-primary">
// //             {saving ? "Saving..." : "Save Project"}
// //           </button>
// //         </div>
// //       </form>
// //     </Modal>
// //   );
// // }
