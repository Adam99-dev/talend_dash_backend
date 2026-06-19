import React from "react";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-label font-medium text-text-deep">
          {label}
        </label>
      )}
      <select
        className={`input-field appearance-none cursor-pointer ${error ? "border-error-red focus:ring-error-red" : ""} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-meta text-error-red">{error}</p>}
    </div>
  );
}
