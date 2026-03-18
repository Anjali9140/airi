import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function CustomOptions({ label, options, value, onChange, error }) {
  const [open, setOpen] = useState(false);

  const elemRef = useRef();
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (elemRef.current && !elemRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={elemRef}>
      {label && (
        <span className="block text-sm font-medium mb-2">
          {label} {error && <span className="text-border-error">*</span>}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-bg-hover border rounded-lg pl-4 pr-3 py-3 text-sm transition-colors ${
          error ? "border-border-error" : "border-border-default"
        }`}
      >
        {value || "Select..."}
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute mt-2 w-full bg-bg-card border border-border-default rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto lean-slider">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                value === opt
                  ? "bg-bg-hover text-text-primary font-medium"
                  : "text-text-muted hover:bg-bg-hover"
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomOptions;
