"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  MapPinned,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type { ParcelRecord } from "@/components/ParcelMap";

const ParcelMap = dynamic(
  () => import("@/components/ParcelMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="mt-3 text-xs text-slate-400">
            Loading map...
          </p>
        </div>
      </div>
    ),
  }
);


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function MapPage() {
  const [records, setRecords] =
    useState<ParcelRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  useEffect(() => {
    async function loadRecords() {
      try {
        const response = await fetch(
          `${API_URL}/api/records/`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load records."
          );
        }

        const result =
          await response.json();

        setRecords(result.records || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, []);

  const filteredRecords =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return records;
      }

      return records.filter((record) =>
        [
          record.owner_name,
          record.survey_number,
          record.khasra_number,
          record.khata_number,
          record.village,
          record.tehsil,
          record.district,
        ]
          .filter(Boolean)
          .some((field) =>
            String(field)
              .toLowerCase()
              .includes(value)
          )
      );
    }, [records, search]);

  const verifiedCount =
    records.filter(
      (record) =>
        record.validation_status ===
        "verified"
    ).length;

  const reviewCount =
    records.filter(
      (record) =>
        record.validation_status !==
        "verified" &&
        record.validation_status !==
        "rejected"
    ).length;

  const rejectedCount =
    records.filter(
      (record) =>
        record.validation_status ===
        "rejected"
    ).length;

  return (
    <main className="min-h-screen bg-[#f5f7fb]">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-6 py-6 md:px-8">

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <MapPinned size={22} />
                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    BHOOMISURE AI
                  </p>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Parcel Intelligence
                  </h1>

                </div>

              </div>

              <p className="mt-3 max-w-2xl text-sm text-slate-500">
                Explore land records spatially and inspect
                ownership, survey references, area and
                verification status.
              </p>

            </div>

            <div className="relative w-full xl:w-[350px]">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search owner, survey, village..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-[1500px] p-6 md:p-8">

        {/* Summary */}
        <section className="grid gap-4 md:grid-cols-4">

          <SummaryCard
            icon={<Database size={18} />}
            title="Mapped Records"
            value={records.length}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Verified"
            value={verifiedCount}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            icon={<AlertTriangle size={18} />}
            title="Needs Review"
            value={reviewCount}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            icon={<XCircle size={18} />}
            title="Rejected"
            value={rejectedCount}
            iconClass="bg-red-50 text-red-600"
          />

        </section>

        {/* Main map */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>

                <h2 className="text-sm font-bold text-slate-800">
                  Land Record Map
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  {filteredRecords.length} records displayed
                </p>

              </div>

              <div className="flex items-center gap-4">

                <Legend
                  color="bg-emerald-500"
                  label="Verified"
                />

                <Legend
                  color="bg-amber-400"
                  label="Review"
                />

                <Legend
                  color="bg-red-500"
                  label="Rejected"
                />

              </div>

            </div>

            <div className="h-[620px]">

              {loading ? (
                <div className="flex h-full items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <p className="mt-3 text-xs text-slate-400">
                      Loading land records...
                    </p>

                  </div>

                </div>
              ) : (
                <ParcelMap
                  records={filteredRecords}
                />
              )}

            </div>

          </div>

          {/* Record list */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">

              <h2 className="text-sm font-bold text-slate-800">
                Parcel Records
              </h2>

              <p className="mt-1 text-[11px] text-slate-400">
                Select a record to inspect its land details.
              </p>

            </div>

            <div className="max-h-[670px] overflow-y-auto">

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center">

                  <Search
                    size={25}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No records found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another owner, survey number
                    or village.
                  </p>

                </div>
              ) : (
                filteredRecords.map(
                  (record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      selected={
                        selectedId ===
                        record.id
                      }
                      onSelect={() =>
                        setSelectedId(
                          record.id
                        )
                      }
                    />
                  )
                )
              )}

            </div>

          </div>

        </section>

        {/* Integration note */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ShieldCheck size={19} />
            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-800">
                GIS Integration Layer
              </h3>

              <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-500">
                The current prototype connects verified land
                records to a spatial intelligence interface.
                Official parcel polygons, cadastral boundaries
                and government GIS layers can be integrated
                here when authoritative spatial data is available.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <Tag>
                  Survey / Gat Reference
                </Tag>

                <Tag>
                  Owner Mapping
                </Tag>

                <Tag>
                  Verification Status
                </Tag>

                <Tag>
                  GIS-ready Architecture
                </Tag>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

/* -------------------------------- */
/* Components */
/* -------------------------------- */

function SummaryCard({
  icon,
  title,
  value,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="hidden items-center gap-1.5 sm:flex">

      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      <span className="text-[10px] font-medium text-slate-500">
        {label}
      </span>

    </div>
  );
}

function RecordCard({
  record,
  selected,
  onSelect,
}: {
  record: ParcelRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const isVerified =
    record.validation_status ===
    "verified";

  const isRejected =
    record.validation_status ===
    "rejected";

  return (
    <button
      onClick={onSelect}
      className={`w-full border-b border-slate-100 p-4 text-left transition ${
        selected
          ? "bg-blue-50"
          : "hover:bg-slate-50"
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm font-bold text-slate-800">
            {record.owner_name ||
              "Unknown Owner"}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Record #{record.id}
            {" • "}
            Survey{" "}
            {record.survey_number ||
              "—"}
          </p>

        </div>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-bold ${
            isVerified
              ? "bg-emerald-50 text-emerald-700"
              : isRejected
              ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isVerified
            ? "VERIFIED"
            : isRejected
            ? "REJECTED"
            : "REVIEW"}
        </span>

      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">

        <MiniInfo
          label="Village"
          value={
            record.village || "—"
          }
        />

        <MiniInfo
          label="Area"
          value={
            record.area
              ? `${record.area} ${
                  record.area_unit || ""
                }`
              : "—"
          }
        />

        <MiniInfo
          label="Khata"
          value={
            record.khata_number ||
            "—"
          }
        />

        <MiniInfo
          label="Confidence"
          value={`${record.overall_confidence ?? 0}%`}
        />

      </div>

      <div className="mt-3 text-[10px] font-semibold text-blue-600">
        {selected
          ? "Selected record"
          : "Click to inspect"}
      </div>

    </button>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[9px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}

function Tag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-600">
      {children}
    </span>
  );
}