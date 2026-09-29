// frontend/app/reports/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Printer,
  LockKeyhole,
  GitCompare,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type RecordData = {
  id: number;
  document_id: number;
  owner_name: string | null;
  survey_number: string | null;
  khasra_number: string | null;
  khata_number: string | null;
  area: string | null;
  area_unit: string | null;
  village: string | null;
  tehsil: string | null;
  district: string | null;
  land_classification: string | null;
  ownership_details: string | null;
  mutation_number: string | null;
  registration_number: string | null;
  overall_confidence: number | null;
  validation_status: string;
};

type ReconciliationData = {
  record_id: number;
  validation_status: string;
  reconciliation: {
    status: string;
    matching_record_count: number;
    matching_record_ids: number[];
    duplicate_record_ids: number[];
    conflict_record_ids: number[];
    mismatches: {
      record_id: number;
      field: string;
      new_value: string | null;
      existing_value: string | null;
    }[];
    message: string;
  };
};

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();

  const recordId = Number(params.id);

  const [record, setRecord] =
    useState<RecordData | null>(null);

  const [reconciliation, setReconciliation] =
    useState<ReconciliationData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);

        const recordsResponse =
          await fetch(
            `${API_URL}/api/records/?limit=500`
          );

        if (!recordsResponse.ok) {
          throw new Error(
            "Unable to load land records."
          );
        }

        const recordsData =
          await recordsResponse.json();

        const foundRecord =
          recordsData.records.find(
            (item: RecordData) =>
              item.id === recordId
          );

        if (!foundRecord) {
          throw new Error(
            "Land record not found."
          );
        }

        setRecord(foundRecord);

        const reconciliationResponse =
          await fetch(
            `${API_URL}/api/reconciliation/${recordId}`
          );

        if (reconciliationResponse.ok) {
          const reconciliationData =
            await reconciliationResponse.json();

          setReconciliation(
            reconciliationData
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate report."
        );
      } finally {
        setLoading(false);
      }
    }

    if (recordId) {
      loadReport();
    }
  }, [recordId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Preparing verification report...
          </p>

        </div>

      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">

        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">

          <AlertTriangle
            size={30}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 font-bold text-slate-800">
            Report unavailable
          </h2>

          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={() =>
              router.back()
            }
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Go Back
          </button>

        </div>

      </div>
    );
  }

  const isVerified =
    record.validation_status ===
    "verified";

  const isRejected =
    record.validation_status ===
    "rejected";

  const allMismatches =
  reconciliation?.reconciliation?.mismatches ?? [];

const hasAuthoritativeConflicts =
  allMismatches.some(
    (mismatch: any) =>
      mismatch.existing_record_status === "verified"
  );

