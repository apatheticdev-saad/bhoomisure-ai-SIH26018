
"use client";
import ReconciliationFindings from "@/components/ReconciliationFindings";
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
  Save,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

type VerificationData = {
  id: number;
  document_id: number;

  document: {
    file_name: string;
    document_type: string;
    language: string | null;
    status: string;
    file_url: string;
  };

  extracted_data: Record<string, string | null>;

  overall_confidence: number | null;

  validation_status: string;

  validation_results: {
    id: number;
    rule_name: string;
    status: string;
    severity: string;
    message: string;
  }[];
};

type VerificationResponse = {
  message: string;
  record_id: number;
  action: string;
  validation_status: string;
  changed_fields: Record<
    string,
    {
      old: string | null;
      new: string | null;
    }
  >;
  audit_log_created: boolean;
  integrity_block_created: boolean;
  updated_at: string;
  integrity?: {
    block_number: number;
    data_hash: string;
    previous_hash: string;
    current_hash: string;
  };
};

const fields = [
  "owner_name",
  "survey_number",
  "khasra_number",
  "khata_number",
  "area",
  "area_unit",
  "village",
  "tehsil",
  "district",
  "land_classification",
  "ownership_details",
  "mutation_number",
  "registration_number",
];

const fieldLabels: Record<string, string> = {
  owner_name: "Owner Name",
  survey_number: "Survey Number",
  khasra_number: "Khasra Number",
  khata_number: "Khata Number",
  area: "Land Area",
  area_unit: "Area Unit",
  village: "Village",
  tehsil: "Tehsil / Taluka",
  district: "District",
  land_classification: "Land Classification",
  ownership_details: "Ownership Details",
  mutation_number: "Mutation / Ferfar Number",
  registration_number: "Registration Number",
};

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const recordId = params.id as string;

  const [data, setData] =
    useState<VerificationData | null>(null);

  const [formData, setFormData] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [integrityResult, setIntegrityResult] =
  useState<VerificationResponse["integrity"] | null>(null);

  async function loadRecord() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/verification/${recordId}`
      );

      if (!response.ok) {
        throw new Error("Record could not be loaded.");
      }

      const result = await response.json();

      setData(result);

      const initialForm: Record<string, string> = {};

      for (const field of fields) {
        initialForm[field] =
          result.extracted_data?.[field] ?? "";
      }

      setFormData(initialForm);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load this verification record."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  function updateField(
    field: string,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function performAction(
  action: "approve" | "correct" | "reject"
) {
  if (!data || saving) return;

  try {
    setSaving(true);
    setError("");
    setMessage("");
    setIntegrityResult(null);

    const response = await fetch(
      `${API_URL}/api/verification/${recordId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          action,
        }),
      }
    );

    const result: VerificationResponse =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Verification action failed."
      );
    }

    setData((previous) =>
      previous
        ? {
            ...previous,
            validation_status:
              result.validation_status,
            extracted_data: {
              ...previous.extracted_data,
              ...formData,
            },
          }
        : previous
    );

    setIntegrityResult(
      result.integrity ?? null
    );

    setMessage(
      action === "approve"
        ? "Record approved successfully."
        : action === "correct"
          ? "Record corrected and verified successfully."
          : "Record rejected successfully."
    );

    /*
     * Give the reviewer a moment to see the result,
     * then return to the verification queue.
     */
    setTimeout(() => {
      router.push("/verification");
    }, 1600);
  } catch (err) {
    console.error(err);

    setError(
      err instanceof Error
        ? err.message
        : "Verification action failed."
    );
  } finally {
    setSaving(false);
  }
}
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">

        <div className="text-center">

          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-400">
            Loading verification record...
          </p>

        </div>

      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">

        <div className="text-center">

          <AlertTriangle
            size={32}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-4 font-bold">
            Record not found
          </h2>

          <Link
            href="/verification"
            className="mt-4 inline-block text-sm font-semibold text-blue-600"
          >
            Back to verification queue
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur md:px-8">

        <div className="flex items-center gap-4">

          <Link
            href="/verification"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
              HUMAN VERIFICATION
            </p>

            <h1 className="text-lg font-bold">
              Review Record #{data.id}
            </h1>

          </div>

        </div>

        <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">

          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          Evidence review mode

        </div>

      </header>

      <div className="mx-auto max-w-[1450px] p-6 md:p-8">

        {/* Record information */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">

          <InfoCard
            label="Document"
            value={data.document.file_name}
          />

          <InfoCard
            label="Document Type"
            value={data.document.document_type}
          />

          <InfoCard
            label="AI Confidence"
            value={`${data.overall_confidence ?? 0}%`}
          />

          <InfoCard
  label="Current Status"
  value={data.validation_status.replace(/_/g, " ")}
/>

        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {integrityResult && (
  <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        <ShieldCheck
          size={18}
          className="text-emerald-600"
        />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-emerald-800">
          Record Integrity Secured
        </p>

        <p className="mt-1 text-xs text-emerald-700">
          This verified record has been anchored to the
          SHA-256 integrity chain.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-white/70 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Block
            </p>
            <p className="mt-1 text-xs font-bold text-slate-700">
              #{integrityResult.block_number}
            </p>
          </div>

          <div className="rounded-lg bg-white/70 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Algorithm
            </p>
            <p className="mt-1 text-xs font-bold text-slate-700">
              SHA-256
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-lg bg-white/70 p-2.5">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Current Hash
          </p>

          <p className="mt-1 break-all font-mono text-[10px] text-slate-600">
            {integrityResult.current_hash}
          </p>
        </div>
      </div>
    </div>
  </div>
)}


        {/* Reconciliation Findings */}
        <div className="mb-6">
     <ReconciliationFindings recordId={Number(recordId)} />
          </div>
        {/* Main review area */}
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">

          {/* Evidence */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h3 className="font-bold">
                Source Evidence
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Original document used for AI extraction.
              </p>

            </div>

            <div className="p-5">

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                {data.document.file_name
                  .toLowerCase()
                  .match(/\.(jpg|jpeg|png)$/) ? (

                  <img
                    src={`${API_URL}${data.document.file_url}`}
                    alt="Original land document"
                    className="max-h-[650px] w-full object-contain"
                  />

                ) : (

                  <div className="flex min-h-[450px] flex-col items-center justify-center p-8 text-center">

                    <FileText
                      size={48}
                      className="text-slate-300"
                    />

                    <p className="mt-4 text-sm font-semibold text-slate-600">
                      PDF document
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Open the original document for detailed
                      visual verification.
                    </p>

                    <a
                      href={`${API_URL}${data.document.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Open Original Document
                    </a>

                  </div>

                )}

              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-xs font-bold text-blue-800">
                    Evidence-based verification
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-700">
                    Compare the extracted values against the source
                    document before approving the record.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* Extracted data */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-bold">
                    Extracted Land Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Review and correct AI-extracted values.
                  </p>

                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                  HUMAN REVIEW
                </span>

              </div>

            </div>

            <div className="p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                {fields.map((field) => (

                  <div key={field}>

                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {fieldLabels[field]}
                    </label>

                    <input
                      value={formData[field] ?? ""}
                      onChange={(event) =>
                        updateField(
                          field,
                          event.target.value
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />

                  </div>

                ))}

              </div>

              {/* Validation results */}
              <div className="mt-7 border-t border-slate-100 pt-6">

                

                <h4 className="text-sm font-bold">
                  Validation Findings
                </h4>

                <div className="mt-3 space-y-2">

                  {data.validation_results.length === 0 ? (

                    <p className="text-xs text-slate-400">
                      No validation findings available.
                    </p>

                  ) : (

                    data.validation_results.map(
                      (validation) => (

                        <div
                          key={validation.id}
                          className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
                        >

                          {validation.status === "passed" ? (

                            <CheckCircle2
                              size={17}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />

                          ) : validation.status === "warning" ? (

                            <AlertTriangle
                              size={17}
                              className="mt-0.5 shrink-0 text-amber-500"
                            />

                          ) : (

                            <XCircle
                              size={17}
                              className="mt-0.5 shrink-0 text-red-500"
                            />

                          )}

                          <div className="min-w-0">

                            <p className="text-xs font-bold capitalize">
                              {validation.rule_name.replace(
                                /_/g,
                                " "
                              )}
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-slate-400">
                              {validation.message}
                            </p>

                          </div>

                          <span
                            className={`ml-auto shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ${
                              validation.status ===
                              "passed"
                                ? "bg-emerald-50 text-emerald-600"
                                : validation.status ===
                                    "warning"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >
                            {validation.status}
                          </span>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

              {/* Actions */}
              <div className="mt-7 border-t border-slate-100 pt-6">

                <p className="mb-3 text-xs font-semibold text-slate-500">
                  Verification Decision
                </p>

                <div className="grid gap-3 sm:grid-cols-3">

                  <button
  disabled={saving}
  onClick={() => performAction("approve")}
  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving ? (
    <>
      <Activity
        size={16}
        className="animate-spin"
      />
      Processing...
    </>
  ) : (
    <>
      <CheckCircle2 size={16} />
      Approve
    </>
  )}
</button>

                  <button
                    disabled={saving}
                    onClick={() =>
                      performAction("correct")
                    }
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                    Correct & Verify
                  </button>

                  <button
                    disabled={saving}
                    onClick={() =>
                      performAction("reject")
                    }
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                </div>

                <p className="mt-3 text-[10px] leading-4 text-slate-400">
                  Every verification decision is recorded in the
                  BhoomiSure audit trail.
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}


function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}