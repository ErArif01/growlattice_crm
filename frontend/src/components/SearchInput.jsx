import { Search } from "lucide-react";
import { useState, useEffect } from "react";

// Waits 350ms after the user stops typing before firing onSearch, so we're
// not hitting the API on every single keystroke while someone is typing a name.
export default function SearchInput({ placeholder = "Search...", onSearch }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), 350);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
      />
    </div>
  );
}
