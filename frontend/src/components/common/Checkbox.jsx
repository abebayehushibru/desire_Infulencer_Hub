import { Check } from "lucide-react";

const Checkbox = ({
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="flex-1">
      <label
        className={`flex items-center gap-3 cursor-pointer select-none ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        {/* Hidden Input */}
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer hidden"
          {...props}
        />

        {/* Custom Checkbox */}
        <div
          className={`
            flex h-4 w-4 items-center justify-center rounded-md border-2
            transition-all duration-200

            ${
              checked
                ? "border-transparent bg-gradient-to-r from-primary to-secondary text-white"
                : "border-gray-300 bg-white"
            }

            peer-focus:ring-2 peer-focus:ring-primary
          `}
        >
          {checked && <Check size={12} strokeWidth={5} />}
        </div>

        {/* Label */}
        {label && (
          <span className="text-xs text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
        )}
      </label>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Checkbox;