import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, Loader2 } from "lucide-react";

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
    if (data || !api) {
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
            err.response?.data?.message ||
              err.message ||
              "Failed to load data."
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

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          className={`
            w-full appearance-none rounded-lg border bg-white py-3
            outline-none transition-all duration-200

            focus:ring-2 focus:ring-violet-500
            focus:border-violet-500

            disabled:bg-gray-100 disabled:cursor-not-allowed

            ${leftIcon ? "pl-12" : "pl-4"}
            pr-12

            ${
              error || apiError
                ? "border-red-500"
                : "border-gray-300"
            }

            ${className}
          `}
          {...props}
        >
          <option value="">
            {loading ? "Loading..." : placeholder}
          </option>
{JSON.stringify(options)}
          {/* {options?.map((item) => (
            <option
              key={item[valueKey]}
              value={item[valueKey]}
            >
              {item[labelKey]}
            </option>
          ))} */}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2
              size={18}
              className="animate-spin text-violet-600"
            />
          ) : (
            <ChevronDown
              size={18}
              className="text-gray-400"
            />
          )}
        </div>
      </div>

      {(error || apiError) && (
        <p className="mt-1 text-sm text-red-500">
          {error || apiError}
        </p>
      )}
    </div>
  );
};

export default Select;