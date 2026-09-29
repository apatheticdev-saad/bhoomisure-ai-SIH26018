"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";

type ProcessingResult = {
  document_id: number;
  record_id?: number;
  status: string;
  overall_confidence?: number;
  validation_status?: string;
  extracted_data?: Record<string, string | null>;
  field_confidence?: Record<string, number>;
  validation_results?: {
    rule_name: string;
    status: string;
    severity: string;
    message: string;
  }[];
  raw_text?: string;
  message?: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("7/12");
  const [language, setLanguage] = useState("Marathi + English");
  const [dragging, setDragging] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState("");

  function selectFile(selectedFile: File | null) {
    if (!selectedFile) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowed.includes(selectedFile.type)) {
      setError("Please select a PDF, JPG or PNG file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be below 10 MB.");
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    selectFile(event.target.files?.[0] ?? null);
  }

  async function uploadAndProcess() {
    if (!file) {
      setError("Please select a document first.");
      return;
    }

    try {
      setError("");
      setResult(null);
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("language", language);

      const uploadResponse = await fetch(
        `${API_URL}/api/documents/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          errorData.detail || "Document upload failed."
        );
      }

      const uploadData = await uploadResponse.json();

      setUploading(false);
      setProcessing(true);

      const processResponse = await fetch(
        `${API_URL}/api/documents/${uploadData.document_id}/process`,
        {
          method: "POST",
        }
      );

      const processData = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(
          processData.detail || "Document processing failed."
        );
      }

      setResult(processData);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  }

  function resetUpload() {
    setFile(null);
    setResult(null);
    setError("");
  }

  const extractedData = result?.extracted_data ?? {};

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-[76px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                BhoomiSure AI
              </p>
              <h1 className="text-lg font-bold">
                Document Digitization
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI processing engine online
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-8 md:px-8">
        {/* Heading */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight">
            Digitize Land Document
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload a legacy land record and BhoomiSure AI will
            extract, normalize and validate the information.
          </p>
        </div>

        {/* Pipeline */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PipelineStep
              number="01"
              title="Upload"
              active={!result}
            />

            <PipelineLine />

            <PipelineStep
              number="02"
              title="OCR + Extract"
              active={processing || !!result}
            />

            <PipelineLine />

            <PipelineStep
              number="03"
              title="Validate"
              active={!!result}
            />

            <PipelineLine />

            <PipelineStep
              number="04"
              title="Human Review"
              active={
                result?.validation_status === "needs_review"
              }
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Upload section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="font-bold">Document Details</h3>
              <p className="mt-1 text-xs text-slate-400">
                Select the record type and upload the source document.
              </p>
            </div>

            {/* Document type */}
            <label className="mb-2 block text-xs font-bold text-slate-600">
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mb-5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option>7/12</option>
              <option>8A</option>
              <option>Ferfar / Mutation</option>
              <option>Property Card</option>
              <option>Other Land Record</option>
            </select>

            {/* Language */}
            <label className="mb-2 block text-xs font-bold text-slate-600">
              Document Language
            </label>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option>Marathi + English</option>
              <option>Marathi</option>
              <option>English</option>
            </select>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                selectFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Upload size={25} />
              </div>

              <h4 className="mt-4 text-sm font-bold">
                {file
                  ? file.name
                  : "Drop your document here"}
              </h4>

              <p className="mt-1 text-xs text-slate-400">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "or click to browse from your computer"}
              </p>

              <p className="mt-4 text-[10px] font-medium text-slate-400">
                PDF · JPG · PNG · Maximum 10 MB
              </p>
            </div>

            {/* Selected file */}
            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
                  <FileText size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">
                    {file.name}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {documentType} · {language}
                  </p>
                </div>

                <CheckCircle2
                  size={18}
                  className="text-emerald-500"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {/* Button */}
            <button
              onClick={uploadAndProcess}
              disabled={!file || uploading || processing}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Uploading document...
                </>
              ) : processing ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  AI processing document...
                </>
              ) : (
                <>
                  <ScanText size={18} />
                  Process Document
                </>
              )}
            </button>

            {result && (
              <button
                onClick={resetUpload}
                className="mt-3 w-full text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                Process another document
              </button>
            )}
          </section>

          {/* Results section */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">
                    Extraction & Validation
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Structured information extracted from the document.
                  </p>
                </div>

                {result && (
                  <StatusBadge
                    status={result.validation_status}
                  />
                )}
              </div>
            </div>

            {!result ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <ScanText size={28} />
                </div>

                <h4 className="mt-5 text-sm font-bold text-slate-700">
                  Awaiting document
                </h4>

                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                  Upload a land document to see OCR output,
                  extracted fields, confidence scores and validation
                  results here.
                </p>
              </div>
            ) : (
              <div className="p-6">
                {/* Confidence */}
                <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Overall AI Confidence
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {result.overall_confidence ?? 0}%
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <ShieldCheck size={22} />
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${Math.min(
                          result.overall_confidence ?? 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Extracted fields */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold">
                      Extracted Fields
                    </h4>

                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      AI generated
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(extractedData).map(
                      ([field, value]) => (
                        <ExtractedField
                          key={field}
                          field={field}
                          value={value}
                          confidence={
                            result.field_confidence?.[field] ?? 0
                          }
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Validation */}
                <div>
                  <h4 className="mb-3 text-sm font-bold">
                    Validation Results
                  </h4>

                  <div className="space-y-2">
                    {result.validation_results?.map(
                      (validation, index) => (
                        <div
                          key={`${validation.rule_name}-${index}`}
                          className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
                        >
                          {validation.status === "passed" ? (
                            <CheckCircle2
                              size={16}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />
                          ) : validation.status ===
                            "warning" ? (
                            <AlertTriangle
                              size={16}
                              className="mt-0.5 shrink-0 text-amber-500"
                            />
                          ) : (
                            <AlertTriangle
                              size={16}
                              className="mt-0.5 shrink-0 text-red-500"
                            />
                          )}

                          <div>
                            <p className="text-xs font-semibold">
                              {validation.rule_name.replace(
                                /_/g,
                                " "
                              )}
                            </p>

                            <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                              {validation.message}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Review notice */}
                {result.validation_status ===
                  "needs_review" && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <AlertTriangle
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        Human verification required
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-amber-700">
                        This record contains low-confidence or
                        failed validation fields. A Revenue Officer
                        should review the original document before
                        marking the record as verified.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function PipelineStep({
  number,
  title,
  active,
}: {
  number: string;
  title: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-xs font-semibold ${
          active ? "text-slate-700" : "text-slate-400"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

function PipelineLine() {
  return (
    <div className="hidden h-px flex-1 bg-slate-200 md:block" />
  );
}

function ExtractedField({
  field,
  value,
  confidence,
}: {
  field: string;
  value: string | null;
  confidence: number;
}) {
  const label = field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>

        <span
          className={`text-[10px] font-bold ${
            confidence >= 70
              ? "text-emerald-600"
              : "text-amber-600"
          }`}
        >
          {confidence}%
        </span>
      </div>

      <p className="mt-2 min-h-[18px] text-xs font-semibold text-slate-700">
        {value || "Not detected"}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status?: string;
}) {
  if (status === "validated" || status === "verified") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
        VERIFIED
      </span>
    );
  }

  if (status === "needs_review") {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
        NEEDS REVIEW
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
      PENDING
    </span>
  );
}