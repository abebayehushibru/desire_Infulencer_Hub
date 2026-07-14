import React from "react";
import { CalendarDays } from "lucide-react";

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  min,
  max,
}) => {
  return (
    <div className="w-full">

      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">

        <input
          id={name}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          className={`
            w-full rounded-lg border
            bg-white
            py-3
            pl-4
            pr-12
            outline-none

            transition

            focus:ring-2
            focus:ring-violet-500
            focus:border-violet-500

            ${
              error
                ? "border-red-500"
                : "border-gray-300"
            }
          `}
        />

        <CalendarDays
          size={20}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePicker;