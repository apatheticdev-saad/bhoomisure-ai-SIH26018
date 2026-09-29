// // frontend/app/audit/page.tsx



"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Database,
  FileCheck2,
  FileText,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type AuditLog = {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string | null;
  timestamp: string;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAudit() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/audit/`
      );

      if (!response.ok) {
        throw new Error("Failed to load audit trail");
      }

      const data = await response.json();

      setLogs(data.logs ?? []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load the audit trail."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudit();
  }, []);

  const verificationActions = useMemo(() => {
    return logs.filter((log) =>
      log.action.startsWith("record_")
    ).length;
  }, [logs]);

  const uniqueEntities = useMemo(() => {
    return new Set(
      logs.map(
        (log) =>
          `${log.entity_type}-${log.entity_id}`
      )
    ).size;
  }, [logs]);

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
                  System Governance
                </span>

                <span className="hidden h-3 w-px bg-slate-300 sm:block" />

                <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
                  Record Traceability
                </span>

              </div>

              <h1 className="mt-1.5 text-2xl font-bold text-[#263746]">
                Audit Trail
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Traceable history of verification actions and
                changes made to land records.
              </p>

            </div>

            <button
              onClick={loadAudit}
              disabled={loading}
              className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-[#31516b] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
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
            Audit Trail
          </span>

        </div>

        {/* ================================================= */}
        {/* INTRODUCTION */}
        {/* ================================================= */}

        <section className="mb-5 border border-slate-200 bg-white">

          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#edf5fb] text-[#1769aa]">
                <ClipboardList size={22} />
              </div>

              <div>

                <h2 className="text-base font-bold text-[#263746]">
                  Record Activity & Traceability
                </h2>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                  Every verification action performed on a land
                  record is recorded as an audit event, providing
                  a traceable history for review and governance.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 border border-green-100 bg-[#f4faf6] px-4 py-3">

              <ShieldCheck
                size={17}
                className="text-[#238b57]"
              />

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wide text-[#238b57]">
                  Audit Status
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Traceability enabled
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <section className="mb-5 grid gap-4 md:grid-cols-3">

          <AuditMetric
            title="Audit Events"
            value={logs.length}
            description="Recorded system events"
            icon={<Database size={19} />}
            type="blue"
          />

          <AuditMetric
            title="Verification Actions"
            value={verificationActions}
            description="Officer verification activity"
            icon={<UserCheck size={19} />}
            type="green"
          />

          <AuditMetric
            title="Records Traced"
            value={uniqueEntities}
            description="Unique records with activity"
            icon={<FileCheck2 size={19} />}
            type="navy"
          />

        </section>

        {/* ================================================= */}
        {/* ACTIVITY HISTORY */}
        {/* ================================================= */}

        <section className="border border-slate-200 bg-white">

          {/* HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#f8fafc] px-5 py-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <Activity
                size={18}
                className="text-[#1769aa]"
              />

              <div>

                <h3 className="text-sm font-bold text-[#263746]">
                  Activity History
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Chronological record of system and verification
                  activity.
                </p>

              </div>

            </div>

            <span className="border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">
              {logs.length} Events
            </span>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="py-20 text-center">

              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#1769aa]"
              />

              <p className="mt-4 text-xs font-medium text-slate-500">
                Loading audit trail...
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading && logs.length === 0 && (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-slate-100 text-slate-400">
                <Database size={27} />
              </div>

              <p className="mt-5 text-sm font-bold text-[#263746]">
                No audit events yet
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                Verification and record actions will appear
                here once activity is recorded.
              </p>

            </div>
          )}

          {/* DESKTOP ACTIVITY TABLE */}

          {!loading && logs.length > 0 && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="border-b border-slate-200 bg-[#f8fafc]">

                  <tr>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Activity
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Entity
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Date & Time
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Details
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {logs.map((log) => (

                    <tr
                      key={log.id}
                      className="hover:bg-[#fafcfd]"
                    >

                      {/* ACTIVITY */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-green-100 bg-green-50 text-[#238b57]">
                            <CheckCircle2 size={17} />
                          </div>

                          <div>

                            <p className="text-xs font-bold text-[#263746]">
                              {formatAction(log.action)}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Audit Event #{log.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ENTITY */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <FileText
                            size={14}
                            className="text-slate-400"
                          />

                          <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">
                            {log.entity_type} #{log.entity_id}
                          </span>

                        </div>

                      </td>

                      {/* USER */}

                      <td className="px-5 py-4">

                        <div>

                          <p className="text-xs font-semibold text-slate-700">
                            {log.user_id !== null
                              ? `User #${log.user_id}`
                              : "System / Unassigned"}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Recorded action
                          </p>

                        </div>

                      </td>

                      {/* TIMESTAMP */}

                      <td className="px-5 py-4">

                        <div>

                          <p className="text-xs font-semibold text-slate-700">
                            {formatDate(
                              log.timestamp
                            )}
                          </p>

                        </div>

                      </td>

                      {/* DETAILS */}

                      <td className="px-5 py-4 text-right">

                        {log.details ? (

                          <details className="relative inline-block text-left">

                            <summary className="cursor-pointer list-none border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-[#1769aa] hover:bg-slate-50">
                              View Details
                            </summary>

                            <div className="absolute right-0 z-20 mt-2 w-[360px] border border-slate-200 bg-white p-3 text-left shadow-lg">

                              <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                Change Details
                              </p>

                              <pre className="max-h-60 overflow-auto bg-[#f8fafc] p-3 text-[10px] leading-5 text-slate-600">
                                {formatDetails(
                                  log.details
                                )}
                              </pre>

                            </div>

                          </details>

                        ) : (

                          <span className="text-[10px] text-slate-400">
                            No details
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* ================================================= */}
        {/* GOVERNANCE NOTE */}
        {/* ================================================= */}

        <section className="mt-5 border border-slate-200 bg-white">

          <div className="flex items-start gap-3 px-4 py-3">

            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#1769aa]"
            />

            <div>

              <p className="text-[10px] font-bold text-[#263746]">
                Auditability & Governance
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Audit events provide traceability for actions
                performed during the human verification process.
                These records support review, accountability and
                system-level transparency.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}


