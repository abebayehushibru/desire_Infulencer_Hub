import React from "react";

const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
}) => {
  return (
    <div className="w-full">

      {label && (
        <label className="block mb-3 text-sm font-medium text-gray-700">
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div className="flex flex-wrap gap-4">

        {options.map((option) => {

          const selected =
            value === option.value;

          return (
            <label
              key={option.value}
              className={`
                flex items-center gap-3
                rounded-xl border
                px-5 py-3
                cursor-pointer
                transition

                ${
                  selected
                    ? "border-violet-600 bg-violet-50"
                    : "border-gray-300 hover:border-violet-400"
                }
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={onChange}
                className="accent-violet-600"
              />

              <span className="font-medium">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;