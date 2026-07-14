import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, Loader2, CircleAlert } from "lucide-react";

const Select = ({
  label,
  name,
  value,
  onChange,

  // Static Data
  data = [],

  // API
  api,

  // Object Keys
  labelKey = "label",
  valueKey = "value",

  placeholder = "Select...",
  required = false,
  disabled = false,
  error,
  className = "",

  leftIcon,

  ...props
}) => {
  const [options, setOptions] = useState(data);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    // Static data takes priority; only hit the API when no data was given.
    if (data?.length || !api) {
      setOptions(data);
      return;
    }

    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setApiError("");

        const res = await axios.get(api);

        if (mounted) {
          setOptions(res.data || []);
        }
      } catch (err) {
        if (mounted) {
          setApiError(
            err.response?.data?.message || err.message || "Failed to load data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [api, data]);

  const hasError = Boolean(error || apiError);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={`
            peer w-full appearance-none rounded-lg border bg-white py-2.5
            text-sm text-gray-800 outline-none transition-all duration-200

             focus:ring-2 focus:ring-primary/20

            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400

            ${leftIcon ? "pl-10" : "pl-3.5"}
            pr-10

            ${hasError ? "border-red-400" : "border-gray-200 hover:border-gray-300"}

            ${className}
          `}
          {...props}
        >
          <option value="" disabled={required} hidden={required}>
            {loading ? "Loading..." : placeholder}
          </option>
          {typeof(options) === 'array' && options.map((item) => (
            <option key={item[valueKey]} value={item[valueKey]}>
              {item[labelKey]}
            </option>
          ))}
          {!loading && !hasError && options?.length === 0 && (
            <option value="" disabled>
              No options available
            </option>
          )}
        </select>

        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-primary" />
          ) : (
            <ChevronDown
              size={16}
              className="text-gray-400 transition-transform duration-200 peer-focus:rotate-180 peer-focus:text-primary"
            />
          )}
        </div>
      </div>

      {hasError && (
        <p id={`${name}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
          <CircleAlert size={13} />
          {error || apiError}
        </p>
      )}
    </div>
  );
};

export default Select;