/* ========================================================= */
/* AUDIT METRIC */
/* ========================================================= */

function AuditMetric({
  title,
  value,
  description,
  icon,
  type,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  type: "blue" | "green" | "navy";
}) {
  const styles = {
    blue: {
      border: "border-l-[#1769aa]",
      icon: "bg-[#edf5fb] text-[#1769aa]",
    },
    green: {
      border: "border-l-[#238b57]",
      icon: "bg-[#edf8f2] text-[#238b57]",
    },
    navy: {
      border: "border-l-[#12395b]",
      icon: "bg-[#eef2f6] text-[#12395b]",
    },
  };

  return (
    <div
      className={`border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${styles[type].border}`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
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
/* HELPERS */
/* ========================================================= */

function formatAction(action: string) {
  return action
    .replace(/^record_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  } catch {
    return value;
  }
}

function formatDetails(value: string) {
  try {
    return JSON.stringify(
      JSON.parse(value),
      null,
      2
    );
  } catch {
    return value;
  }
}


// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   Activity,
//   ArrowLeft,
//   CheckCircle2,
//   Database,
//   FileText,
//   ShieldCheck,
//   Upload,
//   UserCheck,
//   Clock3,
// } from "lucide-react";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// type AuditLog = {
//   id: number;
//   user_id: number | null;
//   action: string;
//   entity_type: string;
//   entity_id: number;
//   details: string | null;
//   timestamp: string;
// };

// export default function AuditPage() {
//   const [logs, setLogs] = useState<AuditLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   async function loadAudit() {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch(
//         `${API_URL}/api/audit/`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to load audit trail");
//       }

//       const data = await response.json();

//       setLogs(data.logs ?? []);
//     } catch (err) {
//       console.error(err);
//       setError(
//         "Unable to load the audit trail."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadAudit();
//   }, []);

//   return (
//     <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

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
//               icon={<UserCheck size={18} />}
//               label="Verification Queue"
//               href="/verification"
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
//               active
//             />

//           </nav>

//         </div>

//       </aside>

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
//                 SYSTEM GOVERNANCE
//               </p>

//               <h2 className="mt-1 text-xl font-bold">
//                 Audit Trail
//               </h2>

//             </div>

//           </div>

//           <button
//             onClick={loadAudit}
//             className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
//           >
//             Refresh
//           </button>

//         </header>

//         <div className="p-6 md:p-8">

//           <div className="mb-7">

//             <h3 className="text-2xl font-bold">
//               Record Activity
//             </h3>

//             <p className="mt-1 text-sm text-slate-500">
//               Traceable history of human verification actions and
//               record changes.
//             </p>

//           </div>

//           <div className="mb-6 grid gap-4 sm:grid-cols-3">

//             <AuditMetric
//               title="Audit Events"
//               value={logs.length}
//               icon={<Database size={20} />}
//             />

//             <AuditMetric
//               title="Verification Actions"
//               value={
//                 logs.filter((log) =>
//                   log.action.startsWith("record_")
//                 ).length
//               }
//               icon={<UserCheck size={20} />}
//             />

//             <AuditMetric
//               title="Traceability"
//               value="Enabled"
//               icon={<CheckCircle2 size={20} />}
//             />

//           </div>

//           {error && (
//             <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//               {error}
//             </div>
//           )}

//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//             <div className="border-b border-slate-100 px-6 py-5">

//               <h4 className="font-bold">
//                 Activity History
//               </h4>

//               <p className="mt-1 text-xs text-slate-400">
//                 Every verification action creates a traceable
//                 audit event.
//               </p>

//             </div>

//             {loading ? (

//               <div className="py-16 text-center">

//                 <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

//                 <p className="mt-4 text-sm text-slate-400">
//                   Loading audit trail...
//                 </p>

//               </div>

//             ) : logs.length === 0 ? (

//               <div className="px-6 py-16 text-center">

//                 <Database
//                   size={34}
//                   className="mx-auto text-slate-300"
//                 />

//                 <p className="mt-4 text-sm font-semibold text-slate-600">
//                   No audit events yet
//                 </p>

//                 <p className="mt-1 text-xs text-slate-400">
//                   Verification actions will appear here.
//                 </p>

//               </div>

//             ) : (

//               <div className="divide-y divide-slate-100">

//                 {logs.map((log) => (

//                   <div
//                     key={log.id}
//                     className="flex gap-4 px-6 py-5"
//                   >

//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                       <Clock3 size={18} />
//                     </div>

//                     <div className="min-w-0 flex-1">

//                       <div className="flex flex-wrap items-center gap-2">

//                         <p className="text-sm font-bold">
//                           {formatAction(log.action)}
//                         </p>

//                         <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
//                           {log.entity_type} #{log.entity_id}
//                         </span>

//                       </div>

//                       <p className="mt-1 text-xs text-slate-400">
//                         {formatDate(log.timestamp)}
//                       </p>

//                       {log.details && (
//                         <details className="mt-3">

//                           <summary className="cursor-pointer text-[10px] font-bold text-blue-600">
//                             View change details
//                           </summary>

//                           <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
//                             {formatDetails(log.details)}
//                           </pre>

//                         </details>
//                       )}

//                     </div>

//                     <CheckCircle2
//                       size={18}
//                       className="mt-1 shrink-0 text-emerald-500"
//                     />

//                   </div>

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


// function AuditMetric({
//   title,
//   value,
//   icon,
// }: {
//   title: string;
//   value: string | number;
//   icon: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//       <div className="flex items-center justify-between">

//         <div>

//           <p className="text-xs font-semibold text-slate-400">
//             {title}
//           </p>

//           <p className="mt-2 text-2xl font-bold">
//             {value}
//           </p>

//         </div>

//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//           {icon}
//         </div>

//       </div>

//     </div>
//   );
// }


// function formatAction(action: string) {
//   return action
//     .replace(/^record_/, "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (char) =>
//       char.toUpperCase()
//     );
// }


// function formatDate(value: string) {
//   try {
//     return new Date(value).toLocaleString();
//   } catch {
//     return value;
//   }
// }


// function formatDetails(value: string) {
//   try {
//     return JSON.stringify(
//       JSON.parse(value),
//       null,
//       2
//     );
//   } catch {
//     return value;
//   }
// }