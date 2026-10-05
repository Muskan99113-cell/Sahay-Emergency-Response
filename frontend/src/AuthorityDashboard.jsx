import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Hospital,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
  Truck,
} from "lucide-react";

import LiveMap from "./components/LiveMap";

const API_BASE = "http://127.0.0.1:8000";

const severityStyles = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

function formatStatus(status) {
  if (!status) return "Active";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SeverityBadge({ severity }) {
  const classes =
    severityStyles[severity?.toLowerCase()] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${classes}`}
    >
      {severity || "unknown"}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function AuthorityDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(`${API_BASE}/api/authority/dashboard`);

      if (!response.ok) {
        throw new Error("Unable to load authority dashboard.");
      }

      const data = await response.json();

      setDashboard(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unable to connect to SAHAY backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const summary = dashboard?.summary || {};

  const incidents = useMemo(() => {
    const list = Array.isArray(dashboard?.incidents)
      ? dashboard.incidents
      : [];

    return [...list].sort(
      (a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0)
    );
  }, [dashboard]);

  const filteredIncidents = useMemo(() => {
    if (filter === "critical") {
      return incidents.filter(
        (incident) => incident.severity?.toLowerCase() === "critical"
      );
    }

    if (filter === "high") {
      return incidents.filter(
        (incident) => incident.severity?.toLowerCase() === "high"
      );
    }

    if (filter === "assigned") {
      return incidents.filter((incident) => incident.responder_name);
    }

    if (filter === "hospital") {
      return incidents.filter((incident) => incident.hospital_name);
    }

    return incidents;
  }, [filter, incidents]);

  const averagePriority = useMemo(() => {
    if (!incidents.length) return 0;

    const total = incidents.reduce(
      (sum, incident) => sum + (incident.priority_score ?? 0),
      0
    );

    return Math.round(total / incidents.length);
  }, [incidents]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <ShieldAlert size={17} />
                SAHAY Command Center
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Emergency Operations Dashboard
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Central monitoring for active emergencies, responder
                deployment, hospital coordination and emergency priority.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Command Center Online
                </div>

                <p className="mt-1 text-slate-400">
                  {lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Syncing..."}
                </p>
              </div>

              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <div>
              <p className="font-semibold">Command center alert</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCard
            icon={Siren}
            label="Total"
            value={summary.total_incidents ?? 0}
            description="All incidents"
          />

          <StatCard
            icon={Activity}
            label="Active"
            value={summary.active_incidents ?? 0}
            description="Currently active"
          />

          <StatCard
            icon={ShieldAlert}
            label="Critical"
            value={summary.critical_incidents ?? 0}
            description="Immediate attention"
          />

          <StatCard
            icon={AlertCircle}
            label="High"
            value={summary.high_incidents ?? 0}
            description="High priority"
          />

          <StatCard
            icon={Truck}
            label="Responders"
            value={summary.assigned_responders ?? 0}
            description="Assigned"
          />

          <StatCard
            icon={Hospital}
            label="Hospitals"
            value={summary.hospital_assigned ?? 0}
            description="Coordinated"
          />

          <StatCard
            icon={BarChart3}
            label="Avg Priority"
            value={averagePriority}
            description="Active average"
          />

          <StatCard
            icon={CheckCircle2}
            label="Medium"
            value={summary.medium_incidents ?? 0}
            description="Standard priority"
          />
        </div>

        {/* Map */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">Live Emergency Map</h2>
              <p className="mt-1 text-xs text-slate-500">
                Active incident locations and severity overview
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live monitoring
            </div>
          </div>

          <div className="h-[420px]">
            <LiveMap incidents={incidents} />
          </div>
        </div>

        {/* Incident controls */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-slate-900">
              Active Incident Monitor
            </p>

            <p className="text-xs text-slate-500">
              Highest-priority incidents are shown first
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["critical", "Critical"],
              ["high", "High"],
              ["assigned", "Responder Assigned"],
              ["hospital", "Hospital Coordinated"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  filter === value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Incident list */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <RefreshCw
                className="mx-auto animate-spin text-slate-500"
                size={28}
              />

              <p className="mt-4 font-semibold text-slate-800">
                Loading command center...
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Connecting to SAHAY operations services.
              </p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <ShieldAlert className="mx-auto text-slate-400" size={40} />

              <p className="mt-4 font-semibold text-slate-800">
                No matching active incidents
              </p>

              <p className="mt-1 text-sm text-slate-500">
                The command center will update automatically when emergencies
                are created.
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <Siren size={24} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          Emergency #{incident.id}
                        </h3>

                        <SeverityBadge severity={incident.severity} />

                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          {formatStatus(incident.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {incident.emergency_type?.toUpperCase() ||
                          "EMERGENCY"}{" "}
                        • {formatDate(incident.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                    Priority {incident.priority_score ?? "—"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Citizen
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {incident.citizen_name || "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      AI Confidence
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {incident.ai_confidence ?? "—"}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Responder
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {incident.responder_name || "Unassigned"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Hospital
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {incident.hospital_name || "Not coordinated"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <MapPin size={15} />

                      {incident.latitude && incident.longitude
                        ? `${Number(incident.latitude).toFixed(4)}, ${Number(
                            incident.longitude
                          ).toFixed(4)}`
                        : "Unavailable"}
                    </p>
                  </div>
                </div>

                {incident.description && (
                  <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Incident Description
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {incident.description}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={14} />
                    Created {formatDate(incident.created_at)}
                  </span>

                  {incident.responder_status && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                      Responder: {formatStatus(incident.responder_status)}
                    </span>
                  )}

                  {incident.hospital_status && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      Hospital: {formatStatus(incident.hospital_status)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} />
            SAHAY Emergency Command Network
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Automatic refresh every 5 seconds
          </div>
        </div>
      </div>
    </div>
  );
}