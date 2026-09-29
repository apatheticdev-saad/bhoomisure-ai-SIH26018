"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Comparison = {
  field: string;
  status: string;
  severity: string;
  existing_value: string | null;
  new_value: string | null;
  existing_record_id: number;
};

type ReconciliationResponse = {
  record_id: number;
  reconciliation: {
    status: string;
    matching_record_count: number;
    matching_record_ids: number[];
    duplicate_record_ids: number[];
    conflict_record_ids: number[];
    mismatches: Comparison[];
  };
};

const labels: Record<string, string> = {
  owner_name: "Owner Name",
  area: "Land Area",
  area_unit: "Area Unit",
  khata_number: "Khata Number",
  khasra_number: "Khasra Number",
  tehsil: "Tehsil",
  land_classification: "Land Classification",
  ownership_details: "Ownership Details",
};

export default function ReconciliationFindings({
  recordId,
}: {
  recordId: number;
}) {
  const [data, setData] =
    useState<ReconciliationResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/reconciliation/${recordId}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load reconciliation"
          );
        }

        const result =
          await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [recordId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />

        <div className="mt-4 h-20 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const reconciliation =
    data.reconciliation;

  if (
    reconciliation.status === "no_match"
  ) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <div className="text-lg">✓</div>

          <div>
            <h3 className="font-semibold text-blue-900">
              No Existing Parcel Conflict
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              No existing record was found for
              the same survey number, village
              and district.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Select one existing conflicting record.
   *
   * This prevents duplicate conflicts from
   * appearing when multiple historical records
   * contain the same information.
   */
  const selectedExistingRecordId =
    reconciliation.conflict_record_ids?.[0] ??
    reconciliation.matching_record_ids?.[0] ??
    null;

  const conflicts =
    selectedExistingRecordId === null
      ? []
      : reconciliation.mismatches.filter(
          (item) =>
            item.existing_record_id ===
            selectedExistingRecordId
        );

  if (conflicts.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <div className="text-lg">✓</div>

          <div>
            <h3 className="font-semibold text-emerald-900">
              Existing Record Matched
            </h3>

            <p className="mt-1 text-sm text-emerald-700">
              The compared land information is
              consistent with the existing record.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-red-200 bg-red-50 px-5 py-4">
        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <div>
            <h3 className="font-bold text-red-900">
              Reconciliation Conflicts
            </h3>

            <p className="mt-1 text-sm text-red-700">
              Existing verified information differs
              from the newly extracted record.
              Human review is required.
            </p>
          </div>

        </div>
      </div>

      {/* Selected existing record */}
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">

          <span className="text-xs font-medium text-slate-500">
            Compared against existing record
          </span>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
            Record #{selectedExistingRecordId}
          </span>

        </div>
      </div>

      {/* Conflict count */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">

          <span className="text-sm font-medium text-slate-600">
            Conflicting fields
          </span>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
            {conflicts.length}
          </span>

        </div>
      </div>

      {/* Findings */}
      <div className="divide-y divide-slate-100">

        {conflicts.map(
          (conflict, index) => (
            <div
              key={`${conflict.field}-${index}`}
              className="grid gap-4 bg-red-50/40 p-5 md:grid-cols-3"
            >

              {/* Field */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Field
                </div>

                <div className="mt-1 font-semibold text-slate-900">
                  {labels[conflict.field] ||
                    conflict.field}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Existing Record #
                  {conflict.existing_record_id}
                </div>
              </div>

              {/* Existing */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Existing Verified Value
                </div>

                <div className="mt-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">
                  {conflict.existing_value ||
                    "—"}
                </div>
              </div>

              {/* New */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  New Extracted Value
                </div>

                <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  {conflict.new_value ||
                    "—"}
                </div>
              </div>

            </div>
          )
        )}

      </div>

      {/* Footer */}
      <div className="border-t border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-medium text-amber-900">
          ⚠ Do not automatically approve this
          record. Verify the values against the
          original document and available records.
        </p>
      </div>

    </div>
  );
}