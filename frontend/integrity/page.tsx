"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Link2,
  Database,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function IntegrityPage() {
  const [data, setData] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  async function loadChain() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/integrity/chain`
      );

      if (!response.ok) {
        throw new Error("Failed to load integrity chain");
      }

      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function verifyChain() {
    try {
      setVerifying(true);

      const response = await fetch(
        `${API}/api/integrity/verify`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Integrity verification failed");
      }

      const result = await response.json();

      setVerification(result);

      await loadChain();
    } catch (error) {
      console.error(error);
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    loadChain();
  }, []);

  const chainValid =
    verification?.chain_valid ?? true;

  const blockCount =
    data?.count ?? 0;

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="fixed left-0 top-0 h-screen w-[250px] bg-white border-r border-gray-200 px-4 py-5">

        <div className="mb-8 px-3">

          <div className="text-xl font-bold text-gray-900">
            BhoomiSure{" "}
            <span className="text-blue-600">
              AI
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Land Intelligence Platform
          </div>

        </div>

        <nav className="space-y-1">

          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/upload"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Upload
          </Link>

          <Link
            href="/records"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Land Records
          </Link>

          <Link
            href="/verification"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Verification
          </Link>

          <Link
            href="/validation"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Validation
          </Link>

          <Link
            href="/audit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Audit Trail
          </Link>

          <Link
            href="/integrity"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-blue-50 text-blue-700 font-medium"
          >
            <ShieldCheck size={18} />
            Record Integrity
          </Link>

          <Link
            href="/system-health"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            System Health
          </Link>

        </nav>
      </aside>


      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="ml-[250px] p-8">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              Record Integrity
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Tamper-evident verification of verified land records
            </p>

          </div>

          <button
            onClick={verifyChain}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >

            <RefreshCw
              size={17}
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


        {/* ================================================= */}
        {/* KPI CARDS */}
        {/* ================================================= */}

        <div className="grid grid-cols-3 gap-5 mb-7">

          {/* STATUS */}

          <div className="bg-white border border-gray-200 rounded-xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Chain Status
                </p>

                <p className="text-xl font-bold mt-2">

                  {verification
                    ? chainValid
                      ? "Verified"
                      : "Integrity Issue"
                    : "Not Checked"}

                </p>

              </div>

              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center ${
                  verification && !chainValid
                    ? "bg-red-50"
                    : "bg-green-50"
                }`}
              >

                {verification && !chainValid ? (

                  <ShieldAlert
                    size={23}
                    className="text-red-600"
                  />

                ) : (

                  <ShieldCheck
                    size={23}
                    className="text-green-600"
                  />

                )}

              </div>

            </div>

          </div>


          {/* BLOCK COUNT */}

          <div className="bg-white border border-gray-200 rounded-xl p-5">

            <p className="text-sm text-gray-500">
              Integrity Blocks
            </p>

            <p className="text-2xl font-bold mt-2">
              {blockCount}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Cryptographically linked blocks
            </p>

          </div>


          {/* ALGORITHM */}

          <div className="bg-white border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3">

              <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center">

                <LockKeyhole
                  size={22}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Integrity Algorithm
                </p>

                <p className="text-lg font-bold">
                  SHA-256
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* HOW IT WORKS */}
        {/* ================================================= */}

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-7">

          <div className="flex items-start gap-4">

            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">

              <Link2
                size={20}
                className="text-purple-600"
              />

            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                How record integrity works
              </h2>

              <p className="text-sm text-gray-500 mt-2 leading-6 max-w-4xl">
                When a record is verified, BhoomiSure AI
                creates a SHA-256 fingerprint of its important
                land fields. Each integrity block is linked to
                the previous block using its hash. If the stored
                record is changed outside the verification
                workflow, the current fingerprint no longer
                matches the stored fingerprint.
              </p>

              <div className="flex items-center gap-3 mt-4 text-xs">

                <span className="px-3 py-2 bg-gray-50 rounded-md text-gray-600">
                  Land Record
                </span>

                <span className="text-gray-400">
                  →
                </span>

                <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md">
                  SHA-256
                </span>

                <span className="text-gray-400">
                  →
                </span>

                <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-md">
                  Integrity Block
                </span>

                <span className="text-gray-400">
                  →
                </span>

                <span className="px-3 py-2 bg-green-50 text-green-700 rounded-md">
                  Hash Chain
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* VERIFICATION RESULT */}
        {/* ================================================= */}

        {verification && (

          <div
            className={`mb-7 rounded-xl border p-5 ${
              verification.chain_valid
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >

            <div className="flex items-center gap-3">

              {verification.chain_valid ? (

                <CheckCircle2
                  size={22}
                  className="text-green-600"
                />

              ) : (

                <ShieldAlert
                  size={22}
                  className="text-red-600"
                />

              )}

              <div>

                <p
                  className={`font-semibold ${
                    verification.chain_valid
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >

                  {verification.chain_valid
                    ? "Integrity verification passed"
                    : "Integrity verification detected an issue"}

                </p>

                <p className="text-sm text-gray-600 mt-1">

                  Checked{" "}
                  {verification.total_blocks} integrity block
                  {verification.total_blocks === 1
                    ? ""
                    : "s"}{" "}
                  and associated record fingerprints.

                </p>

              </div>

            </div>

          </div>

        )}


        {/* ================================================= */}
        {/* INTEGRITY CHAIN */}
        {/* ================================================= */}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <Database
                size={19}
                className="text-gray-700"
              />

              <div>

                <h2 className="font-semibold text-gray-900">
                  Integrity Chain
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Cryptographic history of verified records
                </p>

              </div>

            </div>

          </div>


          {loading ? (

            <div className="p-10 text-center text-gray-500">
              Loading integrity chain...
            </div>

          ) : !data?.blocks?.length ? (

            <div className="p-12 text-center">

              <ShieldAlert
                size={40}
                className="mx-auto text-gray-300 mb-3"
              />

              <p className="font-medium text-gray-700">
                No integrity blocks yet
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Verify a land record to create its first
                integrity block.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-gray-100">

              {data.blocks.map(
                (block: any) => (

                  <div
                    key={block.id}
                    className="px-6 py-5"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-4">

                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">

                          <CheckCircle2
                            size={19}
                            className="text-green-600"
                          />

                        </div>

                        <div>

                          <div className="flex items-center gap-3">

                            <span className="font-semibold text-gray-900">
                              Block #{block.block_number}
                            </span>

                            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                              SHA-256
                            </span>

                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            Land Record #{block.record_id}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* HASHES */}

                    <div className="grid grid-cols-2 gap-4 mt-5">

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Data Hash
                        </p>

                        <p className="font-mono text-xs text-gray-700 mt-2 break-all">
                          {block.data_hash}
                        </p>

                      </div>


                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Current Block Hash
                        </p>

                        <p className="font-mono text-xs text-gray-700 mt-2 break-all">
                          {block.current_hash}
                        </p>

                      </div>

                    </div>


                    {/* PREVIOUS HASH */}

                    <div className="mt-4">

                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Previous Hash
                      </p>

                      <p className="font-mono text-xs text-gray-500 mt-1 break-all">
                        {block.previous_hash}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}