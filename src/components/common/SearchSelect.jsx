import React, { useState, useRef, useEffect } from "react";

export default function SearchSelect({
  icon: Icon,
  placeholder = "Select...",
  options = [],
  isLoading = false,
  value = "",
  onInputChange,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const containerRef = useRef(null);

  // Sync the visible text with the selected value whenever it (or the
  // options list) changes — e.g. when loading an existing record for edit.
  useEffect(() => {
    const selected = options.find((opt) => opt.value === value);
    if (selected) {
      setInputValue(selected.label);
    } else if (!value) {
      setInputValue("");
    }
  }, [value, options]);

  // Close the dropdown on outside click. The previous implementation relied
  // on the input's onBlur event, which fires (and hides the list) before a
  // click on an option can register — so picking a result never worked
  // unless the mousedown/preventDefault race happened to line up. Listening
  // for outside clicks instead makes selection reliable and still closes
  // the menu when the user clicks elsewhere on the page.
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-gray-700">
      <div className="
        relative flex items-center
        border border-gray-300
        rounded-lg bg-white
      ">
        {Icon && (
          <Icon className="
            absolute left-3
            w-5 h-5 text-gray-400
          " />
        )}

        <input
          type="text"
          value={inputValue}
          className={`
            w-full py-2.5
            bg-transparent rounded-lg
            focus:outline-none text-sm
            ${Icon ? "pl-10" : "pl-3"}
          `}
          placeholder={placeholder}
          onChange={(e) => {
            const text = e.target.value;
            setInputValue(text);
            setIsOpen(true);
            if (onInputChange) {
              onInputChange(text);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
        />

        <div className="
          absolute right-3
          flex items-center
        ">
          {isLoading ? (
            <div className="
              w-4 h-4
              border-2 border-blue-500
              border-t-transparent
              rounded-full animate-spin
            " />
          ) : (
            <svg
              className={`
                w-4 h-4 text-gray-400
                transition-transform
                ${isOpen ? "rotate-180" : ""}
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (
        <ul className="
          absolute z-50 w-full mt-1
          bg-white border rounded-lg
          shadow-lg max-h-60
          overflow-y-auto
        ">
          {options.length > 0 ? (
            options.map((option) => (
              <li
                key={option.value}
                onMouseDown={(e) => {
                  // Prevent input blur from firing before the click registers.
                  e.preventDefault();
                  onChange(option);
                  setInputValue(option.label);
                  setIsOpen(false);
                }}
                className={`
                  px-4 py-2.5
                  text-sm cursor-pointer
                  hover:bg-blue-50
                  hover:text-blue-600
                  ${value === option.value ? "bg-blue-100 font-semibold" : ""}
                `}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="
              px-4 py-3
              text-sm text-gray-500
              text-center
            ">
              {isLoading
                ? "Searching..."
                : inputValue.trim()
                  ? "No results found"
                  : "Type to search"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}