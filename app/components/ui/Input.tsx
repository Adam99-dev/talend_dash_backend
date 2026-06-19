import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-label font-medium text-text-deep">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? "border-error-red focus:ring-error-red" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-meta text-error-red">{error}</p>}
    </div>
  );
}
