import React from "react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-gradient-to-br from-primary via-secondary to-primary text-white shadow-md",

  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-800",

  outline:
    "border border-purple-600 text-purple-600 hover:bg-purple-50",

  danger:
    "bg-red-600 hover:bg-red-700 text-white",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-purple-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>

          Loading...
        </>
      ) : (
        <>
          {leftIcon && leftIcon}
          {children}
          {rightIcon && rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;