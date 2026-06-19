"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import { LevelBadge } from "@/app/components/ui/Badge";
import {
  formatCurrency,
  convertCurrency,
  getDashIfMissing,
  type Currency,
} from "@/app/lib/currency";

interface SalaryRecord {
  id: string;
  company: { id: string; name: string; slug: string };
  role: string;
  level: string;
  location: string;
  currency: string;
  experienceYears: number;
  baseSalary: number;
  bonus: number;
  stock: number;
  totalComp: number;
}

interface TableProps {
  initialData: SalaryRecord[];
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
  }>;
}

export function SalaryTable({ initialData, columns: _columns }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const data = initialData;
  const [filteredData, setFilteredData] = useState<SalaryRecord[]>(initialData);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(
    searchParams.get("currency") === "USD" ? "USD" : "INR",
  );
  const [currentPage, setCurrentPage] = useState(() =>
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const [sortColumn, setSortColumn] = useState<string>(
    searchParams.get("sort") || "totalComp",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    searchParams.get("dir") === "asc" ? "asc" : "desc",
  );

  // Filters
  const [companyFilter, setCompanyFilter] = useState(
    searchParams.get("company") || "",
  );
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [levelFilters, setLevelFilters] = useState<Set<string>>(
    new Set(searchParams.getAll("level")),
  );
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || "",
  );

  const itemsPerPage = 25;

  // Get unique values for dropdowns
  const uniqueRoles = Array.from(new Set(data.map((r) => r.role))).sort();
  const uniqueLevels = Array.from(new Set(data.map((r) => r.level))).sort();
  const uniqueLocations = Array.from(
    new Set(data.map((r) => r.location)),
  ).sort();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (companyFilter) params.set("company", companyFilter);
      if (roleFilter) params.set("role", roleFilter);
      levelFilters.forEach((level) => params.append("level", level));
      if (locationFilter) params.set("location", locationFilter);
      if (displayCurrency !== "INR") params.set("currency", displayCurrency);
      if (sortColumn !== "totalComp") params.set("sort", sortColumn);
      if (sortDirection !== "desc") params.set("dir", sortDirection);
      if (currentPage > 1) params.set("page", String(currentPage));
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    companyFilter,
    roleFilter,
    levelFilters,
    locationFilter,
    displayCurrency,
    sortColumn,
    sortDirection,
    currentPage,
    pathname,
    router,
  ]);

  // Apply filters
  useEffect(() => {
    let result = data;

    if (companyFilter) {
      result = result.filter((r) =>
        r.company.name.toLowerCase().includes(companyFilter.toLowerCase()),
      );
    }

    if (roleFilter) {
      result = result.filter((r) => r.role === roleFilter);
    }

    if (levelFilters.size > 0) {
      result = result.filter((r) => levelFilters.has(r.level));
    }

    if (locationFilter) {
      result = result.filter((r) => r.location === locationFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = a[sortColumn as keyof SalaryRecord];
      const bVal = b[sortColumn as keyof SalaryRecord];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      }

      const first =
        sortColumn === "company" ? a.company.name : String(aVal ?? "");
      const second =
        sortColumn === "company" ? b.company.name : String(bVal ?? "");
      return (sortDirection === "desc" ? -1 : 1) * first.localeCompare(second);
    });

    setFilteredData(result);
  }, [
    data,
    companyFilter,
    roleFilter,
    levelFilters,
    locationFilter,
    sortColumn,
    sortDirection,
  ]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleLevelToggle = (level: string) => {
    const newFilters = new Set(levelFilters);
    if (newFilters.has(level)) {
      newFilters.delete(level);
    } else {
      newFilters.add(level);
    }
    setLevelFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
    setLevelFilters(new Set());
    setLocationFilter("");
    setCurrentPage(1);
  };

  const displayData = paginatedData.map((record) => ({
    ...record,
    baseSalary: convertCurrency(
      record.baseSalary,
      record.currency === "USD" ? "USD" : "INR",
      displayCurrency,
    ),
    bonus: convertCurrency(
      record.bonus,
      record.currency === "USD" ? "USD" : "INR",
      displayCurrency,
    ),
    stock: convertCurrency(
      record.stock,
      record.currency === "USD" ? "USD" : "INR",
      displayCurrency,
    ),
    totalComp: convertCurrency(
      record.totalComp,
      record.currency === "USD" ? "USD" : "INR",
      displayCurrency,
    ),
  }));

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="filter-panel bg-bg-surface border border-border-light p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3">Filters</h3>
          {(companyFilter ||
            roleFilter ||
            levelFilters.size > 0 ||
            locationFilter) && (
            <button
              onClick={handleClearFilters}
              className="text-accent hover:underline text-label"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Company"
            placeholder="Search company..."
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            label="Role"
            options={[
              { value: "", label: "All Roles" },
              ...uniqueRoles.map((r) => ({ value: r, label: r })),
            ]}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            label="Location"
            options={[
              { value: "", label: "All Locations" },
              ...uniqueLocations.map((l) => ({ value: l, label: l })),
            ]}
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="flex items-end">
            <div className="flex-1">
              <label className="text-label font-medium text-text-deep block mb-2">
                Currency
              </label>
              <select
                value={displayCurrency}
                onChange={(e) => {
                  setDisplayCurrency(e.target.value as Currency);
                  setCurrentPage(1);
                }}
                className="input-field w-full"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Level checkboxes */}
        <div className="pt-4 border-t border-border-light">
          <p className="text-label font-medium text-text-deep mb-3">Level</p>
          <div className="flex flex-wrap gap-3">
            {uniqueLevels.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={levelFilters.has(level)}
                  onChange={() => handleLevelToggle(level)}
                  className="w-4 h-4 rounded border-border-light cursor-pointer"
                />
                <span className="text-body">{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="card text-center py-12">
          <h3 className="text-h3 mb-2">No records found</h3>
          <p className="text-text-muted mb-6">
            Try removing a filter to see more results.
          </p>
          <Button onClick={handleClearFilters} variant="secondary">
            Clear all filters
          </Button>
        </div>
      )}

      {/* Table */}
      {filteredData.length > 0 && (
        <>
          <div className="table-container salary-table-shell">
            <table className="w-full border-collapse">
              <thead className="table-header">
                <tr>
                  {[
                    { key: "company", label: "Company" },
                    { key: "role", label: "Role" },
                    { key: "level", label: "Level" },
                    { key: "location", label: "Location" },
                    { key: "experienceYears", label: "Experience" },
                    { key: "baseSalary", label: "Base Salary" },
                    { key: "bonus", label: "Bonus" },
                    { key: "stock", label: "Stock" },
                    { key: "totalComp", label: "Total Comp" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="table-header-cell cursor-pointer hover:bg-bg-hover select-none"
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {sortColumn === col.key && (
                          <span className="text-xs">
                            {sortDirection === "desc" ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">
                      <a
                        href={`/companies/${record.company.slug}`}
                        className="text-accent hover:underline"
                      >
                        {record.company.name}
                      </a>
                    </td>
                    <td className="table-cell">{record.role}</td>
                    <td className="table-cell">
                      <LevelBadge level={record.level} />
                    </td>
                    <td className="table-cell">{record.location}</td>
                    <td className="table-cell">{record.experienceYears} yrs</td>
                    <td className="table-cell">
                      {getDashIfMissing(record.baseSalary) ||
                        formatCurrency(record.baseSalary, displayCurrency)}
                    </td>
                    <td className="table-cell">
                      {getDashIfMissing(record.bonus) ||
                        formatCurrency(record.bonus, displayCurrency)}
                    </td>
                    <td className="table-cell">
                      {getDashIfMissing(record.stock) ||
                        formatCurrency(record.stock, displayCurrency)}
                    </td>
                    <td className="table-cell total-comp">
                      {formatCurrency(record.totalComp, displayCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-bar flex items-center justify-between p-4 border-t border-border-light">
            <div className="text-text-muted text-meta">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} records
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded border text-label font-medium transition-colors ${
                        currentPage === page
                          ? "bg-accent text-white border-accent"
                          : "border-border-light hover:bg-bg-hover"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
