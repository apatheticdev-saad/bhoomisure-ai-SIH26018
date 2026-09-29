"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

export type ParcelRecord = {
  id: number;
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
  validation_status: string | null;
  overall_confidence: number | null;
};

type Props = {
  records: ParcelRecord[];
};

const CENTER: [number, number] = [
  21.16,
  77.31,
];

function MapController({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 12);
  }, [map, center]);

  return null;
}

function statusColor(
  status: string | null
) {
  switch (status) {
    case "verified":
      return "#10b981";

    case "rejected":
      return "#ef4444";

    default:
      return "#f59e0b";
  }
}

function statusLabel(
  status: string | null
) {
  switch (status) {
    case "verified":
      return "Verified";

    case "rejected":
      return "Rejected";

    default:
      return "Needs Review";
  }
}

/*
 * The current land-record database does not yet contain
 * cadastral latitude/longitude or parcel polygon geometry.
 *
 * These deterministic offsets are therefore DEMONSTRATION
 * locations only. They must not be presented as official
 * cadastral boundaries.
 */
function getDemoPosition(
  record: ParcelRecord,
  index: number
): [number, number] {
  const offsets = [
    [0, 0],
    [0.008, 0.006],
    [-0.006, 0.009],
    [0.011, -0.007],
    [-0.009, -0.006],
    [0.014, 0.012],
  ];

  const offset =
    offsets[index % offsets.length];

  return [
    CENTER[0] + offset[0],
    CENTER[1] + offset[1],
  ];
}

export default function ParcelMap({
  records,
}: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">

      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={CENTER} />

        {records.map((record, index) => {
          const position =
            getDemoPosition(
              record,
              index
            );

          const color =
            statusColor(
              record.validation_status
            );

          return (
            <CircleMarker
              key={record.id}
              center={position}
              radius={10}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.75,
                weight: 3,
              }}
            >

              <Popup>

                <div className="min-w-[230px]">

                  <div className="border-b border-slate-100 pb-3">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      LAND RECORD #{record.id}
                    </p>

                    <p className="mt-1 text-base font-bold text-slate-800">
                      {record.owner_name ||
                        "Unknown Owner"}
                    </p>

                  </div>

                  <div className="space-y-2 pt-3 text-xs">

                    <Info
                      label="Survey / Gat"
                      value={
                        record.survey_number ||
                        "—"
                      }
                    />

                    <Info
                      label="Khasra"
                      value={
                        record.khasra_number ||
                        "—"
                      }
                    />

                    <Info
                      label="Khata"
                      value={
                        record.khata_number ||
                        "—"
                      }
                    />

                    <Info
                      label="Area"
                      value={
                        record.area
                          ? `${record.area} ${
                              record.area_unit || ""
                            }`
                          : "—"
                      }
                    />

                    <Info
                      label="Village"
                      value={
                        record.village || "—"
                      }
                    />

                    <Info
                      label="Classification"
                      value={
                        record.land_classification ||
                        "—"
                      }
                    />

                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        backgroundColor:
                          `${color}18`,
                        color,
                      }}
                    >
                      {statusLabel(
                        record.validation_status
                      )}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500">
                      {record.overall_confidence ??
                        0}
                      % confidence
                    </span>

                  </div>

                </div>

              </Popup>

            </CircleMarker>
          );
        })}

      </MapContainer>

      {/* Demo notice */}
      <div className="absolute bottom-4 left-4 z-[1000] max-w-[360px] rounded-xl border border-amber-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">

        <div className="flex gap-3">

          <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />

          <div>

            <p className="text-xs font-bold text-slate-700">
              Demonstration Map
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Parcel positions shown here are demo
              coordinates. Official cadastral geometry
              will be connected through GIS integration.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">

      <span className="text-slate-400">
        {label}
      </span>

      <span className="text-right font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}