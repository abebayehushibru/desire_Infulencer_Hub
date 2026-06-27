import React from "react";

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
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
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full rounded-lg border bg-white px-4 py-3
          outline-none resize-none
          transition duration-200

          focus:ring-2
          focus:ring-violet-500
          focus:border-violet-500

          disabled:bg-gray-100

          ${
            error
              ? "border-red-500"
              : "border-gray-300"
          }

          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;