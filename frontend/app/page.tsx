// frontend/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
  Upload,
  XCircle,
  ArrowRight,
  Map,
  ClipboardCheck,
  BarChart3,
  Menu,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type DashboardData = {
  documents: {
    total: number;
    processed: number;
    processing: number;
    failed: number;
  };

  records: {
    total: number;
    verified: number;
    pending_verification: number;
    rejected: number;
  };

  confidence: {
    average: number;
  };

  validation: {
    failures: number;
    warnings: number;
  };

  recent_documents: {
    document_id: number;
    file_name: string;
    document_type: string;
    status: string;
    uploaded_at: string;
    processed_at: string | null;
    confidence: number;
    validation_status: string;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/dashboard/stats`
      );

      if (!response.ok) {
        throw new Error("Failed to load dashboard.");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const verificationPercentage =
    useMemo(() => {
      if (!data || data.records.total === 0) {
        return 0;
      }

      return Math.round(
        (data.records.verified /
          data.records.total) *
          100
      );
    }, [data]);

  const reviewPercentage =
    useMemo(() => {
      if (!data || data.records.total === 0) {
        return 0;
      }

      return Math.round(
        (data.records.pending_verification /
          data.records.total) *
          100
      );
    }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f5f7]">
        <div className="h-1 bg-gradient-to-r from-[#e67e22] via-white to-[#138a4b]" />

        <header className="border-b border-[#d7dde3] bg-white">
          <div className="mx-auto max-w-[1500px] px-6 py-5">
            <div className="h-5 w-72 animate-pulse bg-slate-200" />
            <div className="mt-3 h-8 w-96 animate-pulse bg-slate-100" />
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-6 py-8">
          <div className="h-6 w-52 animate-pulse bg-slate-200" />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f5f7] p-6">
        <div className="w-full max-w-md border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={34}
            className="mx-auto text-red-600"
          />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 bg-[#12395b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2d49]"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f5f7] text-[#263746]">

      {/* ===================================================== */}
      {/* GOVERNMENT STYLE TOP STRIP */}
      {/* ===================================================== */}

      <div className="border-b border-slate-200 bg-[#f8f9fa]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-1.5 text-[11px] text-slate-600 md:px-7">

          <div className="flex items-center gap-4">
            <span>
              Land Records Digitization & Validation Portal
            </span>

            <span className="hidden h-3 w-px bg-slate-300 md:block" />

            <span className="hidden md:block">
              Smart India Hackathon 2026
            </span>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span>English</span>
            <span className="h-3 w-px bg-slate-300" />
            <span>Help</span>
          </div>

        </div>
      </div>

      {/* ===================================================== */}
      {/* TRICOLOR ACCENT */}
      {/* ===================================================== */}

      <div className="flex h-1">
        <div className="w-1/3 bg-[#e67e22]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138a4b]" />
      </div>

      {/* ===================================================== */}
      {/* MAIN PORTAL HEADER */}
      {/* ===================================================== */}

      <header className="border-b border-[#183b5a] bg-[#12395b] text-white">

        <div className="mx-auto max-w-[1500px] px-5 md:px-7">

          <div className="flex min-h-[78px] items-center justify-between gap-6">

            {/* BRAND */}

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center border border-white/20 bg-white/10">
                <ShieldCheck size={27} />
              </div>

              <div>
                <div className="flex items-center gap-3">

                  <h1 className="text-[20px] font-bold tracking-wide">
                    BHOOMISURE AI
                  </h1>

                  <span className="hidden border border-white/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80 sm:inline-block">
                    SIH 2026 • Prototype
                  </span>

                </div>

                <p className="mt-1 text-[11px] text-blue-100">
                  Intelligent Land Record Digitization & Validation System
                </p>
              </div>

            </div>

            {/* USER / SYSTEM STATUS */}

            <div className="hidden items-center gap-5 md:flex">

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-blue-200">
                  System Status
                </p>

                <div className="mt-1 flex items-center justify-end gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs font-semibold">
                    Operational
                  </span>
                </div>
              </div>

              <div className="h-9 w-px bg-white/20" />

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                RO
              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* PORTAL NAVIGATION */}
          {/* ================================================= */}

          <nav className="flex min-h-[43px] items-center gap-1 overflow-x-auto border-t border-white/10">

            <PortalNavItem
              active
              icon={<BarChart3 size={14} />}
              label="Dashboard"
              onClick={() => router.push("/dashboard")}
            />

            <PortalNavItem
              icon={<FileText size={14} />}
              label="Land Records"
              onClick={() => router.push("/records")}
            />

            <PortalNavItem
              icon={<Upload size={14} />}
              label="Document Processing"
              onClick={() => router.push("/upload")}
            />

            <PortalNavItem
              icon={<ClipboardCheck size={14} />}
              label="Verification"
              onClick={() => router.push("/verification")}
            />

            <PortalNavItem
              icon={<Map size={14} />}
              label="Map View"
              onClick={() => router.push("/map")}
            />

          </nav>

        </div>
      </header>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-7 md:py-8">

        {/* BREADCRUMB */}

        <div className="mb-5 flex items-center gap-2 text-[11px] text-slate-500">

          <span>Home</span>

          <span className="text-slate-300">
            /
          </span>

          <span className="font-semibold text-[#12395b]">
            Dashboard
          </span>

        </div>

        {/* PAGE TITLE */}

        <section className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2877b8]">
              Revenue & Land Records Administration
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#263746] md:text-[28px]">
              Land Records Dashboard
            </h2>

            <p className="mt-1.5 max-w-3xl text-sm text-slate-500">
              Central monitoring view for document processing,
              structured land-record extraction, validation and
              human verification.
            </p>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => router.push("/records")}
              className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-[#31516b] shadow-sm hover:bg-slate-50"
            >
              <Search size={15} />
              Search Records
            </button>

            <button
              onClick={() => router.push("/upload")}
              className="flex items-center gap-2 bg-[#1769aa] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#12588f]"
            >
              <Upload size={15} />
              Process Document
            </button>

          </div>

        </section>

        {/* ================================================= */}
        {/* PRIMARY STATISTICS */}
        {/* ================================================= */}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <GovernmentMetric
            title="Total Documents"
            value={data.documents.total}
            subtitle={`${data.documents.processed} processed`}
            icon={<FileText size={21} />}
            accent="blue"
          />

          <GovernmentMetric
            title="Land Records"
            value={data.records.total}
            subtitle={`${data.records.verified} verified`}
            icon={<Database size={21} />}
            accent="navy"
          />

          <GovernmentMetric
            title="Pending Verification"
            value={data.records.pending_verification}
            subtitle={`${reviewPercentage}% of total records`}
            icon={<AlertTriangle size={21} />}
            accent="orange"
          />

          <GovernmentMetric
            title="Average Confidence"
            value={`${data.confidence.average}%`}
            subtitle="AI-assisted extraction"
            icon={<ShieldCheck size={21} />}
            accent="green"
          />

        </section>

        {/* ================================================= */}
        {/* STATUS SUMMARY */}
        {/* ================================================= */}

        <section className="mt-5 border border-slate-200 bg-white">

          <div className="border-b border-slate-200 bg-[#f8fafc] px-5 py-3">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-sm font-bold text-[#263746]">
                  Processing & Verification Summary
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Current status of documents and land records
                </p>
              </div>

              <FileCheck2
                size={18}
                className="text-slate-400"
              />

            </div>

          </div>

          <div className="grid divide-y border-0 md:grid-cols-3 md:divide-x md:divide-y-0">

            <SummaryItem
              icon={<CheckCircle2 size={19} />}
              title="Verified Records"
              value={data.records.verified}
              description={`${verificationPercentage}% of all records`}
              type="green"
            />

            <SummaryItem
              icon={<Clock3 size={19} />}
              title="Documents Processing"
              value={data.documents.processing}
              description="Currently in processing"
              type="blue"
            />

            <SummaryItem
              icon={<XCircle size={19} />}
              title="Rejected Records"
              value={data.records.rejected}
              description={`${data.documents.failed} failed documents`}
              type="red"
            />

          </div>

        </section>

        {/* ================================================= */}
        {/* ANALYTICS */}
        {/* ================================================= */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">

          {/* RECORD VERIFICATION */}

          <div className="border border-slate-200 bg-white">

            <SectionHeader
              title="Record Verification Status"
              description="Current distribution of processed land records"
              icon={<FileCheck2 size={18} />}
            />

            <div className="p-5 md:p-6">

              {/* BAR */}

              <div className="h-7 w-full overflow-hidden border border-slate-200 bg-slate-100">

                {data.records.total > 0 && (

                  <div className="flex h-full">

                    <div
                      className="bg-[#238b57]"
                      style={{
                        width: `${verificationPercentage}%`,
                      }}
                    />

                    <div
                      className="bg-[#e4a329]"
                      style={{
                        width: `${reviewPercentage}%`,
                      }}
                    />

                    {data.records.rejected > 0 && (
                      <div
                        className="bg-[#c83b3b]"
                        style={{
                          width: `${
                            100 -
                            verificationPercentage -
                            reviewPercentage
                          }%`,
                        }}
                      />
                    )}

                  </div>

                )}

              </div>

              {/* LEGEND */}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <StatusLegend
                  color="bg-[#238b57]"
                  label="Verified"
                  value={data.records.verified}
                />

                <StatusLegend
                  color="bg-[#e4a329]"
                  label="Needs Review"
                  value={data.records.pending_verification}
                />

                <StatusLegend
                  color="bg-[#c83b3b]"
                  label="Rejected"
                  value={data.records.rejected}
                />

              </div>

              {/* VALIDATION */}

              <div className="mt-7 border border-slate-200 bg-[#f8fafc]">

                <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-xs font-bold text-[#263746]">
                      Validation Health
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Rule-based validation results
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <span className="border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
                      {data.validation.failures} failures
                    </span>

                    <span className="border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      {data.validation.warnings} warnings
                    </span>

                  </div>

                </div>

                <div className="border-t border-slate-200 px-4 py-3">

                  <div className="flex items-center gap-3">

                    <div className="h-2 flex-1 bg-slate-200">

                      <div
                        className={
                          data.validation.failures === 0 &&
                          data.validation.warnings === 0
                            ? "h-2 bg-[#238b57]"
                            : "h-2 bg-[#e4a329]"
                        }
                        style={{
                          width:
                            data.validation.failures === 0 &&
                            data.validation.warnings === 0
                              ? "100%"
                              : "70%",
                        }}
                      />

                    </div>

                    <span
                      className={`text-[11px] font-bold ${
                        data.validation.failures === 0 &&
                        data.validation.warnings === 0
                          ? "text-[#238b57]"
                          : "text-[#a56b00]"
                      }`}
                    >
                      {data.validation.failures === 0 &&
                      data.validation.warnings === 0
                        ? "Healthy"
                        : "Review Required"}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CONFIDENCE */}

          <div className="border border-slate-200 bg-white">

            <SectionHeader
              title="Extraction Confidence"
              description="Average confidence across processed records"
              icon={<ShieldCheck size={18} />}
            />

            <div className="p-6">

              <div className="flex items-center gap-6">

                <div className="relative h-32 w-32 shrink-0">

                  <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full -rotate-90"
                  >

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#e8edf1"
                      strokeWidth="10"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#238b57"
                      strokeWidth="10"
                      strokeLinecap="butt"
                      strokeDasharray={`${
                        data.confidence.average * 3.016
                      } 301.6`}
                    />

                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-2xl font-bold text-[#263746]">
                      {data.confidence.average}%
                    </span>

                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      Confidence
                    </span>

                  </div>

                </div>

                <div>

                  <p className="text-sm font-bold text-[#263746]">
                    AI-assisted extraction
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Confidence is calculated from extracted
                    land-record fields before human verification.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-[#238b57]">
                    <ShieldCheck size={14} />
                    Human verification remains available
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* RECENT PROCESSING */}
        {/* ================================================= */}

        <section className="mt-5 border border-slate-200 bg-white">

          <SectionHeader
            title="Recent Processing Activity"
            description="Latest documents processed by BhoomiSure AI"
            icon={<FileText size={18} />}
            action={
              <button
                onClick={() => router.push("/records")}
                className="flex items-center gap-1 text-[11px] font-bold text-[#1769aa] hover:text-[#12588f]"
              >
                View All Records
                <ArrowRight size={13} />
              </button>
            }
          />

          <div>

            {data.recent_documents.length === 0 ? (

              <div className="p-8 text-center text-sm text-slate-500">
                No recent processing activity.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[760px]">

                  <thead className="border-b border-slate-200 bg-[#f8fafc]">

                    <tr>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Document
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Confidence
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {data.recent_documents.map(
                      (document) => (

                        <tr
                          key={document.document_id}
                          className="hover:bg-[#fafcfd]"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-100 bg-blue-50 text-[#1769aa]">
                                <FileText size={17} />
                              </div>

                              <div>

                                <p className="max-w-[320px] truncate text-xs font-bold text-[#263746]">
                                  {document.file_name}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  Document #{document.document_id}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span className="text-xs font-medium text-slate-600">
                              {document.document_type}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-1.5 w-16 bg-slate-200">

                                <div
                                  className="h-1.5 bg-[#238b57]"
                                  style={{
                                    width: `${Math.min(
                                      document.confidence,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-xs font-bold text-slate-700">
                                {document.confidence}%
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <StatusBadge
                              status={
                                document.validation_status
                              }
                            />

                          </td>

                          <td className="px-5 py-4 text-right">

                            <button
                              onClick={() =>
                                router.push(
                                  `/records/${document.document_id}`
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#1769aa]"
                            >
                              <ArrowRight size={15} />
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* QUICK SERVICES */}
        {/* ================================================= */}

        <section className="mt-5">

          <div className="mb-3">

            <h3 className="text-sm font-bold text-[#263746]">
              Quick Services
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Common land-record administration activities
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <GovernmentAction
              icon={<Upload size={19} />}
              title="Process New Document"
              description="Upload and process a 7/12, 8A or Ferfar document."
              onClick={() => router.push("/upload")}
            />

            <GovernmentAction
              icon={<Search size={19} />}
              title="Search Land Records"
              description="Search records by owner, survey number or location."
              onClick={() => router.push("/records")}
            />

            <GovernmentAction
              icon={<ClipboardCheck size={19} />}
              title="Human Verification"
              description="Review records requiring officer verification."
              onClick={() => router.push("/verification")}
            />

          </div>

        </section>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <footer className="mt-10 border-t border-slate-200 py-5">

          <div className="flex flex-col gap-2 text-[10px] text-slate-400 md:flex-row md:items-center md:justify-between">

            <p>
              BhoomiSure AI • Intelligent Land Record Digitization
              & Validation System
            </p>

            <p>
              Smart India Hackathon 2026 • Prototype Interface
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}


/* ========================================================= */
/* PORTAL NAV ITEM */
/* ========================================================= */

function PortalNavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[11px] font-semibold transition ${
        active
          ? "border-white bg-white/10 text-white"
          : "border-transparent text-blue-100 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


/* ========================================================= */
/* GOVERNMENT METRIC */
/* ========================================================= */

function GovernmentMetric({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  accent: "blue" | "navy" | "orange" | "green";
}) {
  const styles = {
    blue: {
      border: "border-l-[#1769aa]",
      icon: "bg-[#edf5fb] text-[#1769aa]",
    },
    navy: {
      border: "border-l-[#12395b]",
      icon: "bg-[#eef2f6] text-[#12395b]",
    },
    orange: {
      border: "border-l-[#d98b18]",
      icon: "bg-[#fff6e7] text-[#b66c00]",
    },
    green: {
      border: "border-l-[#238b57]",
      icon: "bg-[#edf8f2] text-[#238b57]",
    },
  };

  return (
    <div
      className={`border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${styles[accent].border}`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-[30px] font-bold leading-none text-[#263746]">
            {value}
          </p>

          <p className="mt-2 text-[11px] text-slate-500">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center ${styles[accent].icon}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* SUMMARY ITEM */
/* ========================================================= */

function SummaryItem({
  icon,
  title,
  value,
  description,
  type,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  type: "green" | "blue" | "red";
}) {
  const colors = {
    green: "text-[#238b57] bg-[#edf8f2]",
    blue: "text-[#1769aa] bg-[#edf5fb]",
    red: "text-[#c83b3b] bg-[#fdf0f0]",
  };

  return (
    <div className="px-5 py-5">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center ${colors[type]}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-xs font-bold text-[#263746]">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <p className="mt-4 text-2xl font-bold text-[#263746]">
        {value}
      </p>

    </div>
  );
}


/* ========================================================= */
/* SECTION HEADER */
/* ========================================================= */

function SectionHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8fafc] px-5 py-4">

      <div className="flex items-center gap-3">

        <div className="text-[#1769aa]">
          {icon}
        </div>

        <div>

          <h3 className="text-sm font-bold text-[#263746]">
            {title}
          </h3>

          <p className="mt-0.5 text-[10px] text-slate-500">
            {description}
          </p>

        </div>

      </div>

      {action}

    </div>
  );
}


/* ========================================================= */
/* STATUS LEGEND */
/* ========================================================= */

function StatusLegend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">

      <span
        className={`h-3 w-3 shrink-0 ${color}`}
      />

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-0.5 text-lg font-bold text-[#263746]">
          {value}
        </p>

      </div>

    </div>
  );
}


/* ========================================================= */
/* STATUS BADGE */
/* ========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status?.toLowerCase() || "";

  if (normalized === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Verified
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
        <XCircle size={11} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
      <AlertTriangle size={11} />
      Needs Review
    </span>
  );
}


/* ========================================================= */
/* QUICK SERVICE */
/* ========================================================= */

function GovernmentAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#1769aa] hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center border border-blue-100 bg-blue-50 text-[#1769aa]">
          {icon}
        </div>

        <ArrowRight
          size={16}
          className="text-slate-300 transition group-hover:text-[#1769aa]"
        />

      </div>

      <h4 className="mt-4 text-sm font-bold text-[#263746]">
        {title}
      </h4>

      <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
        {description}
      </p>

    </button>
  );
}











// // frontend/app/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   AlertTriangle,
//   CheckCircle2,
//   Clock3,
//   Database,
//   FileCheck2,
//   FileText,
//   Search,
//   ShieldCheck,
//   Upload,
//   XCircle,
//   ArrowRight,
// } from "lucide-react";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "http://127.0.0.1:8000";

// type DashboardData = {
//   documents: {
//     total: number;
//     processed: number;
//     processing: number;
//     failed: number;
//   };

//   records: {
//     total: number;
//     verified: number;
//     pending_verification: number;
//     rejected: number;
//   };

//   confidence: {
//     average: number;
//   };

//   validation: {
//     failures: number;
//     warnings: number;
//   };

//   recent_documents: {
//     document_id: number;
//     file_name: string;
//     document_type: string;
//     status: string;
//     uploaded_at: string;
//     processed_at: string | null;
//     confidence: number;
//     validation_status: string;
//   }[];
// };

// export default function DashboardPage() {
//   const router = useRouter();

//   const [data, setData] =
//     useState<DashboardData | null>(null);

//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState("");

//   async function loadDashboard() {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch(
//         `${API_URL}/api/dashboard/stats`
//       );

//       if (!response.ok) {
//         throw new Error(
//           "Failed to load dashboard."
//         );
//       }

//       const result =
//         await response.json();

//       setData(result);
//     } catch (err) {
//       console.error(err);

//       setError(
//         "Unable to load dashboard statistics."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   const verificationPercentage =
//     useMemo(() => {
//       if (!data || data.records.total === 0) {
//         return 0;
//       }

//       return Math.round(
//         (data.records.verified /
//           data.records.total) *
//           100
//       );
//     }, [data]);

//   const reviewPercentage =
//     useMemo(() => {
//       if (!data || data.records.total === 0) {
//         return 0;
//       }

//       return Math.round(
//         (data.records.pending_verification /
//           data.records.total) *
//           100
//       );
//     }, [data]);

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-[#f5f7fb] p-6 md:p-8">
//         <div className="mx-auto max-w-[1450px]">
//           <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

//           <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-100" />

//           <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//             {[1, 2, 3, 4].map((item) => (
//               <div
//                 key={item}
//                 className="h-32 animate-pulse rounded-2xl bg-white"
//               />
//             ))}
//           </div>

//           <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white" />
//         </div>
//       </main>
//     );
//   }

//   if (!data) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-6">
//         <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
//           <AlertTriangle
//             size={32}
//             className="mx-auto text-red-500"
//           />

//           <h2 className="mt-4 font-bold text-slate-800">
//             Dashboard unavailable
//           </h2>

//           <p className="mt-2 text-sm text-red-600">
//             {error}
//           </p>

//           <button
//             onClick={loadDashboard}
//             className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
//           >
//             Retry
//           </button>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

//       {/* Header */}
//       <header className="border-b border-slate-200 bg-white">
//         <div className="mx-auto max-w-[1450px] px-6 py-6 md:px-8">

//           <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//             <div>
//               <div className="flex items-center gap-3">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
//                   <ShieldCheck size={23} />
//                 </div>

//                 <div>
//                   <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
//                     BHOOMISURE AI
//                   </p>

//                   <h1 className="text-2xl font-bold tracking-tight">
//                     Land Intelligence Dashboard
//                   </h1>
//                 </div>

//               </div>

//               <p className="mt-3 max-w-2xl text-sm text-slate-500">
//                 Monitor digitized land records, AI extraction,
//                 validation and human verification from one
//                 workspace.
//               </p>
//             </div>

//             <div className="flex flex-wrap gap-3">

//               <button
//                 onClick={() =>
//                   router.push("/records")
//                 }
//                 className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
//               >
//                 <Search size={16} />
//                 Records
//               </button>

//               <button
//                 onClick={() =>
//                   router.push("/upload")
//                 }
//                 className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
//               >
//                 <Upload size={16} />
//                 Upload Document
//               </button>

//             </div>

//           </div>
//         </div>
//       </header>

//       <div className="mx-auto max-w-[1450px] p-6 md:p-8">

//         {/* KPI CARDS */}
//         <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

//           <MetricCard
//             title="Documents"
//             value={data.documents.total}
//             subtitle={`${data.documents.processed} processed`}
//             icon={<FileText size={20} />}
//             iconClass="bg-blue-50 text-blue-600"
//           />

//           <MetricCard
//             title="Land Records"
//             value={data.records.total}
//             subtitle={`${data.records.verified} verified`}
//             icon={<Database size={20} />}
//             iconClass="bg-indigo-50 text-indigo-600"
//           />

//           <MetricCard
//             title="Needs Review"
//             value={data.records.pending_verification}
//             subtitle={`${reviewPercentage}% of records`}
//             icon={<AlertTriangle size={20} />}
//             iconClass="bg-amber-50 text-amber-600"
//             valueClass="text-amber-600"
//           />

//           <MetricCard
//             title="AI Confidence"
//             value={`${data.confidence.average}%`}
//             subtitle="Average extraction confidence"
//             icon={<ShieldCheck size={20} />}
//             iconClass="bg-emerald-50 text-emerald-600"
//             valueClass="text-emerald-600"
//           />

//         </section>

//         {/* SECONDARY STATUS */}
//         <section className="mt-6 grid gap-4 md:grid-cols-3">

//           <StatusCard
//             icon={<CheckCircle2 size={19} />}
//             title="Verified Records"
//             value={data.records.verified}
//             description={`${verificationPercentage}% of all records`}
//             className="border-emerald-200 bg-emerald-50/60"
//             iconClass="bg-emerald-100 text-emerald-600"
//             valueClass="text-emerald-700"
//           />

//           <StatusCard
//             icon={<Clock3 size={19} />}
//             title="Processing"
//             value={data.documents.processing}
//             description="Documents currently being processed"
//             className="border-blue-200 bg-blue-50/60"
//             iconClass="bg-blue-100 text-blue-600"
//             valueClass="text-blue-700"
//           />

//           <StatusCard
//             icon={<XCircle size={19} />}
//             title="Rejected"
//             value={data.records.rejected}
//             description={`${data.documents.failed} failed documents`}
//             className="border-red-200 bg-red-50/60"
//             iconClass="bg-red-100 text-red-600"
//             valueClass="text-red-700"
//           />

//         </section>

//         {/* MAIN ANALYTICS */}
//         <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

//           {/* Record status */}
//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//             <div className="border-b border-slate-100 px-6 py-5">

//               <div className="flex items-center justify-between">

//                 <div>
//                   <h2 className="font-bold text-slate-800">
//                     Record Verification Status
//                   </h2>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Current distribution of processed land records.
//                   </p>
//                 </div>

//                 <FileCheck2
//                   size={20}
//                   className="text-slate-300"
//                 />

//               </div>

//             </div>

//             <div className="p-6">

//               {/* Progress */}
//               <div className="h-4 overflow-hidden rounded-full bg-slate-100">

//                 {data.records.total > 0 && (
//                   <div className="flex h-full">

//                     <div
//                       className="bg-emerald-500 transition-all"
//                       style={{
//                         width: `${verificationPercentage}%`,
//                       }}
//                     />

//                     <div
//                       className="bg-amber-400 transition-all"
//                       style={{
//                         width: `${reviewPercentage}%`,
//                       }}
//                     />

//                     {data.records.rejected > 0 && (
//                       <div
//                         className="bg-red-500"
//                         style={{
//                           width: `${
//                             100 -
//                             verificationPercentage -
//                             reviewPercentage
//                           }%`,
//                         }}
//                       />
//                     )}

//                   </div>
//                 )}

//               </div>

//               {/* Legend */}
//               <div className="mt-6 grid gap-4 sm:grid-cols-3">

//                 <StatusLegend
//                   color="bg-emerald-500"
//                   label="Verified"
//                   value={data.records.verified}
//                 />

//                 <StatusLegend
//                   color="bg-amber-400"
//                   label="Needs Review"
//                   value={
//                     data.records.pending_verification
//                   }
//                 />

//                 <StatusLegend
//                   color="bg-red-500"
//                   label="Rejected"
//                   value={data.records.rejected}
//                 />

//               </div>

//               {/* Validation */}
//               <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4">

//                 <div className="flex items-center justify-between">

//                   <div>
//                     <p className="text-xs font-bold text-slate-700">
//                       Validation Health
//                     </p>

//                     <p className="mt-1 text-[11px] text-slate-400">
//                       Rule-based validation results
//                     </p>
//                   </div>

//                   <div className="flex gap-2">

//                     <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
//                       {data.validation.failures} failures
//                     </span>

//                     <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
//                       {data.validation.warnings} warnings
//                     </span>

//                   </div>

//                 </div>

//                 <div className="mt-4 flex items-center gap-3">

//                   <div className="flex-1">

//                     <div className="h-2 rounded-full bg-emerald-100">

//                       <div
//                         className="h-2 rounded-full bg-emerald-500"
//                         style={{
//                           width:
//                             data.validation.failures === 0 &&
//                             data.validation.warnings === 0
//                               ? "100%"
//                               : "70%",
//                         }}
//                       />

//                     </div>

//                   </div>

//                   <span className="text-xs font-bold text-emerald-600">
//                     {data.validation.failures === 0 &&
//                     data.validation.warnings === 0
//                       ? "Healthy"
//                       : "Review"}
//                   </span>

//                 </div>

//               </div>

//             </div>
//           </div>

//           {/* Confidence */}
//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//             <div className="border-b border-slate-100 px-6 py-5">

//               <h2 className="font-bold text-slate-800">
//                 AI Extraction Quality
//               </h2>

//               <p className="mt-1 text-xs text-slate-400">
//                 Average confidence across processed records.
//               </p>

//             </div>

//             <div className="flex min-h-[280px] flex-col items-center justify-center p-8">

//               <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[16px] border-slate-100">

//                 <div
//                   className="absolute inset-[-16px] rounded-full border-[16px] border-transparent"
//                   style={{
//                     borderTopColor:
//                       "rgb(16 185 129)",
//                     borderRightColor:
//                       data.confidence.average >= 50
//                         ? "rgb(16 185 129)"
//                         : "transparent",
//                     transform: `rotate(${
//                       -45 +
//                       data.confidence.average *
//                         3.6
//                     }deg)`,
//                   }}
//                 />

//                 <div className="text-center">

//                   <div className="text-4xl font-bold text-slate-800">
//                     {data.confidence.average}%
//                   </div>

//                   <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                     Average Confidence
//                   </div>

//                 </div>

//               </div>

//               <div className="mt-6 flex items-center gap-2 text-xs text-emerald-600">
//                 <ShieldCheck size={15} />
//                 AI-assisted extraction
//               </div>

//             </div>
//           </div>

//         </section>

//         {/* RECENT DOCUMENTS */}
//         <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//           <div className="border-b border-slate-100 px-6 py-5">

//             <div className="flex items-center justify-between">

//               <div>
//                 <h2 className="font-bold text-slate-800">
//                   Recent Processing Activity
//                 </h2>

//                 <p className="mt-1 text-xs text-slate-400">
//                   Latest documents processed by BhoomiSure AI.
//                 </p>
//               </div>

//               <button
//                 onClick={() =>
//                   router.push("/records")
//                 }
//                 className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
//               >
//                 View Records
//                 <ArrowRight size={14} />
//               </button>

//             </div>

//           </div>

//           <div className="divide-y divide-slate-100">

//             {data.recent_documents.length === 0 ? (
//               <div className="p-8 text-center text-sm text-slate-400">
//                 No recent processing activity.
//               </div>
//             ) : (
//               data.recent_documents.map(
//                 (document) => (
//                   <div
//                     key={document.document_id}
//                     className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
//                   >

//                     <div className="flex items-center gap-4">

//                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                         <FileText size={18} />
//                       </div>

//                       <div>

//                         <p className="text-sm font-semibold text-slate-800">
//                           {document.file_name}
//                         </p>

//                         <p className="mt-1 text-xs text-slate-400">
//                           Document #{document.document_id}
//                           {" • "}
//                           {document.document_type}
//                         </p>

//                       </div>

//                     </div>

//                     <div className="flex flex-wrap items-center gap-4">

//                       <div className="text-right">

//                         <p className="text-[10px] uppercase tracking-wide text-slate-400">
//                           Confidence
//                         </p>

//                         <p className="mt-1 text-sm font-bold text-slate-700">
//                           {document.confidence}%
//                         </p>

//                       </div>

//                       <StatusBadge
//                         status={
//                           document.validation_status
//                         }
//                       />

//                       <button
//                         onClick={() =>
//                           router.push(
//                             `/records/${document.document_id}`
//                           )
//                         }
//                         className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
//                       >
//                         <ArrowRight size={16} />
//                       </button>

//                     </div>

//                   </div>
//                 )
//               )
//             )}

//           </div>
//         </section>

//         {/* QUICK ACTIONS */}
//         <section className="mt-6 grid gap-4 md:grid-cols-3">

//           <QuickAction
//             icon={<Upload size={19} />}
//             title="Process New Document"
//             description="Upload a 7/12, 8A or Ferfar document."
//             onClick={() =>
//               router.push("/upload")
//             }
//           />

//           <QuickAction
//             icon={<Search size={19} />}
//             title="Search Land Records"
//             description="Find records by owner, survey or location."
//             onClick={() =>
//               router.push("/records")
//             }
//           />

//           <QuickAction
//             icon={<Clock3 size={19} />}
//             title="Human Verification"
//             description="Review records requiring officer attention."
//             onClick={() =>
//               router.push("/verification")
//             }
//           />

//         </section>

//       </div>
//     </main>
//   );
// }

// /* -------------------------------- */
// /* COMPONENTS */
// /* -------------------------------- */

// function MetricCard({
//   title,
//   value,
//   subtitle,
//   icon,
//   iconClass,
//   valueClass = "text-slate-800",
// }: {
//   title: string;
//   value: string | number;
//   subtitle: string;
//   icon: React.ReactNode;
//   iconClass: string;
//   valueClass?: string;
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//       <div className="flex items-start justify-between">

//         <div>
//           <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
//             {title}
//           </p>

//           <p
//             className={`mt-2 text-3xl font-bold ${valueClass}`}
//           >
//             {value}
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             {subtitle}
//           </p>
//         </div>

//         <div
//           className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
//         >
//           {icon}
//         </div>

//       </div>

//     </div>
//   );
// }

// function StatusCard({
//   icon,
//   title,
//   value,
//   description,
//   className,
//   iconClass,
//   valueClass,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   value: number;
//   description: string;
//   className: string;
//   iconClass: string;
//   valueClass: string;
// }) {
//   return (
//     <div
//       className={`rounded-2xl border p-5 ${className}`}
//     >

//       <div className="flex items-center gap-3">

//         <div
//           className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
//         >
//           {icon}
//         </div>

//         <p className="text-sm font-semibold text-slate-700">
//           {title}
//         </p>

//       </div>

//       <p
//         className={`mt-4 text-3xl font-bold ${valueClass}`}
//       >
//         {value}
//       </p>

//       <p className="mt-1 text-xs text-slate-500">
//         {description}
//       </p>

//     </div>
//   );
// }

// function StatusLegend({
//   color,
//   label,
//   value,
// }: {
//   color: string;
//   label: string;
//   value: number;
// }) {
//   return (
//     <div className="flex items-center gap-3">

//       <span
//         className={`h-3 w-3 rounded-full ${color}`}
//       />

//       <div>
//         <p className="text-xs font-semibold text-slate-600">
//           {label}
//         </p>

//         <p className="text-lg font-bold text-slate-800">
//           {value}
//         </p>
//       </div>

//     </div>
//   );
// }

// function StatusBadge({
//   status,
// }: {
//   status: string;
// }) {
//   const normalized =
//     status?.toLowerCase() || "";

//   if (normalized === "verified") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
//         <CheckCircle2 size={12} />
//         Verified
//       </span>
//     );
//   }

//   if (normalized === "rejected") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700">
//         <XCircle size={12} />
//         Rejected
//       </span>
//     );
//   }

//   return (
//     <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
//       <AlertTriangle size={12} />
//       Needs Review
//     </span>
//   );
// }

// function QuickAction({
//   icon,
//   title,
//   description,
//   onClick,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
//     >

//       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
//         {icon}
//       </div>

//       <h3 className="mt-4 font-bold text-slate-800">
//         {title}
//       </h3>

//       <p className="mt-1 text-xs leading-5 text-slate-400">
//         {description}
//       </p>

//       <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
//         Open
//         <ArrowRight size={13} />
//       </div>

//     </button>
//   );
// }