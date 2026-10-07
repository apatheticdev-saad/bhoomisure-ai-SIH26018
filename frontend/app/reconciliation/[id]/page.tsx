"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Comparison = {
  field: string;
  status: "matched" | "mismatch";
  severity: "info" | "medium" | "high";
  existing_value: string | null;
  new_value: string | null;
  message: string;
  existing_record_id: number;
};


type ReconciliationResult = {
  status: "matched" | "conflict" | "no_match";
  matching_record_count: number;
  matching_record_ids: number[];
  comparisons: Comparison[];
  mismatches: Comparison[];
  message: string;
};

type ApiResponse = {
  record_id: number;
  validation_status: string;
  reconciliation: ReconciliationResult;
};


const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const fieldLabels: Record<string, string> = {
  owner_name: "Owner Name",
  area: "Land Area",
  area_unit: "Area Unit",
  khata_number: "Khata Number",
  khasra_number: "Khasra Number",
  tehsil: "Tehsil",
  land_classification: "Land Classification",
  ownership_details: "Ownership",
};

export default function ReconciliationPage() {
  const params = useParams();
  const router = useRouter();

  const recordId = Number(params.id);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(
    null
  );


  useEffect(() => {
    if (!recordId || Number.isNaN(recordId)) {
      setError("Invalid record ID.");
      setLoading(false);
      return;
    }

    const loadReconciliation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/reconciliation/${recordId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load reconciliation data.");
        }

        const result: ApiResponse = await response.json();

        setData(result);

        if (result.reconciliation.matching_record_ids.length > 0) {
          setSelectedRecordId(
            result.reconciliation.matching_record_ids[0]
          );
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load reconciliation data.");
      } finally {
        setLoading(false);
      }
    };

    loadReconciliation();
  }, [recordId]);

  const selectedComparisons = useMemo(() => {
    if (!data || selectedRecordId === null) return [];

    return data.reconciliation.comparisons.filter(
      (comparison) =>
        comparison.existing_record_id === selectedRecordId
    );
  }, [data, selectedRecordId]);

  const mismatchCount = selectedComparisons.filter(
    (item) => item.status === "mismatch"
  ).length;

  const matchedCount = selectedComparisons.filter(
    (item) => item.status === "matched"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-6 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 h-32 animate-pulse rounded-xl bg-slate-100" />
            <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">
              Reconciliation Error
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error || "No reconciliation data found."}
            </p>

            <button
              onClick={() => router.back()}
              className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const reconciliation = data.reconciliation;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                ⇄
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Reconciliation Review
                </h1>

                <p className="text-sm text-slate-500">
                  Parcel-centric comparison for Record #{recordId}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push(`/verification/${recordId}`)}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Open Human Verification →
          </button>
        </div>

        {/* Status Banner */}
        {reconciliation.status === "conflict" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
                  !
                </div>

                <div>
                  <h2 className="font-bold text-red-900">
                    Conflict Detected
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    Existing land records contain values that do not
                    match the newly processed record.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white px-4 py-2 text-center shadow-sm">
                <div className="text-2xl font-bold text-red-600">
                  {mismatchCount}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  conflicts found
                </div>
              </div>
            </div>
          </div>
        )}

        {reconciliation.status === "matched" && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
                ✓
              </div>

              <div>
                <h2 className="font-bold text-emerald-900">
                  Existing Record Matched
                </h2>

                <p className="mt-1 text-sm text-emerald-700">
                  The compared fields are consistent with the
                  existing record.
                </p>
              </div>
            </div>
          </div>
        )}

        {reconciliation.status === "no_match" && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-600">
                +
              </div>

              <div>
                <h2 className="font-bold text-blue-900">
                  No Existing Parcel Match
                </h2>

                <p className="mt-1 text-sm text-blue-700">
                  No existing record was found for the same survey,
                  village and district.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Record Under Review"
            value={`#${recordId}`}
            description="Newly processed record"
          />

          <SummaryCard
            label="Existing Records"
            value={String(reconciliation.matching_record_count)}
            description="Potential parcel matches"
          />

          <SummaryCard
            label="Matched Fields"
            value={String(matchedCount)}
            description="Consistent values"
            positive
          />

          <SummaryCard
            label="Conflicts"
            value={String(mismatchCount)}
            description="Require attention"
            danger={mismatchCount > 0}
          />
        </div>

        {/* Existing Record Selector */}
        {reconciliation.matching_record_ids.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900">
                Existing Parcel Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an existing record to compare against the new
                record.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {reconciliation.matching_record_ids.map((existingId) => (
                <button
                  key={existingId}
                  onClick={() => setSelectedRecordId(existingId)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selectedRecordId === existingId
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-medium text-slate-500">
                    Existing Record
                  </div>

                  <div className="mt-1 font-semibold text-slate-900">
                    #{existingId}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison */}
        {selectedRecordId !== null && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Comparison Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-3 md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Existing Record
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Record #{selectedRecordId}
                  </h2>
                </div>

                <div className="hidden justify-center md:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                    ⇄
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    New Record
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-blue-700">
                    Record #{recordId}
                  </h2>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="divide-y divide-slate-100">
              {selectedComparisons.map((comparison, index) => {
                const mismatch = comparison.status === "mismatch";

                return (
                  <div
                    key={`${comparison.field}-${index}`}
                    className={`grid gap-4 px-5 py-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center ${
                      mismatch ? "bg-red-50/60" : "bg-white"
                    }`}
                  >
                    {/* Field */}
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {fieldLabels[comparison.field] ||
                          comparison.field}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {comparison.field}
                      </div>
                    </div>

                    {/* Existing */}
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Existing
                      </div>

                      <div
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          mismatch
                            ? "border-red-200 bg-white text-red-700"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {comparison.existing_value || "—"}
                      </div>
                    </div>

                    {/* New */}
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                        New
                      </div>

                      <div
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          mismatch
                            ? "border-red-200 bg-white font-semibold text-red-700"
                            : "border-blue-100 bg-blue-50/50 text-slate-700"
                        }`}
                      >
                        {comparison.new_value || "—"}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-start md:justify-end">
                      {mismatch ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Matched
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Comparison based on survey number, village and
                  district matching.
                </div>

                <button
                  onClick={() =>
                    router.push(`/verification/${recordId}`)
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue to Verification →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Guidance */}
        {reconciliation.status === "conflict" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <div className="text-lg">⚠</div>

              <div>
                <h3 className="font-semibold text-amber-900">
                  Human review required
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Conflicting values should not be automatically
                  accepted. Open the verification screen to inspect
                  the extracted evidence and make the final decision.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  positive,
  danger,
}: {
  label: string;
  value: string;
  description: string;
  positive?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div
        className={`mt-2 text-2xl font-bold ${
          danger
            ? "text-red-600"
            : positive
              ? "text-emerald-600"
              : "text-slate-900"
        }`}
      >
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {description}
      </div>
    </div>
  );
}

// End.....