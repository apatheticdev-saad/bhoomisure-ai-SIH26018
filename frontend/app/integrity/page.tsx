// // frontend/app/integrity/page.tsx


// frontend/app/integrity/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Link2,
  Database,
  LockKeyhole,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Clock3,
  Fingerprint,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type IntegrityBlock = {
  id: number;
  record_id: number;
  block_number: number;
  data_hash: string;
  previous_hash: string;
  current_hash: string;
  created_at?: string;
};

type IntegrityData = {
  chain_valid: boolean;
  algorithm: string;
  count?: number;
  total_blocks?: number;
  blocks: IntegrityBlock[];
};

type VerificationResult = {
  chain_valid: boolean;
  algorithm: string;
  total_blocks: number;
  verified_blocks: number;
  message: string;
};

export default function IntegrityPage() {
  const [data, setData] =
    useState<IntegrityData | null>(null);

  const [verification, setVerification] =
    useState<VerificationResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadChain() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/integrity/chain`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load integrity chain"
        );
      }

      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load the integrity chain."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyChain() {
    try {
      setVerifying(true);
      setError("");

      const response = await fetch(
        `${API}/api/integrity/verify`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Integrity verification failed"
        );
      }

      const result =
        await response.json();

      setVerification(result);

      await loadChain();
    } catch (error) {
      console.error(error);

      setError(
        "Integrity verification could not be completed."
      );
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    loadChain();
  }, []);

  const chainValid =
    verification?.chain_valid ??
    data?.chain_valid ??
    false;

  const blockCount =
    data?.total_blocks ??
    data?.count ??
    data?.blocks?.length ??
    0;

  const verifiedBlockCount =
    verification?.verified_blocks ??
    0;

  const lastBlock = useMemo(() => {
    if (!data?.blocks?.length) {
      return null;
    }

    return data.blocks[
      data.blocks.length - 1
    ];
  }, [data]);

  return (
    <main className="min-h-screen bg-[#f3f5f7] text-[#263746]">

      {/* ================================================= */}
      {/* HEADER */}
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
                  Record Integrity & Security
                </span>

              </div>

              <h1 className="mt-1.5 text-2xl font-bold text-[#263746]">
                Record Integrity
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Cryptographic verification of verified land
                records and integrity blocks.
              </p>

            </div>

            <button
              onClick={verifyChain}
              disabled={verifying}
              className="flex items-center gap-2 bg-[#12395b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0d2f4d] disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                size={14}
                className={
                  verifying
                    ? "animate-spin"
                    : ""
                }
              />

              {verifying
                ? "Verifying..."
                : "Verify Integrity"}

            </button>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN */}
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
            Record Integrity
          </span>

        </div>

        {/* ================================================= */}
        {/* STATUS INTRO */}
        {/* ================================================= */}

        <section className="mb-5 border border-slate-200 bg-white">

          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#edf5fb] text-[#1769aa]">
                <ShieldCheck size={22} />
              </div>

              <div>

                <h2 className="text-base font-bold text-[#263746]">
                  Cryptographic Record Protection
                </h2>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                  Verified land records are represented through
                  SHA-256 fingerprints and linked integrity blocks.
                  The chain can be checked to detect inconsistencies
                  in the stored integrity history.
                </p>

              </div>

            </div>

            <div
              className={`flex items-center gap-2 border px-4 py-3 ${
                chainValid
                  ? "border-green-100 bg-[#f4faf6]"
                  : "border-red-100 bg-[#fff6f6]"
              }`}
            >

              {chainValid ? (
                <ShieldCheck
                  size={17}
                  className="text-[#238b57]"
                />
              ) : (
                <ShieldAlert
                  size={17}
                  className="text-red-600"
                />
              )}

              <div>

                <p
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    chainValid
                      ? "text-[#238b57]"
                      : "text-red-700"
                  }`}
                >
                  {verification
                    ? "Verification Complete"
                    : "Integrity Status"}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  {verification
                    ? chainValid
                      ? "Integrity chain verified"
                      : "Integrity issue detected"
                    : "Run verification to confirm"}
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
        {/* KPI CARDS */}
        {/* ================================================= */}

        <section className="mb-5 grid gap-4 md:grid-cols-3">

          {/* STATUS */}

          <IntegrityMetric
            title="Chain Status"
            value={
              verification
                ? chainValid
                  ? "Verified"
                  : "Integrity Issue"
                : "Not Checked"
            }
            description={
              verification
                ? chainValid
                  ? "All checked blocks are linked correctly"
                  : "Review the integrity chain"
                : "Verification has not been run"
            }
            icon={
              chainValid ? (
                <ShieldCheck size={20} />
              ) : (
                <ShieldAlert size={20} />
              )
            }
            type={
              verification && !chainValid
                ? "red"
                : "green"
            }
          />

          {/* BLOCK COUNT */}

          <IntegrityMetric
            title="Integrity Blocks"
            value={blockCount}
            description="Cryptographically linked record blocks"
            icon={<Database size={20} />}
            type="blue"
          />

          {/* ALGORITHM */}

          <IntegrityMetric
            title="Integrity Algorithm"
            value="SHA-256"
            description="Cryptographic fingerprinting method"
            icon={<LockKeyhole size={20} />}
            type="navy"
          />

        </section>

        {/* ================================================= */}
        {/* VERIFICATION RESULT */}
        {/* ================================================= */}

        {verification && (

          <section
            className={`mb-5 border ${
              verification.chain_valid
                ? "border-green-200 bg-[#f4faf6]"
                : "border-red-200 bg-[#fff6f6]"
            }`}
          >

            <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-3">

                {verification.chain_valid ? (
                  <CheckCircle2
                    size={21}
                    className="mt-0.5 shrink-0 text-[#238b57]"
                  />
                ) : (
                  <ShieldAlert
                    size={21}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                )}

                <div>

                  <p
                    className={`text-sm font-bold ${
                      verification.chain_valid
                        ? "text-[#176b42]"
                        : "text-red-700"
                    }`}
                  >
                    {verification.chain_valid
                      ? "Integrity verification passed"
                      : "Integrity verification detected an issue"}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-600">
                    {verification.message ||
                      `Checked ${verification.total_blocks} integrity blocks.`}
                  </p>

                </div>

              </div>

              <div className="flex gap-5 border-l border-slate-200 pl-5">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Checked
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#263746]">
                    {verification.total_blocks}
                  </p>

                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Verified
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#238b57]">
                    {verifiedBlockCount}
                  </p>

                </div>

              </div>

            </div>

          </section>

        )}

        {/* ================================================= */}
        {/* HOW IT WORKS */}
        {/* ================================================= */}

        <section className="mb-5 border border-slate-200 bg-white">

          <div className="border-b border-slate-200 bg-[#f8fafc] px-5 py-4">

            <div className="flex items-center gap-3">

              <Link2
                size={18}
                className="text-[#1769aa]"
              />

              <div>

                <h2 className="text-sm font-bold text-[#263746]">
                  Integrity Verification Process
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  How verified records are represented in the
                  integrity chain.
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 md:p-6">

            <div className="grid gap-3 md:grid-cols-4">

              <IntegrityStep
                number="01"
                title="Land Record"
                description="Verified record data is selected."
                icon={<FileCheck2 size={18} />}
              />

              <IntegrityStep
                number="02"
                title="SHA-256"
                description="Important record fields are fingerprinted."
                icon={<Fingerprint size={18} />}
              />

              <IntegrityStep
                number="03"
                title="Integrity Block"
                description="The fingerprint is stored as a block."
                icon={<Database size={18} />}
              />

              <IntegrityStep
                number="04"
                title="Hash Chain"
                description="Each block links to the previous block."
                icon={<Link2 size={18} />}
              />

            </div>

            <div className="mt-5 border border-blue-100 bg-[#f5f9fd] px-4 py-3">

              <p className="text-[10px] leading-5 text-slate-600">
                When a record is verified, BhoomiSure AI creates
                a SHA-256 fingerprint of important land fields.
                Each integrity block stores its current hash and
                the hash of the previous block, allowing the
                integrity chain to be checked later.
              </p>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* INTEGRITY CHAIN */}
        {/* ================================================= */}

        <section className="border border-slate-200 bg-white">

          {/* SECTION HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#f8fafc] px-5 py-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <Database
                size={18}
                className="text-[#1769aa]"
              />

              <div>

                <h2 className="text-sm font-bold text-[#263746]">
                  Integrity Chain
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Cryptographic history of verified records.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <span className="border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">
                {blockCount} Blocks
              </span>

              <span
                className={`border px-2.5 py-1 text-[10px] font-bold ${
                  chainValid
                    ? "border-green-100 bg-green-50 text-[#238b57]"
                    : "border-red-100 bg-red-50 text-red-700"
                }`}
              >
                {chainValid
                  ? "CHAIN VALID"
                  : "CHECK REQUIRED"}
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
                Loading integrity chain...
              </p>

            </div>

          )}

          {/* EMPTY */}

          {!loading &&
            !data?.blocks?.length && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-slate-100 text-slate-400">
                  <ShieldAlert size={28} />
                </div>

                <p className="mt-5 text-sm font-bold text-[#263746]">
                  No integrity blocks yet
                </p>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Verify a land record to create its first
                  integrity block.
                </p>

              </div>
            )}

          {/* BLOCKS */}

          {!loading &&
            data?.blocks?.length > 0 && (

              <div className="divide-y divide-slate-100">

                {data.blocks.map(
                  (block, index) => (

                    <IntegrityBlockCard
                      key={block.id}
                      block={block}
                      isLast={
                        index ===
                        data.blocks.length - 1
                      }
                    />

                  )
                )}

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

          <div>

            <p className="text-[10px] font-bold text-[#263746]">
              Integrity & Governance
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              This prototype demonstrates cryptographic
              integrity tracking for verified records. It is
              designed as an application-level integrity layer;
              government production deployment would require
              integration with authorized land-record systems
              and institutional security controls.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}


/* ========================================================= */
/* KPI COMPONENT */
/* ========================================================= */

function IntegrityMetric({
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
  type: "blue" | "green" | "red" | "navy";
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
    red: {
      border: "border-l-[#c0392b]",
      icon: "bg-[#fff0ef] text-[#c0392b]",
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

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-[25px] font-bold leading-none text-[#263746]">
            {value}
          </p>

          <p className="mt-2 text-[10px] leading-4 text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${styles[type].icon}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* PROCESS STEP */
/* ========================================================= */

function IntegrityStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative border border-slate-200 bg-white p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#edf5fb] text-[#1769aa]">
          {icon}
        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <span className="text-[9px] font-bold text-[#1769aa]">
              {number}
            </span>

            <h3 className="text-xs font-bold text-[#263746]">
              {title}
            </h3>

          </div>

          <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* INTEGRITY BLOCK */
/* ========================================================= */

function IntegrityBlockCard({
  block,
  isLast,
}: {
  block: IntegrityBlock;
  isLast: boolean;
}) {
  return (
    <div className="p-5 md:p-6">

      {/* BLOCK HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#edf8f2] text-[#238b57]">
            <CheckCircle2 size={19} />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-sm font-bold text-[#263746]">
                Integrity Block #{block.block_number}
              </h3>

              <span className="border border-green-100 bg-green-50 px-2 py-1 text-[9px] font-bold text-[#238b57]">
                SHA-256
              </span>

            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              Land Record #{block.record_id}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">

          <Clock3 size={13} />

          {block.created_at
            ? formatDate(block.created_at)
            : "Recorded integrity block"}

        </div>

      </div>

      {/* HASH DATA */}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">

        <HashField
          label="Data Hash"
          value={block.data_hash}
          description="Fingerprint generated from record data."
        />

        <HashField
          label="Current Block Hash"
          value={block.current_hash}
          description="Hash representing this integrity block."
          highlighted
        />

      </div>

      {/* PREVIOUS HASH */}

      <div className="mt-4 border border-slate-200 bg-[#fafbfc] p-4">

        <div className="flex items-start gap-3">

          <Link2
            size={15}
            className="mt-0.5 shrink-0 text-[#1769aa]"
          />

          <div className="min-w-0">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Previous Block Hash
            </p>

            <p className="mt-2 break-all font-mono text-[10px] leading-5 text-slate-600">
              {block.previous_hash}
            </p>

          </div>

        </div>

      </div>

      {/* CHAIN CONNECTION */}

      {!isLast && (

        <div className="ml-5 mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">

          <div className="h-5 w-px bg-slate-300" />

          <ArrowRight
            size={12}
            className="text-[#1769aa]"
          />

          Linked to next integrity block

        </div>

      )}

    </div>
  );
}


/* ========================================================= */
/* HASH FIELD */
/* ========================================================= */

function HashField({
  label,
  value,
  description,
  highlighted = false,
}: {
  label: string;
  value: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`border p-4 ${
        highlighted
          ? "border-blue-100 bg-[#f5f9fd]"
          : "border-slate-200 bg-[#fafbfc]"
      }`}
    >

      <div className="flex items-center justify-between gap-3">

        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <Fingerprint
          size={13}
          className={
            highlighted
              ? "text-[#1769aa]"
              : "text-slate-400"
          }
        />

      </div>

      <p className="mt-2 break-all font-mono text-[10px] leading-5 text-[#334e68]">
        {value}
      </p>

      <p className="mt-2 text-[9px] text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* ========================================================= */
/* DATE */
/* ========================================================= */

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
      }
    );
  } catch {
    return value;
  }
}



// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   ShieldCheck,
//   ShieldAlert,
//   RefreshCw,
//   Link2,
//   Database,
//   LockKeyhole,
//   CheckCircle2,
// } from "lucide-react";

// const API = "http://127.0.0.1:8000";

// export default function IntegrityPage() {
//   const [data, setData] = useState<any>(null);
//   const [verification, setVerification] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [verifying, setVerifying] = useState(false);

//   async function loadChain() {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         `${API}/api/integrity/chain`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to load integrity chain");
//       }

//       const result = await response.json();

//       setData(result);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function verifyChain() {
//     try {
//       setVerifying(true);

//       const response = await fetch(
//         `${API}/api/integrity/verify`,
//         {
//           method: "POST",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Integrity verification failed");
//       }

//       const result = await response.json();

//       setVerification(result);

//       await loadChain();
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setVerifying(false);
//     }
//   }

//   useEffect(() => {
//     loadChain();
//   }, []);

//   const chainValid =
//     verification?.chain_valid ?? true;

//   const blockCount =
//     data?.count ?? 0;

//   return (
//     <div className="min-h-screen bg-[#f5f7fb]">

//       {/* ================================================= */}
//       {/* SIDEBAR */}
//       {/* ================================================= */}

//       <aside className="fixed left-0 top-0 h-screen w-[250px] bg-white border-r border-gray-200 px-4 py-5">

//         <div className="mb-8 px-3">

//           <div className="text-xl font-bold text-gray-900">
//             BhoomiSure{" "}
//             <span className="text-blue-600">
//               AI
//             </span>
//           </div>

//           <div className="text-xs text-gray-500 mt-1">
//             Land Intelligence Platform
//           </div>

//         </div>

//         <nav className="space-y-1">

//           <Link
//             href="/"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             Dashboard
//           </Link>

//           <Link
//             href="/upload"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             Upload
//           </Link>

//           <Link
//             href="/records"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             Land Records
//           </Link>

//           <Link
//             href="/verification"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             Verification
//           </Link>

//           <Link
//             href="/validation"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             Validation
//           </Link>

//           <Link
//             href="/audit"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             Audit Trail
//           </Link>

//           <Link
//             href="/integrity"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-blue-50 text-blue-700 font-medium"
//           >
//             <ShieldCheck size={18} />
//             Record Integrity
//           </Link>

//           <Link
//             href="/system-health"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             System Health
//           </Link>

//         </nav>
//       </aside>


//       {/* ================================================= */}
//       {/* MAIN CONTENT */}
//       {/* ================================================= */}

//       <main className="ml-[250px] p-8">

//         {/* HEADER */}

//         <div className="flex items-center justify-between mb-8">

//           <div>

//             <h1 className="text-2xl font-bold text-gray-900">
//               Record Integrity
//             </h1>

//             <p className="text-sm text-gray-500 mt-1">
//               Tamper-evident verification of verified land records
//             </p>

//           </div>

//           <button
//             onClick={verifyChain}
//             disabled={verifying}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
//           >

//             <RefreshCw
//               size={17}
//               className={
//                 verifying
//                   ? "animate-spin"
//                   : ""
//               }
//             />

//             {verifying
//               ? "Verifying..."
//               : "Verify Integrity"}

//           </button>

//         </div>


//         {/* ================================================= */}
//         {/* KPI CARDS */}
//         {/* ================================================= */}

//         <div className="grid grid-cols-3 gap-5 mb-7">

//           {/* STATUS */}

//           <div className="bg-white border border-gray-200 rounded-xl p-5">

//             <div className="flex items-center justify-between">

//               <div>

//                 <p className="text-sm text-gray-500">
//                   Chain Status
//                 </p>

//                 <p className="text-xl font-bold mt-2">

//                   {verification
//                     ? chainValid
//                       ? "Verified"
//                       : "Integrity Issue"
//                     : "Not Checked"}

//                 </p>

//               </div>

//               <div
//                 className={`h-11 w-11 rounded-full flex items-center justify-center ${
//                   verification && !chainValid
//                     ? "bg-red-50"
//                     : "bg-green-50"
//                 }`}
//               >

//                 {verification && !chainValid ? (

//                   <ShieldAlert
//                     size={23}
//                     className="text-red-600"
//                   />

//                 ) : (

//                   <ShieldCheck
//                     size={23}
//                     className="text-green-600"
//                   />

//                 )}

//               </div>

//             </div>

//           </div>


//           {/* BLOCK COUNT */}

//           <div className="bg-white border border-gray-200 rounded-xl p-5">

//             <p className="text-sm text-gray-500">
//               Integrity Blocks
//             </p>

//             <p className="text-2xl font-bold mt-2">
//               {blockCount}
//             </p>

//             <p className="text-xs text-gray-400 mt-1">
//               Cryptographically linked blocks
//             </p>

//           </div>


//           {/* ALGORITHM */}

//           <div className="bg-white border border-gray-200 rounded-xl p-5">

//             <div className="flex items-center gap-3">

//               <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center">

//                 <LockKeyhole
//                   size={22}
//                   className="text-blue-600"
//                 />

//               </div>

//               <div>

//                 <p className="text-sm text-gray-500">
//                   Integrity Algorithm
//                 </p>

//                 <p className="text-lg font-bold">
//                   SHA-256
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>


//         {/* ================================================= */}
//         {/* HOW IT WORKS */}
//         {/* ================================================= */}

//         <div className="bg-white border border-gray-200 rounded-xl p-6 mb-7">

//           <div className="flex items-start gap-4">

//             <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">

//               <Link2
//                 size={20}
//                 className="text-purple-600"
//               />

//             </div>

//             <div>

//               <h2 className="font-semibold text-gray-900">
//                 How record integrity works
//               </h2>

//               <p className="text-sm text-gray-500 mt-2 leading-6 max-w-4xl">
//                 When a record is verified, BhoomiSure AI
//                 creates a SHA-256 fingerprint of its important
//                 land fields. Each integrity block is linked to
//                 the previous block using its hash. If the stored
//                 record is changed outside the verification
//                 workflow, the current fingerprint no longer
//                 matches the stored fingerprint.
//               </p>

//               <div className="flex items-center gap-3 mt-4 text-xs">

//                 <span className="px-3 py-2 bg-gray-50 rounded-md text-gray-600">
//                   Land Record
//                 </span>

//                 <span className="text-gray-400">
//                   →
//                 </span>

//                 <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md">
//                   SHA-256
//                 </span>

//                 <span className="text-gray-400">
//                   →
//                 </span>

//                 <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-md">
//                   Integrity Block
//                 </span>

//                 <span className="text-gray-400">
//                   →
//                 </span>

//                 <span className="px-3 py-2 bg-green-50 text-green-700 rounded-md">
//                   Hash Chain
//                 </span>

//               </div>

//             </div>

//           </div>

//         </div>


//         {/* ================================================= */}
//         {/* VERIFICATION RESULT */}
//         {/* ================================================= */}

//         {verification && (

//           <div
//             className={`mb-7 rounded-xl border p-5 ${
//               verification.chain_valid
//                 ? "bg-green-50 border-green-200"
//                 : "bg-red-50 border-red-200"
//             }`}
//           >

//             <div className="flex items-center gap-3">

//               {verification.chain_valid ? (

//                 <CheckCircle2
//                   size={22}
//                   className="text-green-600"
//                 />

//               ) : (

//                 <ShieldAlert
//                   size={22}
//                   className="text-red-600"
//                 />

//               )}

//               <div>

//                 <p
//                   className={`font-semibold ${
//                     verification.chain_valid
//                       ? "text-green-800"
//                       : "text-red-800"
//                   }`}
//                 >

//                   {verification.chain_valid
//                     ? "Integrity verification passed"
//                     : "Integrity verification detected an issue"}

//                 </p>

//                 <p className="text-sm text-gray-600 mt-1">

//                   Checked{" "}
//                   {verification.total_blocks} integrity block
//                   {verification.total_blocks === 1
//                     ? ""
//                     : "s"}{" "}
//                   and associated record fingerprints.

//                 </p>

//               </div>

//             </div>

//           </div>

//         )}


//         {/* ================================================= */}
//         {/* INTEGRITY CHAIN */}
//         {/* ================================================= */}

//         <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

//           <div className="px-6 py-5 border-b border-gray-200">

//             <div className="flex items-center gap-3">

//               <Database
//                 size={19}
//                 className="text-gray-700"
//               />

//               <div>

//                 <h2 className="font-semibold text-gray-900">
//                   Integrity Chain
//                 </h2>

//                 <p className="text-xs text-gray-500 mt-1">
//                   Cryptographic history of verified records
//                 </p>

//               </div>

//             </div>

//           </div>


//           {loading ? (

//             <div className="p-10 text-center text-gray-500">
//               Loading integrity chain...
//             </div>

//           ) : !data?.blocks?.length ? (

//             <div className="p-12 text-center">

//               <ShieldAlert
//                 size={40}
//                 className="mx-auto text-gray-300 mb-3"
//               />

//               <p className="font-medium text-gray-700">
//                 No integrity blocks yet
//               </p>

//               <p className="text-sm text-gray-400 mt-1">
//                 Verify a land record to create its first
//                 integrity block.
//               </p>

//             </div>

//           ) : (

//             <div className="divide-y divide-gray-100">

//               {data.blocks.map(
//                 (block: any) => (

//                   <div
//                     key={block.id}
//                     className="px-6 py-5"
//                   >

//                     <div className="flex items-center justify-between">

//                       <div className="flex items-center gap-4">

//                         <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">

//                           <CheckCircle2
//                             size={19}
//                             className="text-green-600"
//                           />

//                         </div>

//                         <div>

//                           <div className="flex items-center gap-3">

//                             <span className="font-semibold text-gray-900">
//                               Block #{block.block_number}
//                             </span>

//                             <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
//                               SHA-256
//                             </span>

//                           </div>

//                           <p className="text-xs text-gray-500 mt-1">
//                             Land Record #{block.record_id}
//                           </p>

//                         </div>

//                       </div>

//                     </div>


//                     {/* HASHES */}

//                     <div className="grid grid-cols-2 gap-4 mt-5">

//                       <div className="bg-gray-50 rounded-lg p-4">

//                         <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                           Data Hash
//                         </p>

//                         <p className="font-mono text-xs text-gray-700 mt-2 break-all">
//                           {block.data_hash}
//                         </p>

//                       </div>


//                       <div className="bg-gray-50 rounded-lg p-4">

//                         <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                           Current Block Hash
//                         </p>

//                         <p className="font-mono text-xs text-gray-700 mt-2 break-all">
//                           {block.current_hash}
//                         </p>

//                       </div>

//                     </div>


//                     {/* PREVIOUS HASH */}

//                     <div className="mt-4">

//                       <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                         Previous Hash
//                       </p>

//                       <p className="font-mono text-xs text-gray-500 mt-1 break-all">
//                         {block.previous_hash}
//                       </p>

//                     </div>

//                   </div>

//                 )
//               )}

//             </div>

//           )}

//         </div>

//       </main>

//     </div>
//   );
// }