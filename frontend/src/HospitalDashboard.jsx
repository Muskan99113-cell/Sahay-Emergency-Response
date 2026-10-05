import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Hospital,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const severityStyles = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

const hospitalStatusStyles = {
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-amber-50 text-amber-700 border-amber-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unavailable: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatStatus(status) {
  if (!status) return "Waiting";
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes =
    hospitalStatusStyles[status] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const classes =
    severityStyles[severity?.toLowerCase()] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${classes}`}
    >
      {severity || "unknown"}
    </span>
  );
}

function Workflow({ status }) {
  const steps = [
    { key: "accepted", label: "Accepted" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="mt-5">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const completed = currentIndex >= index;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    completed
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-2 text-[11px] font-semibold ${
                    completed ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    currentIndex > index ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchIncidents = async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(`${API_BASE}/api/hospitals/incidents`);

      if (!response.ok) {
        throw new Error("Unable to load hospital emergencies.");
      }

      const data = await response.json();

      setIncidents(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unable to connect to SAHAY backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const interval = setInterval(() => {
      fetchIncidents();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = useMemo(() => {
    if (filter === "required") {
      return incidents.filter((incident) => incident.hospital_required);
    }

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

    return incidents;
  }, [incidents, filter]);

  const stats = useMemo(() => {
    return {
      incoming: incidents.length,
      critical: incidents.filter(
        (incident) => incident.severity?.toLowerCase() === "critical"
      ).length,
      high: incidents.filter(
        (incident) => incident.severity?.toLowerCase() === "high"
      ).length,
      accepted: incidents.filter(
        (incident) => incident.hospital_status === "accepted"
      ).length,
      preparing: incidents.filter(
        (incident) => incident.hospital_status === "preparing"
      ).length,
      ready: incidents.filter(
        (incident) => incident.hospital_status === "ready"
      ).length,
    };
  }, [incidents]);

  const performAction = async (incidentId, action) => {
    try {
      setActionId(incidentId);
      setError("");

      let response;

      if (action === "accept") {
        response = await fetch(
          `${API_BASE}/api/hospitals/incidents/${incidentId}/accept`,
          {
            method: "POST",
          }
        );
      } else {
        response = await fetch(
          `${API_BASE}/api/hospitals/incidents/${incidentId}/status?status=${action}`,
          {
            method: "PATCH",
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Hospital action failed."
        );
      }

      setIncidents((current) =>
        current.map((incident) =>
          incident.id === incidentId ? data : incident
        )
      );
    } catch (err) {
      setError(err.message || "Hospital action failed.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Hospital size={17} />
                SAHAY Hospital Command
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Emergency Reception Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Monitor incoming emergencies, prepare clinical resources and
                coordinate hospital readiness in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  System Online
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
                onClick={() => fetchIncidents(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold">Hospital system alert</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            icon={Siren}
            label="Incoming"
            value={stats.incoming}
            description="Active emergencies"
          />

          <StatCard
            icon={ShieldAlert}
            label="Critical"
            value={stats.critical}
            description="Immediate attention"
          />

          <StatCard
            icon={AlertCircle}
            label="High"
            value={stats.high}
            description="High priority"
          />

          <StatCard
            icon={CheckCircle2}
            label="Accepted"
            value={stats.accepted}
            description="Hospital accepted"
          />

          <StatCard
            icon={Activity}
            label="Preparing"
            value={stats.preparing}
            description="Resources preparing"
          />

          <StatCard
            icon={Hospital}
            label="Ready"
            value={stats.ready}
            description="Ready for arrival"
          />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-slate-900">Emergency Queue</p>
            <p className="text-xs text-slate-500">
              Live hospital coordination queue
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["required", "Hospital Required"],
              ["critical", "Critical"],
              ["high", "High"],
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

        {/* Queue */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <RefreshCw
                className="mx-auto animate-spin text-slate-500"
                size={28}
              />
              <p className="mt-4 font-semibold text-slate-800">
                Loading emergency queue...
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Connecting to SAHAY command services.
              </p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Hospital className="mx-auto text-slate-400" size={38} />
              <p className="mt-4 font-semibold text-slate-800">
                No matching emergencies
              </p>
              <p className="mt-1 text-sm text-slate-500">
                New hospital-required emergencies will appear automatically.
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const status = incident.hospital_status;
              const busy = actionId === incident.id;

              return (
                <div
                  key={incident.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                          <Siren size={24} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">
                              Emergency #{incident.id}
                            </h2>

                            <SeverityBadge severity={incident.severity} />

                            <StatusBadge status={status} />
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {incident.emergency_type?.toUpperCase() || "EMERGENCY"}{" "}
                            • {formatDate(incident.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                        Priority {incident.priority_score ?? "—"}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-400">
                          Patient / Citizen
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
                          Recommended Unit
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {incident.recommended_hospital_type || "Suitable hospital"}
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
                            : "Location unavailable"}
                        </p>
                      </div>
                    </div>

                    {incident.description && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Emergency Description
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {incident.description}
                        </p>
                      </div>
                    )}

                    <Workflow status={status} />
                  </div>

                  <div className="flex flex-col justify-between gap-4 bg-slate-50 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 size={17} />
                      <span>
                        Hospital:{" "}
                        <strong className="text-slate-800">
                          {incident.hospital_name || "Not assigned"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!status && (
                        <button
                          onClick={() => performAction(incident.id, "accept")}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Accept Emergency
                        </button>
                      )}

                      {status === "accepted" && (
                        <button
                          onClick={() => performAction(incident.id, "preparing")}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Activity size={16} />
                          )}
                          Start Preparing
                        </button>
                      )}

                      {status === "preparing" && (
                        <button
                          onClick={() => performAction(incident.id, "ready")}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Mark Ready
                        </button>
                      )}

                      {status === "ready" && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 size={17} />
                          Hospital Ready
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Users size={15} />
            SAHAY Emergency Coordination Network
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