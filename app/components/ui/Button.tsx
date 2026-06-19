import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  const sizeClass = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  }[size];

  return (
    <button className={`${baseClass} ${sizeClass} ${className}`} {...props} />
  );
}
