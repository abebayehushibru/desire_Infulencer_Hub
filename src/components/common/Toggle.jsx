const  Toggle=({ checked, onChange, label, description })=> {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative cursor-pointer h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all transition-transform easy-in-out duration-150 ${
            checked ? "translate-x-0" : "-translate-x-5"
          }`}
        />
      </button>
    </div>
  );
}

export default Toggle