const hasConflicts =
  record.validation_status !== "verified"
    ? allMismatches.length > 0
    : hasAuthoritativeConflicts;

    const displayedMismatches =
  record.validation_status === "verified"
    ? allMismatches.filter(
        (mismatch: any) =>
          mismatch.existing_record_status === "verified"
      )
    : allMismatches;

  const reportStatus =
    isVerified
      ? "VERIFIED"
      : isRejected
      ? "REJECTED"
      : "NEEDS HUMAN REVIEW";

  return (
    <main className="min-h-screen bg-slate-100 pb-12">

      {/* Action bar */}
      <div className="print:hidden sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">

          <button
            onClick={() =>
              router.back()
            }
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            onClick={() =>
              window.print()
            }
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Printer size={17} />
            Print / Save PDF
          </button>

        </div>

      </div>

      {/* Report */}
      <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">

        <article className="overflow-hidden bg-white shadow-xl print:shadow-none">

          {/* Report Header */}
          <header className="border-b-4 border-blue-600 px-8 py-8 md:px-12">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <ShieldCheck size={28} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                    BHOOMISURE AI
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    Land Record Verification Report
                  </h1>

                  <p className="mt-2 text-xs text-slate-500">
                    AI-assisted digitization, validation and
                    reconciliation report
                  </p>

                </div>

              </div>

              <div
                className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-bold ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : isRejected
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >

                {isVerified ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}

                {reportStatus}

              </div>

            </div>

          </header>

          {/* Report metadata */}
          <section className="border-b border-slate-200 bg-slate-50 px-8 py-5 md:px-12">

            <div className="grid gap-4 sm:grid-cols-4">

              <Meta
                label="Record ID"
                value={`#${record.id}`}
              />

              <Meta
                label="Source Document"
                value={`Document #${record.document_id}`}
              />

              <Meta
                label="Document Type"
                value="7/12 Land Record"
              />

              <Meta
                label="AI Confidence"
                value={`${record.overall_confidence ?? 0}%`}
              />

            </div>

          </section>

          {/* Land information */}
          <section className="px-8 py-8 md:px-12">

            <SectionTitle
              icon={<FileText size={17} />}
              title="Extracted Land Information"
            />

            <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">

              <Field
                label="Owner Name"
                value={record.owner_name}
              />

              <Field
                label="Ownership Type"
                value={record.ownership_details}
              />

              <Field
                label="Survey / Gat Number"
                value={record.survey_number}
              />

              <Field
                label="Khasra Number"
                value={record.khasra_number}
              />

              <Field
                label="Khata Number"
                value={record.khata_number}
              />

              <Field
                label="Land Area"
                value={
                  record.area
                    ? `${record.area} ${
                        record.area_unit || ""
                      }`
                    : null
                }
              />

              <Field
                label="Village"
                value={record.village}
              />

              <Field
                label="Tehsil"
                value={record.tehsil}
              />

              <Field
                label="District"
                value={record.district}
              />

              <Field
                label="Land Classification"
                value={
                  record.land_classification
                }
              />

              <Field
                label="Mutation Number"
                value={
                  record.mutation_number
                }
              />

              <Field
                label="Registration Number"
                value={
                  record.registration_number
                }
              />

            </div>

          </section>

          {/* AI confidence */}
          <section className="border-t border-slate-200 px-8 py-8 md:px-12">

            <SectionTitle
              icon={<ShieldCheck size={17} />}
              title="AI Extraction Confidence"
            />

            <div className="mt-5 rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-bold text-slate-700">
                    Overall confidence
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Confidence assigned to the extracted
                    structured land information.
                  </p>

                </div>

                <p className="text-3xl font-bold text-emerald-600">
                  {record.overall_confidence ?? 0}%
                </p>

              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      record.overall_confidence ??
                        0,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </section>

          {/* Reconciliation */}
          <section className="border-t border-slate-200 px-8 py-8 md:px-12">

            <SectionTitle
              icon={<GitCompare size={17} />}
              title="Cross-Record Reconciliation"
            />

            <div
              className={`mt-5 rounded-xl border p-5 ${
                hasConflicts
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-emerald-200 bg-emerald-50/60"
              }`}
            >

              <div className="flex gap-4">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    hasConflicts
                      ? "bg-amber-100 text-amber-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {hasConflicts ? (
                    <AlertTriangle size={19} />
                  ) : (
                    <CheckCircle2 size={19} />
                  )}
                </div>

                <div className="flex-1">

                  <p className="text-sm font-bold text-slate-800">

                    {hasConflicts
                      ? "Conflicting information detected"
                      : "No conflicting information detected"}

                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">

                    {hasConflicts
  ? reconciliation?.reconciliation?.message ||
    "Conflicting information was detected against existing records."
  : "Existing verified records match the current record."}

                  </p>

                </div>

              </div>

              {hasConflicts && displayedMismatches.length ? (
                <div className="mt-5 overflow-hidden rounded-lg border border-amber-200 bg-white">

                  <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <span>Field</span>
                    <span>Existing</span>
                    <span>Current</span>
                  </div>


                    {/*
                    {reconciliation.reconciliation.mismatches.map(
                        (mismatch, index) => ( 
                     */}
                  {displayedMismatches.map(
                    (mismatch, index) => (
                      <div
                        key={`${mismatch.field}-${index}`}
                        className="grid grid-cols-3 border-b border-slate-100 px-4 py-3 text-xs last:border-0"
                      >
                        <span className="font-semibold text-slate-700">
                          {formatFieldName(
                            mismatch.field
                          )}
                        </span>

                        <span className="text-red-600">
                          {mismatch.existing_value ||
                            "—"}
                        </span>

                        <span className="font-semibold text-slate-800">
                          {mismatch.new_value ||
                            "—"}
                        </span>
                      </div>
                    )
                  )}

                </div>
              ) : null}

            </div>

          </section>

          {/* Verification */}
          <section className="border-t border-slate-200 px-8 py-8 md:px-12">

            <SectionTitle
              icon={<CheckCircle2 size={17} />}
              title="Verification Outcome"
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              <Outcome
                label="Current Status"
                value={reportStatus}
                active
              />

              <Outcome
                label="Reconciliation"
                value={
                  hasConflicts
                    ? "Conflict Detected"
                    : "No Conflict"
                }
                warning={hasConflicts}
              />

              <Outcome
                label="Record Confidence"
                value={`${record.overall_confidence ?? 0}%`}
              />

            </div>

          </section>

          {/* Integrity */}
          <section className="border-t border-slate-200 bg-slate-50 px-8 py-8 md:px-12">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <LockKeyhole size={18} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-800">
                  Record Integrity & Auditability
                </p>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                  This report is generated from the
                  BhoomiSure AI land-record repository.
                  Verification actions and record changes
                  are tracked through the system audit layer.
                  Cryptographic integrity anchoring is
                  available for verified records.
                </p>

              </div>

            </div>

          </section>

          {/* Footer */}
          <footer className="border-t border-slate-200 px-8 py-6 md:px-12">

            <div className="flex flex-col gap-3 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <p>
                BhoomiSure AI • StackPulse • SIH 2026 Prototype
              </p>

              <p>
                Generated from verified system records
              </p>

            </div>

          </footer>

        </article>

      </div>

    </main>
  );
}

/* -------------------------------- */
/* Components */
/* -------------------------------- */

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h2 className="text-sm font-bold text-slate-800">
        {title}
      </h2>

    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="border-b border-slate-100 pb-3">

      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || "Not available"}
      </p>

    </div>
  );
}

function Outcome({
  label,
  value,
  active,
  warning,
}: {
  label: string;
  value: string;
  active?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        warning
          ? "border-amber-200 bg-amber-50"
          : active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >

      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-bold ${
          warning
            ? "text-amber-700"
            : active
            ? "text-emerald-700"
            : "text-slate-700"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

function formatFieldName(
  field: string
) {
  return field
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}