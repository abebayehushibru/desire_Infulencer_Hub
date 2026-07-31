import React, { useRef } from "react";
import { UploadCloud, Calendar, Eye, EyeOff } from "lucide-react"; // Visual helpers for files, dates, passwords

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  leftIcon,
  rightIcon,
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const isFile = type === "file";
  const isDate = type === "date";
  const isPassword = type === "password";

  // Dynamic input type resolution for password visibility toggles
  const inputType = isPassword && showPassword ? "text" : type;

  // Handle premium trigger behavior for custom file component skins
  const handleFileDivClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {/* Premium Field Labels Layout */}
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-xs font-semibold text-gray-700 tracking-wide"
        >
          {label}
          {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Render Premium File Drag-and-Drop Mockup Skin */}
        {isFile ? (
          <div
            onClick={handleFileDivClick}
            className={`
              w-full min-h-[44px] flex items-center justify-between px-4 border border-dashed rounded-lg bg-gray-50/50 cursor-pointer transition-all duration-200
              ${disabled ? "bg-gray-100/50 cursor-not-allowed border-gray-200" : "hover:bg-gray-50 hover:border-violet-400"}
              ${hasError ? "border-rose-400 bg-rose-50/10" : "border-gray-300"}
              ${className}
            `}
          >
            <div className="flex items-center gap-2.5 truncate mr-2">
              <UploadCloud size={16} className={hasError ? "text-rose-400" : "text-violet-500"} />
              <span className="text-xs truncate font-medium text-gray-600">
                {value instanceof FileList && value.length > 0
                  ? `${value.length} file(s) selected`
                  : value?.name || placeholder || "Choose or drag file..."}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-2xs">
              Browse
            </span>
            <input
              ref={fileInputRef}
              id={name}
              name={name}
              type="file"
              onChange={onChange}
              disabled={disabled}
              className="hidden"
              {...props}
            />
          </div>
        ) : (
          /* Render Standard Inputs (text, date, email, phone, password) */
          <>
            {/* Left Icon Injection Block */}
            {leftIcon && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                {leftIcon}
              </div>
            )}

            <input
              id={name}
              name={name}
              type={inputType}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              className={`
                w-full h-[42px] rounded-lg border bg-white text-xs font-medium text-gray-800 transition-all duration-200 outline-none
                focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500
                disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                placeholder:text-gray-400 placeholder:font-normal

                ${leftIcon ? "pl-10" : "pl-3.5"}
                ${rightIcon || isDate || isPassword ? "pr-10" : "pr-3.5"}

                ${
                  hasError
                    ? "border-rose-400 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/5"
                    : "border-gray-200 hover:border-gray-300"
                }

                /* Modernize native native calendar icons on type="date" fields */
                ${isDate ? "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" : ""}

                ${className}
              `}
              {...props}
            />

            {/* Right Icon Layout Layer */}
            {rightIcon && !isPassword && !isDate && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                {rightIcon}
              </div>
            )}

            {/* Smart Password Eye Toggle Feature Overrides */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}

            {/* Calendar Icon Anchor Overrides on Dates */}
            {isDate && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                <Calendar size={16} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Message Layout Feedback block */}
      {hasError && (
        <p className="mt-1.5 text-xs font-semibold text-rose-500 tracking-wide animate-in fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
