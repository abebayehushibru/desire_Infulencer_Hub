import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Loader2, CircleAlert, Check, Search, X } from "lucide-react";

const Select = ({
  label,
  name,
  value,
  onChange,

  // Static Data
  data = [],

  // Object Keys
  labelKey = "label",
  valueKey = "value",

  placeholder = "Select...",
  required = false,
  disabled = false,
  error,
  className = "",

  leftIcon,
  searchable = true, // Premium feature addition
  ...props
}) => {
  const [options, setOptions] = useState(data);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Sync state options when static arrays refresh
  useEffect(() => {
    setOptions(data);
  }, [data]);

  // Close custom overlay context window when clicked outside boundaries
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on localized client query input strings
  const filteredOptions = options.filter((item) =>
    String(item[labelKey]).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find currently selected item string labels
  const selectedOption = options.find((item) => String(item[valueKey]) === String(value));

  const handleSelect = (itemValue) => {
    // Mimic synthetic browser events framework objects to prevent breakage upstream
    onChange({
      target: {
        name,
        value: itemValue,
      },
    });
    setIsOpen(false);
    setSearchQuery(""); // Wipe search inputs for subsequent uses
  };

  const clearSelection = (e) => {
    e.stopPropagation(); // Avoid triggering open dropdown actions
    onChange({ target: { name, value: "" } });
  };

  const hasError = Boolean(error);

  return (
    <div className={`w-full  z-[100] relative z-10 ${className}`} ref={dropdownRef} {...props}>
      {/* Premium Field Labels Layout */}
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-gray-700 tracking-wide">
          {label}
          {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
        </label>
      )}

      {/* Styled Dropdown Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between w-full h-[42px] px-3.5
          rounded-lg border bg-white cursor-pointer select-none transition-all duration-200
          ${disabled ? "cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400" : "hover:border-gray-300"}
          ${isOpen ? "border-primary ring-4 ring-primary/10 shadow-sm" : "border-gray-200 shadow-sm"}
          ${hasError ? "border-rose-400 ring-rose-100 focus:ring-4" : ""}
        `}
      >
        <div className="flex items-center gap-2.5 truncate mr-2">
          {leftIcon && <span className="text-gray-400 flex-shrink-0">{leftIcon}</span>}
          <span className={`text-xs truncate ${!selectedOption ? "text-gray-400 font-normal" : "text-gray-800 font-medium"}`}>
            {selectedOption ? selectedOption[labelKey] : placeholder}
          </span>
        </div>

        {/* Action Indicators Layout Wrapper */}
        <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
          {value && !required && !disabled && (
            <X
              size={14}
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 rounded-full hover:bg-gray-100"
            />
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
          />
        </div>
      </div>

      {/* Custom Floating Options Dropdown Menu Panel */}
      {isOpen && (
        <div
          className="absolute mt-1.5 right-0 bg-white border border-gray-100 rounded-lg shadow-xl 
                     overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100 min-w-full max-w-sm max-h-64 flex flex-col"
        >
          {/* Real-time Filter Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50 sticky top-0">
              <Search size={14} className="text-gray-400 flex-shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search choices..."
                className="w-full bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 font-normal py-0.5"
                onClick={(e) => e.stopPropagation()} // Prevent closing menu on clicks
              />
            </div>
          )}

          {/* Render Options list */}
          <div className="overflow-y-auto flex-1 max-h-48 custom-scrollbar py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const isSelected = String(item[valueKey]) === String(value);
                return (
                  <div
                    key={item[valueKey]}
                    onClick={() => handleSelect(item[valueKey])}
                    className={`
                      flex items-center justify-between px-3.5 py-2.5 mx-1 my-0.5 rounded-lg
                      text-xs cursor-pointer transition-all duration-150 select-none
                      ${isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-gray-700 hover:bg-gray-50 font-medium"
                      }
                    `}
                  >
                    <span className="truncate">{item[labelKey]}</span>
                    {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="px-3.5 py-4 text-center text-xs text-gray-400 font-normal">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Feedback Layout */}
      {hasError && (
        <p id={`${name}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-500 tracking-wide animate-in fade-in duration-200">
          <CircleAlert size={13} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
