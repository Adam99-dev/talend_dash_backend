import React from "react";

interface BadgeProps {
  level: string;
  children?: React.ReactNode;
}

const levelColors: Record<string, string> = {
  "L3": "badge-level-l3",
  "SDE-I": "badge-level-l3",
  "L4": "badge-level-l4",
  "SDE-II": "badge-level-l4",
  "L5": "badge-level-l5",
  "SDE-III": "badge-level-l5",
  "L6": "badge-level-l6",
  "Staff": "badge-level-l6",
  "Principal": "badge-level-principal",
};

export function LevelBadge({ level, children }: BadgeProps) {
  const colorClass = levelColors[level] || "badge-level bg-gray-500";

  return (
    <span className={`${colorClass}`}>
      {children || level}
    </span>
  );
}

interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  const variantColors = {
    success: "bg-success-green text-white",
    warning: "bg-warning-orange text-white",
    error: "bg-error-red text-white",
    info: "bg-data-blue text-white",
  };

  return (
    <span className={`badge ${variantColors[variant]}`}>
      {children}
    </span>
  );
}
