"use client";

import { Metadata } from "next";
import { useEffect, useState } from "react";
import { Select } from "@/app/components/ui/Select";
import { LevelBadge, StatusBadge } from "@/app/components/ui/Badge";
import { formatCurrency, convertCurrency, getDashIfMissing, type Currency } from "@/app/lib/currency";

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

export default function ComparePage() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [selected1, setSelected1] = useState("");
  const [selected2, setSelected2] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/salaries?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const record1 = records.find((r) => r.id === selected1);
  const record2 = records.find((r) => r.id === selected2);

  const getDelta = (val1: number | undefined, val2: number | undefined) => {
    if (!val1 || !val2) return 0;
    return val1 - val2;
  };

  const displayRecord = (record: SalaryRecord | undefined) => {
    if (!record) return null;

    const base = record.currency === "INR"
      ? record.baseSalary
      : convertCurrency(record.baseSalary, "USD", displayCurrency === "INR" ? "INR" : "USD");
    const bonus = record.currency === "INR"
      ? record.bonus
      : convertCurrency(record.bonus, "USD", displayCurrency === "INR" ? "INR" : "USD");
    const stock = record.currency === "INR"
      ? record.stock
      : convertCurrency(record.stock, "USD", displayCurrency === "INR" ? "INR" : "USD");
    const tc = record.currency === "INR"
      ? record.totalComp
      : convertCurrency(record.totalComp, "USD", displayCurrency === "INR" ? "INR" : "USD");

    return { base, bonus, stock, tc };
  };

  const rec1Data = displayRecord(record1);
  const rec2Data = displayRecord(record2);

  const deltaBaseSalary = rec1Data && rec2Data ? getDelta(rec1Data.base, rec2Data.base) : 0;
  const deltaBonus = rec1Data && rec2Data ? getDelta(rec1Data.bonus, rec2Data.bonus) : 0;
  const deltaStock = rec1Data && rec2Data ? getDelta(rec1Data.stock, rec2Data.stock) : 0;
  const deltaTotalComp = rec1Data && rec2Data ? getDelta(rec1Data.tc, rec2Data.tc) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-h1 mb-8">Compare Salaries</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-muted">Loading salary data...</p>
        </div>
      ) : (
        <>
          {/* Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Select
              label="First Record"
              options={[
                { value: "", label: "Select a record..." },
                ...records.map((r) => ({
                  value: r.id,
                  label: `${r.company.name} - ${r.role} (${r.level}) - ${formatCurrency(r.totalComp, "INR")}`,
                })),
              ]}
              value={selected1}
              onChange={(e) => setSelected1(e.target.value)}
            />

            <Select
              label="Second Record"
              options={[
                { value: "", label: "Select a record..." },
                ...records.map((r) => ({
                  value: r.id,
                  label: `${r.company.name} - ${r.role} (${r.level}) - ${formatCurrency(r.totalComp, "INR")}`,
                })),
              ]}
              value={selected2}
              onChange={(e) => setSelected2(e.target.value)}
            />
          </div>

          {/* Currency Toggle */}
          <div className="mb-8">
            <label className="text-label font-medium text-text-deep block mb-2">
              Display Currency
            </label>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
              className="input-field w-full max-w-xs"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          {/* Comparison */}
          {record1 && record2 && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Record 1 */}
              <div className="card">
                <h3 className="text-h3 mb-4">
                  {record1.company.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-text-muted text-label mb-1">Role</p>
                    <p className="text-body">{record1.role}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Level</p>
                    <LevelBadge level={record1.level} />
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Location</p>
                    <p className="text-body">{record1.location}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Experience</p>
                    <p className="text-body">{record1.experienceYears} years</p>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <p className="text-text-muted text-label mb-1">Base Salary</p>
                    <p className="text-salary-md text-data-blue">
                      {rec1Data && (getDashIfMissing(rec1Data.base) || formatCurrency(rec1Data.base, displayCurrency))}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Bonus</p>
                    <p className="text-body">
                      {rec1Data && (getDashIfMissing(rec1Data.bonus) || formatCurrency(rec1Data.bonus, displayCurrency))}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Stock</p>
                    <p className="text-body">
                      {rec1Data && (getDashIfMissing(rec1Data.stock) || formatCurrency(rec1Data.stock, displayCurrency))}
                    </p>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <p className="text-text-muted text-label mb-1">Total Comp</p>
                    <p className="text-salary-lg text-data-blue">
                      {rec1Data && formatCurrency(rec1Data.tc, displayCurrency)}
                    </p>
                    {deltaTotalComp > 0 && (
                      <StatusBadge variant="success">
                        +{formatCurrency(deltaTotalComp, displayCurrency)}
                      </StatusBadge>
                    )}
                  </div>
                </div>
              </div>

              {/* Delta */}
              <div className="card bg-bg-hover">
                <h3 className="text-h3 mb-4">Difference</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-text-muted text-label">Role</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-text-muted text-label">Level</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-text-muted text-label">Location</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-text-muted text-label">Experience</span>
                    <span className={`text-body font-medium ${deltaBaseSalary > 0 ? "text-success-green" : deltaBaseSalary < 0 ? "text-error-red" : "text-text-muted"}`}>
                      {deltaBaseSalary > 0 ? "+" : ""}{deltaBaseSalary === 0 ? "0" : formatCurrency(Math.abs(deltaBaseSalary), displayCurrency)}
                    </span>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-text-muted text-label">Base Salary</span>
                      <span className={`text-body font-medium ${deltaBaseSalary > 0 ? "text-success-green" : deltaBaseSalary < 0 ? "text-error-red" : "text-text-muted"}`}>
                        {deltaBaseSalary > 0 ? "+" : ""}{deltaBaseSalary === 0 ? "0" : formatCurrency(Math.abs(deltaBaseSalary), displayCurrency)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-text-muted text-label">Bonus</span>
                      <span className={`text-body font-medium ${deltaBonus > 0 ? "text-success-green" : deltaBonus < 0 ? "text-error-red" : "text-text-muted"}`}>
                        {deltaBonus > 0 ? "+" : ""}{deltaBonus === 0 ? "0" : formatCurrency(Math.abs(deltaBonus), displayCurrency)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-text-muted text-label">Stock</span>
                      <span className={`text-body font-medium ${deltaStock > 0 ? "text-success-green" : deltaStock < 0 ? "text-error-red" : "text-text-muted"}`}>
                        {deltaStock > 0 ? "+" : ""}{deltaStock === 0 ? "0" : formatCurrency(Math.abs(deltaStock), displayCurrency)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <div className="flex justify-between items-start">
                      <span className="text-text-muted text-label">Total Comp</span>
                      <span className={`text-salary-md font-bold ${deltaTotalComp > 0 ? "text-success-green" : deltaTotalComp < 0 ? "text-error-red" : "text-text-muted"}`}>
                        {deltaTotalComp > 0 ? "+" : ""}{deltaTotalComp === 0 ? "0" : formatCurrency(Math.abs(deltaTotalComp), displayCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record 2 */}
              <div className="card">
                <h3 className="text-h3 mb-4">
                  {record2.company.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-text-muted text-label mb-1">Role</p>
                    <p className="text-body">{record2.role}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Level</p>
                    <LevelBadge level={record2.level} />
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Location</p>
                    <p className="text-body">{record2.location}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Experience</p>
                    <p className="text-body">{record2.experienceYears} years</p>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <p className="text-text-muted text-label mb-1">Base Salary</p>
                    <p className="text-salary-md text-data-blue">
                      {rec2Data && (getDashIfMissing(rec2Data.base) || formatCurrency(rec2Data.base, displayCurrency))}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Bonus</p>
                    <p className="text-body">
                      {rec2Data && (getDashIfMissing(rec2Data.bonus) || formatCurrency(rec2Data.bonus, displayCurrency))}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-label mb-1">Stock</p>
                    <p className="text-body">
                      {rec2Data && (getDashIfMissing(rec2Data.stock) || formatCurrency(rec2Data.stock, displayCurrency))}
                    </p>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <p className="text-text-muted text-label mb-1">Total Comp</p>
                    <p className="text-salary-lg text-data-blue">
                      {rec2Data && formatCurrency(rec2Data.tc, displayCurrency)}
                    </p>
                    {deltaTotalComp < 0 && (
                      <StatusBadge variant="success">
                        +{formatCurrency(Math.abs(deltaTotalComp), displayCurrency)}
                      </StatusBadge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!record1 || !record2) && (
            <div className="card text-center py-12">
              <p className="text-text-muted">
                Select two salary records to compare
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
