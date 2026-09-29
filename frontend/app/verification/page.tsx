"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  FileCheck2,
  FileText,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserCheck,
  MapPin,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type PendingRecord = {
  id: number;
  document_id: number;
  file_name: string;
  document_type: string;
  owner_name: string | null;
  survey_number: string | null;
  area: string | null;
  area_unit: string | null;
  village: string | null;
  tehsil: string | null;
  district: string | null;
  overall_confidence: number | null;
  validation_status: string;
};

export default function VerificationPage() {
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQueue() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/verification/pending`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load verification queue"
        );
      }

      const data = await response.json();

      setRecords(data.records ?? []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load the verification queue."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const averageConfidence = useMemo(() => {
    if (records.length === 0) return 0;

    const valid = records.filter(
      (record) =>
        typeof record.overall_confidence === "number"
    );

    if (valid.length === 0) return 0;

    return Math.round(
      valid.reduce(
        (sum, record) =>
          sum + (record.overall_confidence ?? 0),
        0
      ) / valid.length
    );
  }, [records]);

  const highPriorityCount = useMemo(() => {
    return records.filter(
      (record) =>
        (record.overall_confidence ?? 0) < 70
    ).length;
  }, [records]);

  return (
    <main className="min-h-screen bg-[#f3f5f7] text-[#263746]">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-5 md:px-7">

          <div className="flex min-h-[92px] items-center justify-between gap-5">

            <div>

              <div className="flex items-center gap-2">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2877b8]">
                  Revenue & Land Records Administration
                </span>

                <span className="hidden h-3 w-px bg-slate-300 sm:block" />

                <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
                  Human Verification
                </span>

              </div>

              <h1 className="mt-1.5 text-2xl font-bold text-[#263746]">
                Verification Queue
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Review and verify land records requiring
                officer confirmation.
              </p>

            </div>

            <button
              onClick={loadQueue}
              disabled={loading}
              className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-[#31516b] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh Queue
            </button>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-7 md:py-8">

        {/* BREADCRUMB */}

        <div className="mb-5 flex items-center gap-2 text-[11px] text-slate-500">

          <Link
            href="/"
            className="hover:text-[#1769aa]"
          >
            Dashboard
          </Link>

          <span className="text-slate-300">
            /
          </span>

          <span className="font-semibold text-[#12395b]">
            Verification Queue
          </span>

        </div>

        {/* ================================================= */}
        {/* QUEUE INTRO */}
        {/* ================================================= */}

        <section className="mb-5 border border-slate-200 bg-white">

          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#edf5fb] text-[#1769aa]">
                <UserCheck size={22} />
              </div>

              <div>

                <h2 className="text-base font-bold text-[#263746]">
                  Human Review Queue
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Records are routed here when extracted
                  information requires human confirmation due
                  to confidence levels, validation results or
                  cross-record inconsistencies.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 border border-blue-100 bg-[#f5f9fc] px-4 py-3">

              <ShieldCheck
                size={17}
                className="text-[#1769aa]"
              />

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wide text-[#1769aa]">
                  Verification Principle
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  AI assists • Officer verifies
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-5 flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">

            <AlertTriangle size={17} />

            <span>{error}</span>

          </div>
        )}

        {/* ================================================= */}
        {/* SUMMARY CARDS */}
        {/* ================================================= */}

        <section className="mb-5 grid gap-4 md:grid-cols-3">

          <QueueSummary
            label="Pending Verification"
            value={records.length}
            description="Records awaiting officer action"
            icon={<Clock3 size={19} />}
            type="orange"
          />

          <QueueSummary
            label="Average Confidence"
            value={`${averageConfidence}%`}
            description="Across records in this queue"
            icon={<ShieldCheck size={19} />}
            type="blue"
          />

          <QueueSummary
            label="Priority Review"
            value={highPriorityCount}
            description="Records below 70% confidence"
            icon={<AlertTriangle size={19} />}
            type="red"
          />

        </section>

        {/* ================================================= */}
        {/* QUEUE TABLE */}
        {/* ================================================= */}

        <section className="border border-slate-200 bg-white">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#f8fafc] px-5 py-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h3 className="text-sm font-bold text-[#263746]">
                Pending Records
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Select a record to open the complete
                verification workspace.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span className="border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                {records.length} Pending
              </span>

            </div>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="py-20 text-center">

              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#1769aa]"
              />

              <p className="mt-4 text-xs font-medium text-slate-500">
                Loading verification queue...
              </p>

            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && records.length === 0 && (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#edf8f2] text-[#238b57]">
                <FileCheck2 size={27} />
              </div>

              <h4 className="mt-5 text-sm font-bold text-[#263746]">
                Verification queue is clear
              </h4>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                There are currently no records waiting for
                human verification.
              </p>

              <Link
                href="/upload"
                className="mt-5 inline-flex items-center gap-2 bg-[#1769aa] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#12588f]"
              >
                <Upload size={14} />
                Process New Document
              </Link>

            </div>
          )}

          {/* RECORDS */}

          {!loading && records.length > 0 && (

            <div>

              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[1050px]">

                  <thead className="border-b border-slate-200 bg-[#f8fafc]">

                    <tr>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Record
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Land Details
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Location
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Confidence
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Review
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {records.map((record) => (

                      <tr
                        key={record.id}
                        className="group hover:bg-[#fafcfd]"
                      >

                        {/* RECORD */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-100 bg-blue-50 text-[#1769aa]">
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">

                              <p className="text-xs font-bold text-[#263746]">
                                Record #{record.id}
                              </p>

                              <p className="mt-1 max-w-[230px] truncate text-[10px] text-slate-400">
                                {record.file_name}
                              </p>

                              <span className="mt-1.5 inline-block border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                                {record.document_type}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* LAND DETAILS */}

                        <td className="px-5 py-4">

                          <div className="space-y-1">

                            <p className="text-xs font-semibold text-[#263746]">
                              {record.owner_name ||
                                "Owner not detected"}
                            </p>

                            <p className="text-[10px] text-slate-500">
                              Survey No.{" "}
                              <span className="font-semibold text-slate-700">
                                {record.survey_number ||
                                  "—"}
                              </span>
                            </p>

                            <p className="text-[10px] text-slate-500">
                              Area{" "}
                              <span className="font-semibold text-slate-700">
                                {record.area || "—"}{" "}
                                {record.area_unit || ""}
                              </span>
                            </p>

                          </div>

                        </td>

                        {/* LOCATION */}

                        <td className="px-5 py-4">

                          <div className="flex items-start gap-2">

                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div>

                              <p className="text-xs font-semibold text-slate-700">
                                {record.village ||
                                  "Village unavailable"}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {record.tehsil || "—"}
                                {record.district
                                  ? `, ${record.district}`
                                  : ""}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONFIDENCE */}

                        <td className="px-5 py-4">

                          <div className="w-[120px]">

                            <div className="flex items-center justify-between">

                              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                AI Confidence
                              </span>

                              <span
                                className={`text-xs font-bold ${
                                  (record.overall_confidence ??
                                    0) < 70
                                    ? "text-red-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {record.overall_confidence ??
                                  0}
                                %
                              </span>

                            </div>

                            <div className="mt-2 h-1.5 bg-slate-200">

                              <div
                                className={
                                  (record.overall_confidence ??
                                    0) < 70
                                    ? "h-1.5 bg-red-500"
                                    : "h-1.5 bg-[#e4a329]"
                                }
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

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">

                            <Clock3 size={11} />

                            Needs Review

                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">

                          <Link
                            href={`/verification/${record.id}`}
                            className="inline-flex items-center gap-1.5 bg-[#1769aa] px-3 py-2 text-[10px] font-bold text-white opacity-90 transition hover:opacity-100"
                          >
                            Review
                            <ArrowRight size={13} />
                          </Link>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* ================================================= */}
              {/* MOBILE / TABLET CARDS */}
              {/* ================================================= */}

              <div className="divide-y divide-slate-200 lg:hidden">

                {records.map((record) => (

                  <Link
                    key={record.id}
                    href={`/verification/${record.id}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-100 bg-blue-50 text-[#1769aa]">
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="text-xs font-bold text-[#263746]">
                              Record #{record.id}
                            </p>

                            <span className="border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                              {record.document_type}
                            </span>

                          </div>

                          <p className="mt-1 truncate text-[10px] text-slate-400">
                            {record.file_name}
                          </p>

                        </div>

                      </div>

                      <ArrowRight
                        size={17}
                        className="shrink-0 text-slate-300"
                      />

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

                      <MobileField
                        label="Owner"
                        value={
                          record.owner_name ||
                          "Not detected"
                        }
                      />

                      <MobileField
                        label="Survey No."
                        value={
                          record.survey_number || "—"
                        }
                      />

                      <MobileField
                        label="Area"
                        value={`${record.area || "—"} ${
                          record.area_unit || ""
                        }`}
                      />

                      <MobileField
                        label="Village"
                        value={
                          record.village || "Unknown"
                        }
                      />

                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Confidence
                        </span>

                        <span className="text-xs font-bold text-amber-600">
                          {record.overall_confidence ??
                            0}
                          %
                        </span>

                      </div>

                      <span className="border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">
                        Needs Review
                      </span>

                    </div>

                  </Link>

                ))}

              </div>

            </div>

          )}

        </section>

        {/* ================================================= */}
        {/* FOOTER NOTE */}
        {/* ================================================= */}

        <div className="mt-5 flex items-start gap-3 border border-slate-200 bg-white px-4 py-3">

          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-[#1769aa]"
          />

          <p className="text-[10px] leading-5 text-slate-500">
            Human verification provides the final review step
            before a land record is marked as verified. AI
            extraction and confidence scores assist the officer;
            they do not replace officer verification.
          </p>

        </div>

      </div>
    </main>
  );
}


/* ========================================================= */
/* QUEUE SUMMARY */
/* ========================================================= */

function QueueSummary({
  label,
  value,
  description,
  icon,
  type,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  type: "orange" | "blue" | "red";
}) {
  const styles = {
    orange: {
      border: "border-l-[#d98b18]",
      icon: "bg-[#fff6e7] text-[#b66c00]",
    },
    blue: {
      border: "border-l-[#1769aa]",
      icon: "bg-[#edf5fb] text-[#1769aa]",
    },
    red: {
      border: "border-l-[#c83b3b]",
      icon: "bg-[#fdf0f0] text-[#c83b3b]",
    },
  };

  return (
    <div
      className={`border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${styles[type].border}`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-[28px] font-bold leading-none text-[#263746]">
            {value}
          </p>

          <p className="mt-2 text-[10px] text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center ${styles[type].icon}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* MOBILE FIELD */
/* ========================================================= */

function MobileField({
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

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}





// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   Activity,
//   AlertTriangle,
//   ArrowLeft,
//   Clock3,
//   Database,
//   FileText,
//   ShieldCheck,
//   Upload,
//   UserCheck,
//   ChevronRight,
// } from "lucide-react";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// type PendingRecord = {
//   id: number;
//   document_id: number;
//   file_name: string;
//   document_type: string;
//   owner_name: string | null;
//   survey_number: string | null;
//   area: string | null;
//   area_unit: string | null;
//   village: string | null;
//   tehsil: string | null;
//   district: string | null;
//   overall_confidence: number | null;
//   validation_status: string;
// };

// export default function VerificationPage() {
//   const [records, setRecords] = useState<PendingRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   async function loadQueue() {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch(
//         `${API_URL}/api/verification/pending`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to load verification queue");
//       }

//       const data = await response.json();

//       setRecords(data.records ?? []);
//     } catch (err) {
//       console.error(err);
//       setError(
//         "Unable to load the verification queue."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadQueue();
//   }, []);

//   return (
//     <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

//       {/* Sidebar */}
//       <aside className="fixed left-0 top-0 hidden h-screen w-[250px] border-r border-slate-200 bg-white lg:block">

//         <div className="flex h-full flex-col">

//           <div className="flex h-[82px] items-center border-b border-slate-100 px-6">

//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
//               <ShieldCheck size={23} />
//             </div>

//             <div className="ml-3">

//               <h1 className="text-[17px] font-bold">
//                 BhoomiSure
//               </h1>

//               <p className="text-[11px] font-medium text-slate-400">
//                 AI LAND INTELLIGENCE
//               </p>

//             </div>

//           </div>

//           <nav className="flex-1 px-4 py-6">

//             <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
//               Workspace
//             </p>

//             <NavItem
//               icon={<Activity size={18} />}
//               label="Dashboard"
//               href="/"
//             />

//             <NavItem
//               icon={<Upload size={18} />}
//               label="Upload Document"
//               href="/upload"
//             />

//             <NavItem
//               icon={<FileText size={18} />}
//               label="Land Records"
//               href="/records"
//             />

//             <NavItem
//               icon={<Clock3 size={18} />}
//               label="Verification Queue"
//               href="/verification"
//               active
//             />

//             <NavItem
//               icon={<ShieldCheck size={18} />}
//               label="Validation"
//               href="/validation"
//             />

//             <div className="my-6 border-t border-slate-100" />

//             <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
//               System
//             </p>

//             <NavItem
//               icon={<Database size={18} />}
//               label="Audit Trail"
//               href="/audit"
//             />

//           </nav>

//           <div className="border-t border-slate-100 p-4">

//             <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
//                 RO
//               </div>

//               <div>

//                 <p className="text-sm font-semibold">
//                   Revenue Officer
//                 </p>

//                 <p className="text-xs text-slate-400">
//                   Administrator
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>

//       </aside>

//       {/* Main */}
//       <section className="lg:ml-[250px]">

//         <header className="flex h-[82px] items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">

//           <div className="flex items-center gap-4">

//             <Link
//               href="/"
//               className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
//             >
//               <ArrowLeft size={17} />
//             </Link>

//             <div>

//               <p className="text-xs font-medium text-slate-400">
//                 HUMAN VERIFICATION
//               </p>

//               <h2 className="mt-1 text-xl font-bold">
//                 Verification Queue
//               </h2>

//             </div>

//           </div>

//           <button
//             onClick={loadQueue}
//             className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
//           >
//             Refresh
//           </button>

//         </header>

//         <div className="p-6 md:p-8">

//           {/* Heading */}
//           <div className="mb-7">

//             <div className="flex items-center gap-3">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
//                 <UserCheck size={22} />
//               </div>

//               <div>

//                 <h3 className="text-2xl font-bold">
//                   Human Review Queue
//                 </h3>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Review records where AI confidence or validation
//                   rules require human confirmation.
//                 </p>

//               </div>

//             </div>

//           </div>

//           {/* Explanation */}
//           <div className="mb-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">

//             <ShieldCheck
//               size={20}
//               className="mt-0.5 shrink-0 text-blue-600"
//             />

//             <div>

//               <p className="text-sm font-bold text-blue-800">
//                 Confidence-gated verification
//               </p>

//               <p className="mt-1 text-xs leading-5 text-blue-700">
//                 BhoomiSure AI routes low-confidence or inconsistent
//                 records to a Revenue Officer instead of automatically
//                 accepting uncertain information.
//               </p>

//             </div>

//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//               <AlertTriangle size={18} />
//               {error}
//             </div>
//           )}

//           {/* Queue */}
//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//             <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

//               <div>

//                 <h4 className="font-bold">
//                   Pending Records
//                 </h4>

//                 <p className="mt-1 text-xs text-slate-400">
//                   {loading
//                     ? "Loading..."
//                     : `${records.length} record${records.length === 1 ? "" : "s"} require review`}
//                 </p>

//               </div>

//               <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
//                 {records.length} Pending
//               </div>

//             </div>

//             {loading && (
//               <div className="py-16 text-center">

//                 <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

//                 <p className="mt-4 text-sm text-slate-400">
//                   Loading verification queue...
//                 </p>

//               </div>
//             )}

//             {!loading && records.length === 0 && (
//               <div className="px-6 py-16 text-center">

//                 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
//                   <ShieldCheck size={27} />
//                 </div>

//                 <h4 className="mt-5 text-sm font-bold text-slate-700">
//                   Verification queue is clear
//                 </h4>

//                 <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
//                   There are currently no records waiting for human
//                   verification.
//                 </p>

//                 <Link
//                   href="/upload"
//                   className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
//                 >
//                   <Upload size={15} />
//                   Upload New Document
//                 </Link>

//               </div>
//             )}

//             {!loading && records.length > 0 && (
//               <div className="divide-y divide-slate-100">

//                 {records.map((record) => (

//                   <Link
//                     key={record.id}
//                     href={`/verification/${record.id}`}
//                     className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 md:flex-row md:items-center"
//                   >

//                     {/* Icon */}
//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
//                       <FileText size={22} />
//                     </div>

//                     {/* Main */}
//                     <div className="min-w-0 flex-1">

//                       <div className="flex flex-wrap items-center gap-2">

//                         <h5 className="text-sm font-bold">
//                           Record #{record.id}
//                         </h5>

//                         <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
//                           {record.document_type}
//                         </span>

//                       </div>

//                       <p className="mt-1 truncate text-xs text-slate-400">
//                         {record.file_name}
//                       </p>

//                       <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">

//                         <span>
//                           <span className="text-slate-400">
//                             Owner:
//                           </span>{" "}
//                           <span className="font-semibold text-slate-700">
//                             {record.owner_name ||
//                               "Not detected"}
//                           </span>
//                         </span>

//                         <span>
//                           <span className="text-slate-400">
//                             Survey:
//                           </span>{" "}
//                           <span className="font-semibold text-slate-700">
//                             {record.survey_number ||
//                               "—"}
//                           </span>
//                         </span>

//                         <span>
//                           <span className="text-slate-400">
//                             Location:
//                           </span>{" "}
//                           <span className="font-semibold text-slate-700">
//                             {record.village ||
//                               "Unknown"}
//                           </span>
//                         </span>

//                       </div>

//                     </div>

//                     {/* Confidence */}
//                     <div className="md:w-[120px]">

//                       <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
//                         Confidence
//                       </p>

//                       <div className="mt-2 flex items-center gap-2">

//                         <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

//                           <div
//                             className="h-full rounded-full bg-amber-500"
//                             style={{
//                               width: `${Math.min(
//                                 record.overall_confidence ?? 0,
//                                 100
//                               )}%`,
//                             }}
//                           />

//                         </div>

//                         <span className="text-xs font-bold text-amber-600">
//                           {record.overall_confidence ?? 0}%
//                         </span>

//                       </div>

//                     </div>

//                     <ChevronRight
//                       size={19}
//                       className="shrink-0 text-slate-300"
//                     />

//                   </Link>

//                 ))}

//               </div>
//             )}

//           </div>

//         </div>

//       </section>

//     </main>
//   );
// }


// function NavItem({
//   icon,
//   label,
//   href,
//   active = false,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   href: string;
//   active?: boolean;
// }) {
//   return (
//     <Link
//       href={href}
//       className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
//         active
//           ? "bg-blue-50 text-blue-700"
//           : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
//       }`}
//     >
//       {icon}
//       <span>{label}</span>
//     </Link>
//   );
// }