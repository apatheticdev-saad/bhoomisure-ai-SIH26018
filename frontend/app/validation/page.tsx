"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type RecordItem = {
  id: number;
  document_id: number;
  file_name: string;
  document_type: string;
  owner_name: string | null;
  survey_number: string | null;
  village: string | null;
  district: string | null;
  overall_confidence: number | null;
  validation_status: string;
};

type ValidationResult = {
  id: number;
  record_id: number;
  rule_name: string;
  status: string;
  severity: string | null;
  message: string | null;
};

export default function ValidationPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [validationResults, setValidationResults] =
    useState<ValidationResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadValidationData() {
    try {
      setLoading(true);
      setError("");

      const recordsResponse = await fetch(
        `${API_URL}/api/land-records/`
      );

      if (!recordsResponse.ok) {
        throw new Error("Failed to load records");
      }

      const recordsData = await recordsResponse.json();

      setRecords(recordsData.records ?? []);

      const allValidationResults: ValidationResult[] = [];

      for (const record of recordsData.records ?? []) {
        try {
          const response = await fetch(
            `${API_URL}/api/verification/${record.id}`
          );

          if (!response.ok) continue;

          const data = await response.json();

          for (const result of data.validation_results ?? []) {
            allValidationResults.push({
              ...result,
              record_id: record.id,
            });
          }
        } catch {
          // Continue loading other records
        }
      }

      setValidationResults(allValidationResults);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load validation information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadValidationData();
  }, []);

  const passed = validationResults.filter(
    (item) => item.status === "passed"
  ).length;

  const failed = validationResults.filter(
    (item) => item.status === "failed"
  ).length;

  const warnings = validationResults.filter(
    (item) => item.status === "warning"
  ).length;

  const pending = validationResults.filter(
    (item) => item.status === "pending"
  ).length;

  const verified = records.filter(
    (record) =>
      record.validation_status === "verified" ||
      record.validation_status === "validated"
  ).length;

  const needsReview = records.filter(
    (record) =>
      record.validation_status === "needs_review"
  ).length;

  const rejected = records.filter(
    (record) =>
      record.validation_status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="fixed left-0 top-0 hidden h-screen w-[250px] border-r border-slate-200 bg-white lg:block">

        <div className="flex h-full flex-col">

          <div className="flex h-[82px] items-center border-b border-slate-100 px-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck size={23} />
            </div>

            <div className="ml-3">

              <h1 className="text-[17px] font-bold">
                BhoomiSure
              </h1>

              <p className="text-[11px] font-medium text-slate-400">
                AI LAND INTELLIGENCE
              </p>

            </div>

          </div>

          <nav className="flex-1 px-4 py-6">

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Workspace
            </p>

            <NavItem
              icon={<Activity size={18} />}
              label="Dashboard"
              href="/"
            />

            <NavItem
              icon={<Upload size={18} />}
              label="Upload Document"
              href="/upload"
            />

            <NavItem
              icon={<FileText size={18} />}
              label="Land Records"
              href="/records"
            />

            <NavItem
              icon={<Clock3 size={18} />}
              label="Verification Queue"
              href="/verification"
            />

            <NavItem
              icon={<ShieldCheck size={18} />}
              label="Validation"
              href="/validation"
              active
            />

            <div className="my-6 border-t border-slate-100" />

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              System
            </p>

            <NavItem
              icon={<Database size={18} />}
              label="Audit Trail"
              href="/audit"
            />

            <NavItem
              icon={<Activity size={18} />}
              label="System Health"
              href="/system-health"
            />

          </nav>

          <div className="border-t border-slate-100 p-4">

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                RO
              </div>

              <div>

                <p className="text-sm font-semibold">
                  Revenue Officer
                </p>

                <p className="text-xs text-slate-400">
                  Administrator
                </p>

              </div>

              <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />

            </div>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="lg:ml-[250px]">

        <header className="flex h-[82px] items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>

              <p className="text-xs font-medium text-slate-400">
                LAND RECORD VALIDATION
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Validation Center
              </h2>

            </div>

          </div>

          <button
            onClick={loadValidationData}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>

        </header>

        <div className="p-6 md:p-8">

          {/* Heading */}
          <div className="mb-7">

            <h3 className="text-2xl font-bold tracking-tight">
              Evidence-Based Validation
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              BhoomiSure AI applies structural and business-rule
              checks to extracted land information before a record
              becomes trusted digital data.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* =====================================================
              TOP METRICS
          ====================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              title="Rules Passed"
              value={loading ? "—" : passed}
              subtitle="Validation checks"
              icon={<CheckCircle2 size={21} />}
              className="bg-emerald-50 text-emerald-600"
            />

            <MetricCard
              title="Validation Failures"
              value={loading ? "—" : failed}
              subtitle="Require attention"
              icon={<XCircle size={21} />}
              className="bg-red-50 text-red-600"
            />

            <MetricCard
              title="Warnings"
              value={loading ? "—" : warnings}
              subtitle="Potential inconsistencies"
              icon={<AlertTriangle size={21} />}
              className="bg-amber-50 text-amber-600"
            />

            <MetricCard
              title="Pending Checks"
              value={loading ? "—" : pending}
              subtitle="External comparison"
              icon={<Clock3 size={21} />}
              className="bg-blue-50 text-blue-600"
            />

          </div>

          {/* =====================================================
              RECORD STATUS
          ====================================================== */}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.5fr]">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <h4 className="font-bold">
                  Record Trust Status
                </h4>

                <p className="mt-1 text-xs text-slate-400">
                  Current state of processed land records
                </p>

              </div>

              <div className="space-y-5 p-6">

                <StatusRow
                  label="Verified"
                  value={verified}
                  total={Math.max(records.length, 1)}
                  color="bg-emerald-500"
                />

                <StatusRow
                  label="Needs Review"
                  value={needsReview}
                  total={Math.max(records.length, 1)}
                  color="bg-amber-500"
                />

                <StatusRow
                  label="Rejected"
                  value={rejected}
                  total={Math.max(records.length, 1)}
                  color="bg-red-500"
                />

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <div className="flex gap-3">

                    <ShieldAlert
                      size={19}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>

                      <p className="text-xs font-bold text-blue-800">
                        Validation principle
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-blue-700">
                        A record is not automatically trusted merely
                        because OCR extracted a value. Confidence,
                        field completeness and validation rules are
                        evaluated before verification.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Validation checks */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <h4 className="font-bold">
                  Validation Checks
                </h4>

                <p className="mt-1 text-xs text-slate-400">
                  Rules executed against extracted records
                </p>

              </div>

              {loading ? (

                <div className="py-16 text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm text-slate-400">
                    Loading validation checks...
                  </p>

                </div>

              ) : validationResults.length === 0 ? (

                <div className="px-6 py-16 text-center">

                  <ShieldCheck
                    size={35}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    No validation results available
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Process a land document to generate validation
                    results.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {validationResults.map((result) => (

                    <div
                      key={`${result.record_id}-${result.id}`}
                      className="flex items-start gap-4 px-6 py-4"
                    >

                      <ValidationIcon
                        status={result.status}
                      />

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-xs font-bold capitalize">
                            {result.rule_name.replace(
                              /_/g,
                              " "
                            )}
                          </p>

                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            Record #{result.record_id}
                          </span>

                        </div>

                        <p className="mt-1 text-[11px] leading-5 text-slate-400">
                          {result.message ||
                            "No message available."}
                        </p>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${
                          result.status === "passed"
                            ? "bg-emerald-50 text-emerald-600"
                            : result.status === "warning"
                              ? "bg-amber-50 text-amber-600"
                              : result.status === "pending"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-red-50 text-red-600"
                        }`}
                      >
                        {result.status}
                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* =====================================================
              RECORD TABLE
          ====================================================== */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h4 className="font-bold">
                Record Validation Status
              </h4>

              <p className="mt-1 text-xs text-slate-400">
                Review the validation state of every processed
                record.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">

                    <th className="px-6 py-3 font-bold">
                      Record
                    </th>

                    <th className="px-6 py-3 font-bold">
                      Owner
                    </th>

                    <th className="px-6 py-3 font-bold">
                      Survey
                    </th>

                    <th className="px-6 py-3 font-bold">
                      Location
                    </th>

                    <th className="px-6 py-3 font-bold">
                      Confidence
                    </th>

                    <th className="px-6 py-3 font-bold">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {records.map((record) => (

                    <tr
                      key={record.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <Link
                          href={`/verification/${record.id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Record #{record.id}
                        </Link>

                        <p className="mt-1 max-w-[180px] truncate text-[10px] text-slate-400">
                          {record.file_name}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {record.owner_name ||
                          "Not detected"}
                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                          {record.survey_number ||
                            "—"}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <p className="text-xs font-semibold text-slate-700">
                          {record.village ||
                            "Unknown"}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {record.district || "—"}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            (record.overall_confidence ?? 0) >= 85
                              ? "bg-emerald-50 text-emerald-600"
                              : (record.overall_confidence ?? 0) >= 70
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {record.overall_confidence ?? 0}%
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <RecordStatus
                          status={
                            record.validation_status
                          }
                        />

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = Math.min(
    Math.round((value / total) * 100),
    100
  );

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        <span className="text-sm font-bold">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   VALIDATION ICON
========================================================= */

function ValidationIcon({
  status,
}: {
  status: string;
}) {
  if (status === "passed") {
    return (
      <CheckCircle2
        size={18}
        className="mt-0.5 shrink-0 text-emerald-500"
      />
    );
  }

  if (status === "warning") {
    return (
      <AlertTriangle
        size={18}
        className="mt-0.5 shrink-0 text-amber-500"
      />
    );
  }

  if (status === "pending") {
    return (
      <Clock3
        size={18}
        className="mt-0.5 shrink-0 text-blue-500"
      />
    );
  }

  return (
    <XCircle
      size={18}
      className="mt-0.5 shrink-0 text-red-500"
    />
  );
}


/* =========================================================
   RECORD STATUS
========================================================= */

function RecordStatus({
  status,
}: {
  status: string;
}) {
  if (
    status === "verified" ||
    status === "validated"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
        <CheckCircle2 size={12} />
        Verified
      </span>
    );
  }

  if (status === "needs_review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
        <Clock3 size={12} />
        Review
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
        <XCircle size={12} />
        Rejected
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
      Pending
    </span>
  );
}