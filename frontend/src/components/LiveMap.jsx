import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [28.6139, 77.209];

const severityColors = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
};

function createIncidentIcon(severity = "medium") {
  const color = severityColors[severity?.toLowerCase()] || "#2563eb";

  return L.divIcon({
    className: "sahay-map-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function MapCenterUpdater({ incidents }) {
  const map = useMap();

  useEffect(() => {
    const validIncidents = incidents.filter(
      (incident) =>
        typeof incident.latitude === "number" &&
        typeof incident.longitude === "number"
    );

    if (validIncidents.length === 0) {
      map.setView(defaultCenter, 11);
      return;
    }

    const first = validIncidents[0];

    map.setView(
      [first.latitude, first.longitude],
      12,
      {
        animate: true,
      }
    );
  }, [incidents, map]);

  return null;
}

export default function LiveMap({ incidents = [] }) {
  const validIncidents = incidents.filter(
    (incident) =>
      typeof incident.latitude === "number" &&
      typeof incident.longitude === "number"
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute left-4 top-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-sm font-bold text-slate-900">
            Live Incident Map
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          {validIncidents.length} active incident
          {validIncidents.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
        <div className="flex flex-wrap gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            Critical
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />
            High
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-600" />
            Medium
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
            Low
          </div>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="h-[420px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater incidents={validIncidents} />

        {validIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={createIncidentIcon(incident.severity)}
          >
            <Popup>
              <div className="min-w-[220px]">
                <h3 className="mb-2 text-base font-bold text-slate-900">
                  Emergency #{incident.id}
                </h3>

                <div className="space-y-1.5 text-sm">
                  <p>
                    <strong>Type:</strong>{" "}
                    {incident.emergency_type || "Unknown"}
                  </p>

                  <p>
                    <strong>Severity:</strong>{" "}
                    <span className="font-semibold capitalize">
                      {incident.severity || "Unknown"}
                    </span>
                  </p>

                  <p>
                    <strong>Priority:</strong>{" "}
                    {incident.priority_score ?? "N/A"}
                  </p>

                  <p>
                    <strong>Citizen:</strong>{" "}
                    {incident.citizen_name || "Unknown"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {incident.status || "Unknown"}
                  </p>

                  {incident.responder_name && (
                    <p>
                      <strong>Responder:</strong>{" "}
                      {incident.responder_name}
                    </p>
                  )}

                  {incident.hospital_name && (
                    <p>
                      <strong>Hospital:</strong>{" "}
                      {incident.hospital_name}
                    </p>
                  )}
                </div>

                <div className="mt-3 rounded-lg bg-slate-100 p-2 text-xs text-slate-600">
                  📍 {incident.latitude.toFixed(4)},{" "}
                  {incident.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}