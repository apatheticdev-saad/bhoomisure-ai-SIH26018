"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type RecordItem = {
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
  validation_status: string | null;
};

type RecordsResponse = {
  count: number;
  records: RecordItem[];
};

export default function RecordsPage() {
  const router = useRouter();

  const [records, setRecords] =
    useState<RecordItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [village, setVillage] =
    useState("");

  async function loadRecords() {
    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (status) {
        params.set("status", status);
      }

      if (district) {
        params.set(
          "district",
          district
        );
      }

      if (village) {
        params.set(
          "village",
          village
        );
      }

      const response = await fetch(
        `${API_URL}/api/records/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load records."
        );
      }

      const result: RecordsResponse =
        await response.json();

      setRecords(result.records);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load land records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [
    search,
    status,
    district,
    village,
  ]);

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();
    setSearch(searchInput);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setDistrict("");
    setVillage("");
  }

  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map(
              (record) =>
                record.district
            )
            .filter(Boolean)
        )
      ) as string[],
    [records]
  );

  const villages = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map(
              (record) =>
                record.village
            )
            .filter(Boolean)
        )
      ) as string[],
    [records]
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-[1450px] px-6 py-6 md:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                LAND RECORD REPOSITORY
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Land Records
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Search, review and inspect digitized land records.
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Records Found
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                {records.length}
              </p>

            </div>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-[1450px] p-6 md:p-8">

        {/* Search */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row"
          >

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search owner, survey no., khata, village, district..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
              />

            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>

          </form>

          {/* Filters */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
            >

              <option value="">
                All Statuses
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="needs_review">
                Needs Review
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

            <select
              value={district}
              onChange={(event) =>
                setDistrict(
                  event.target.value
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
            >

              <option value="">
                All Districts
              </option>

              {districts.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>

            <select
              value={village}
              onChange={(event) =>
                setVillage(
                  event.target.value
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
            >

              <option value="">
                All Villages
              </option>

              {villages.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>

            <button
              onClick={clearFilters}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Clear Filters
            </button>

          </div>

        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertTriangle size={18} />

            {error}

          </div>
        )}

        {/* Loading */}
        {loading ? (

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">

            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />

            <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-100" />

          </div>

        ) : records.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">

            <Search
              size={34}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-bold text-slate-700">
              No records found
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Try a different search term or clear the filters.
            </p>

          </div>

        ) : (

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Record
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Owner
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Parcel
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Location
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Area
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Confidence
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th />

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {records.map(
                    (record) => (

                      <tr
                        key={record.id}
                        onClick={() =>
                          router.push(
                            `/records/${record.id}`
                          )
                        }
                        className="cursor-pointer transition hover:bg-slate-50"
                      >

                        {/* Record */}
                        <td className="px-5 py-4">

                          <div className="font-semibold text-slate-800">
                            #{record.id}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-400">
                            Document #{record.document_id}
                          </div>

                        </td>

                        {/* Owner */}
                        <td className="px-5 py-4">

                          <div className="text-sm font-semibold text-slate-800">
                            {record.owner_name ||
                              "—"}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-400">
                            {record.ownership_details ||
                              "—"}
                          </div>

                        </td>

                        {/* Parcel */}
                        <td className="px-5 py-4">

                          <div className="text-sm font-semibold text-slate-700">
                            {record.survey_number ||
                              "—"}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-400">
                            Khasra:{" "}
                            {record.khasra_number ||
                              "—"}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            Khata:{" "}
                            {record.khata_number ||
                              "—"}
                          </div>

                        </td>

                        {/* Location */}
                        <td className="px-5 py-4">

                          <div className="text-sm text-slate-700">
                            {record.village ||
                              "—"}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-400">
                            {record.tehsil ||
                              "—"}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            {record.district ||
                              "—"}
                          </div>

                        </td>

                        {/* Area */}
                        <td className="px-5 py-4">

                          <div className="text-sm font-semibold text-slate-700">
                            {record.area ||
                              "—"}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            {record.area_unit ||
                              ""}
                          </div>

                        </td>

                        {/* Confidence */}
                        <td className="px-5 py-4">

                          <span className="text-sm font-bold text-slate-700">
                            {record.overall_confidence ??
                              0}
                            %
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              record.validation_status
                            }
                          />

                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              href={`/reports/${record.id}`}
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              Report
                            </Link>

                            <ChevronRight
                              size={18}
                              className="text-slate-300"
                            />

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 lg:hidden">

              {records.map(
                (record) => (

                  <div
                    key={record.id}
                    className="w-full p-5 text-left transition hover:bg-slate-50"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <div className="text-xs font-bold text-slate-400">
                          RECORD #{record.id}
                        </div>

                        <div className="mt-1 text-base font-bold text-slate-800">
                          {record.owner_name ||
                            "Unknown Owner"}
                        </div>

                      </div>

                      <StatusBadge
                        status={
                          record.validation_status
                        }
                      />

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">

                      <div>

                        <span className="text-slate-400">
                          Survey
                        </span>

                        <p className="mt-1 font-semibold text-slate-700">
                          {record.survey_number ||
                            "—"}
                        </p>

                      </div>

                      <div>

                        <span className="text-slate-400">
                          Area
                        </span>

                        <p className="mt-1 font-semibold text-slate-700">
                          {record.area ||
                            "—"}{" "}
                          {record.area_unit ||
                            ""}
                        </p>

                      </div>

                      <div>

                        <span className="text-slate-400">
                          Village
                        </span>

                        <p className="mt-1 font-semibold text-slate-700">
                          {record.village ||
                            "—"}
                        </p>

                      </div>

                      <div>

                        <span className="text-slate-400">
                          District
                        </span>

                        <p className="mt-1 font-semibold text-slate-700">
                          {record.district ||
                            "—"}
                        </p>

                      </div>

                    </div>

                    {/* Mobile actions */}
                    <div className="mt-4 flex items-center justify-between">

                      <button
                        onClick={() =>
                          router.push(
                            `/records/${record.id}`
                          )
                        }
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Open Record →
                      </button>

                      <Link
                        href={`/reports/${record.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        View Report
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}

        {/* Footer info */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">

          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Evidence-backed records
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Verified records
          </div>

          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Records requiring review
          </div>

        </div>

      </div>

    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized =
    status?.toLowerCase() ||
    "unknown";

  if (normalized === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">

        <CheckCircle2 size={12} />

        Verified

      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-700">

        <XCircle size={12} />

        Rejected

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">

      <AlertTriangle size={12} />

      Needs Review

    </span>
  );
}