"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Clock3,
  Database,
  Search,
  User,
  MapPin,
  Hash,
  RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

type DocumentData = {
  id: number;
  file_name: string;
  document_type: string | null;
  language: string | null;
  status: string;
  uploaded_at: string | null;
};

type ValidationResult = {
  id: number;
  rule_name: string;
  status: string;
  severity: string;
  message: string;
};

type VerificationData = {
  record_id: number;
  document: DocumentData;
  extracted_data: Record<string, string | null>;
  overall_confidence: number | null;
  validation_status: string;
  validation_results: ValidationResult[];
  file_url: string;
};

type IntegrityData = {
  record_id: number;
  current_data_hash: string;
  blocks: {
    block_number: number;
    data_hash: string;
    previous_hash: string;
    current_hash: string;
    created_at: string | null;
  }[];
};

const fields = [
  ["Owner Name", "owner_name"],
  ["Survey Number", "survey_number"],
  ["Khasra Number", "khasra_number"],
  ["Khata Number", "khata_number"],
  ["Area", "area"],
  ["Area Unit", "area_unit"],
  ["Village", "village"],
  ["Tehsil", "tehsil"],
  ["District", "district"],
  ["Land Classification", "land_classification"],
  ["Ownership Details", "ownership_details"],
  ["Mutation Number", "mutation_number"],
  ["Registration Number", "registration_number"],
] as const;

