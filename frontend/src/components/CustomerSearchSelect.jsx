import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import api from "../api/axios";

export default function CustomerSearchSelect({ selected, onSelect, placeholder = "Search customer by name, phone..." }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/customers", { params: query ? { search: query } : {} });
        setResults(res.data.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, open]);

  function handlePick(customer) {
    onSelect(customer);
    setOpen(false);
    setQuery("");
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:px-3.5 sm:py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{selected.name}</p>
          <p className="truncate text-xs text-slate-400">
            {selected.phone}
            {selected.company ? ` · ${selected.company}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="ml-2 flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 touch-manipulation"
          aria-label="Change customer"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={boxRef}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-3.5" />
        <input
          type="text"
          className="w-full input-field pl-9 text-sm sm:pl-10 sm:text-base"
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>
      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl">
          {loading ? (
            <p className="p-3 text-center text-xs text-slate-400 sm:p-3.5">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-center text-xs text-slate-400 sm:p-3.5">No customers found.</p>
          ) : (
            results.map((c) => (
              <button
                type="button"
                key={c._id}
                onClick={() => handlePick(c)}
                className="flex w-full flex-col items-start px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 active:bg-slate-100 touch-manipulation sm:px-3.5"
              >
                <span className="font-medium text-slate-800">{c.name}</span>
                <span className="text-xs text-slate-400">
                  {c.phone}
                  {c.company ? ` · ${c.company}` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}