export default function LandRecordDetailPage() {
  const params = useParams();
  const router = useRouter();

  const recordId = params.id;

  const [record, setRecord] = useState<RecordData | null>(null);
  const [verification, setVerification] =
    useState<VerificationData | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadRecord() {
    try {
      setError("");

      const [recordRes, verificationRes, integrityRes] =
        await Promise.all([
          fetch(`${API}/api/land-records/${recordId}`),
          fetch(`${API}/api/verification/${recordId}`),
          fetch(`${API}/api/integrity/record/${recordId}`),
        ]);

      if (!recordRes.ok) {
        throw new Error("Land record not found");
      }

      const recordData = await recordRes.json();
      setRecord(recordData);

      if (verificationRes.ok) {
        const verificationData = await verificationRes.json();
        setVerification(verificationData);
      }

      if (integrityRes.ok) {
        const integrityData = await integrityRes.json();
        setIntegrity(integrityData);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load land record"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadRecord();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-3 text-gray-500">Loading land record...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Unable to load record
          </h2>
          <p className="mt-2 text-gray-500">{error}</p>

          <button
            onClick={() => router.push("/records")}
            className="mt-6 px-4 py-2 rounded-lg bg-gray-900 text-white"
          >
            Back to Records
          </button>
        </div>
      </div>
    );
  }

  const isVerified =
    record.validation_status === "verified" ||
    record.validation_status === "validated";

  const confidence = record.overall_confidence ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/records"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Land Record
              </p>

              <h1 className="text-xl font-bold text-gray-900">
                Record #{record.id}
              </h1>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* TOP STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatusCard
            icon={<ShieldCheck size={22} />}
            title="Verification Status"
            value={isVerified ? "Verified" : "Needs Review"}
            positive={isVerified}
          />

          <StatusCard
            icon={<Search size={22} />}
            title="Overall Confidence"
            value={`${confidence}%`}
            positive={confidence >= 70}
          />

          <StatusCard
            icon={<Database size={22} />}
            title="Record Integrity"
            value={integrity?.blocks?.length ? "Anchored" : "Not Anchored"}
            positive={Boolean(integrity?.blocks?.length)}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* MAIN CONTENT */}
          <div className="xl:col-span-2 space-y-6">
            {/* DOCUMENT */}
            <section className="bg-white rounded-xl border shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={21} />

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Source Document
                    </h2>

                    <p className="text-xs text-gray-500">
                      Original uploaded land document
                    </p>
                  </div>
                </div>

                {verification?.document && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {verification.document.document_type || "Land Record"}
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="File Name"
                    value={
                      verification?.document?.file_name || "Not available"
                    }
                  />

                  <InfoItem
                    label="Document Type"
                    value={
                      verification?.document?.document_type || "Not specified"
                    }
                  />

                  <InfoItem
                    label="Language"
                    value={
                      verification?.document?.language || "Not specified"
                    }
                  />

                  <InfoItem
                    label="Processing Status"
                    value={verification?.document?.status || "Processed"}
                  />
                </div>

                {verification?.file_url && (
                  <a
                    href={`${API}${verification.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
                  >
                    <FileText size={16} />
                    Open Original Document
                  </a>
                )}
              </div>
            </section>

            {/* LAND DETAILS */}
            <section className="bg-white rounded-xl border shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-600" size={21} />

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Land Record Details
                    </h2>

                    <p className="text-xs text-gray-500">
                      Structured information extracted from the document
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {fields.map(([label, key]) => (
                  <div
                    key={key}
                    className="border-b border-gray-100 pb-4"
                  >
                    <p className="text-xs text-gray-500 mb-1">{label}</p>

                    <p className="text-sm font-medium text-gray-900">
                      {record[key] || "Not available"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* VALIDATION */}
            <section className="bg-white rounded-xl border shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-purple-600" size={21} />

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Validation Findings
                    </h2>

                    <p className="text-xs text-gray-500">
                      Automated validation performed on this record
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {verification?.validation_results?.length ? (
                  <div className="space-y-3">
                    {verification.validation_results.map((item) => {
                      const passed =
                        item.status?.toLowerCase() === "passed" ||
                        item.status?.toLowerCase() === "valid" ||
                        item.status?.toLowerCase() === "success";

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-4 rounded-lg border"
                        >
                          {passed ? (
                            <CheckCircle2
                              className="text-green-600 mt-0.5"
                              size={18}
                            />
                          ) : (
                            <AlertTriangle
                              className="text-amber-500 mt-0.5"
                              size={18}
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-medium text-gray-900">
                                {item.rule_name}
                              </p>

                              <span className="text-xs text-gray-500 uppercase">
                                {item.severity}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No validation findings available.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* CONFIDENCE */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center gap-3">
                <Search className="text-blue-600" size={20} />

                <h2 className="font-semibold">Confidence Analysis</h2>
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-gray-500">
                    Overall confidence
                  </span>

                  <span className="text-3xl font-bold text-gray-900">
                    {confidence}%
                  </span>
                </div>

                <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(Math.max(confidence, 0), 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Confidence combines extracted-field quality and document
                  validation signals.
                </p>
              </div>
            </section>

            {/* VERIFICATION */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center gap-3">
                <User className="text-indigo-600" size={20} />

                <h2 className="font-semibold">Verification</h2>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current status</span>

                  <span
                    className={`font-medium ${
                      isVerified ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {record.validation_status}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Record ID</span>
                  <span className="font-medium">#{record.id}</span>
                </div>

                <Link
                  href={`/verification/${record.id}`}
                  className="mt-3 block text-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Open Verification Workspace
                </Link>
              </div>
            </section>

            {/* INTEGRITY */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-600" size={20} />

                <h2 className="font-semibold">Record Integrity</h2>
              </div>

              {integrity?.blocks?.length ? (
                <div className="mt-5 space-y-4">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={17} />
                      <span className="text-sm font-medium">
                        Cryptographically anchored
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Latest Block
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      #{integrity.blocks[0].block_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Current Data Hash
                    </p>

                    <p className="mt-1 text-[11px] break-all font-mono text-gray-600">
                      {integrity.current_data_hash}
                    </p>
                  </div>

                  <Link
                    href="/integrity"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    <ShieldCheck size={16} />
                    View Integrity Chain
                  </Link>
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    This record has not been anchored yet.
                  </p>

                  <Link
                    href="/integrity"
                    className="mt-4 block text-center px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Open Integrity
                  </Link>
                </div>
              )}
            </section>

            {/* AUDIT */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center gap-3">
                <Clock3 className="text-orange-600" size={20} />

                <h2 className="font-semibold">Audit Trail</h2>
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Verification and correction actions for this record are
                recorded in the audit history.
              </p>

              <Link
                href={`/audit?record_id=${record.id}`}
                className="mt-4 block text-center px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                View Audit Trail
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  value,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            positive ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1 break-words">
        {value}
      </p>
    </div>
  );
}