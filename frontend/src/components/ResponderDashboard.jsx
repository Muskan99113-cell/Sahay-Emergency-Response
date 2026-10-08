import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Siren,
  Truck,
  UserRound,
} from "lucide-react";

const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "";

const severityStyles = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

const statusStyles = {
  assigned: "bg-blue-50 text-blue-700 border-blue-200",
  en_route: "bg-indigo-50 text-indigo-700 border-indigo-200",
  arrived: "bg-purple-50 text-purple-700 border-purple-200",
  assisting: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

function StatusBadge({ status }) {
  const classes =
    statusStyles[status] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
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

function Progress({ status }) {
  const steps = [
    { key: "assigned", label: "Assigned" },
    { key: "en_route", label: "En Route" },
    { key: "arrived", label: "Arrived" },
    { key: "assisting", label: "Assisting" },
    { key: "completed", label: "Completed" },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="mt-5 overflow-x-auto pb-2">
      <div className="flex min-w-[620px] items-center">
        {steps.map((step, index) => {
          const completed = currentIndex >= index;
          const last = index === steps.length - 1;

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
                    <CheckCircle2 size={15} />
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

              {!last && (
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

export default function ResponderDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchIncidents = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);

      setError("");

      const response = await fetch(`${API_BASE}/api/responders/incidents`);

      if (!response.ok) {
        throw new Error("Unable to load responder queue.");
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

  const sortedIncidents = useMemo(() => {
    const severityRank = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...incidents].sort((a, b) => {
      const priorityDifference =
        (b.priority_score ?? 0) - (a.priority_score ?? 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return (
        (severityRank[b.severity?.toLowerCase()] ?? 0) -
        (severityRank[a.severity?.toLowerCase()] ?? 0)
      );
    });
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (filter === "critical") {
      return sortedIncidents.filter(
        (incident) => incident.severity?.toLowerCase() === "critical"
      );
    }

    if (filter === "high") {
      return sortedIncidents.filter(
        (incident) => incident.severity?.toLowerCase() === "high"
      );
    }

    if (filter === "medium") {
      return sortedIncidents.filter(
        (incident) => incident.severity?.toLowerCase() === "medium"
      );
    }

    if (filter === "low") {
      return sortedIncidents.filter(
        (incident) => incident.severity?.toLowerCase() === "low"
      );
    }

    return sortedIncidents;
  }, [filter, sortedIncidents]);

  const stats = useMemo(() => {
    return {
      active: incidents.length,
      critical: incidents.filter(
        (incident) => incident.severity?.toLowerCase() === "critical"
      ).length,
      high: incidents.filter(
        (incident) => incident.severity?.toLowerCase() === "high"
      ).length,
      assigned: incidents.filter(
        (incident) => incident.status === "assigned"
      ).length,
      enRoute: incidents.filter(
        (incident) => incident.status === "en_route"
      ).length,
      assisting: incidents.filter(
        (incident) => incident.status === "assisting"
      ).length,
    };
  }, [incidents]);

  const acceptIncident = async (incidentId) => {
    try {
      setActionId(incidentId);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/responders/incidents/${incidentId}/accept`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Unable to accept emergency."
        );
      }

      setIncidents((current) =>
        current.map((incident) =>
          incident.id === incidentId ? data : incident
        )
      );
    } catch (err) {
      setError(err.message || "Unable to accept emergency.");
    } finally {
      setActionId(null);
    }
  };

  const updateStatus = async (incidentId, status) => {
    try {
      setActionId(incidentId);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/responders/incidents/${incidentId}/status?status=${status}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Unable to update responder status."
        );
      }

      setIncidents((current) =>
        current.map((incident) =>
          incident.id === incidentId ? data : incident
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update responder status.");
    } finally {
      setActionId(null);
    }
  };

  const getNextAction = (status) => {
    if (status === "assigned") {
      return { label: "Start En Route", value: "en_route" };
    }

    if (status === "en_route") {
      return { label: "Mark Arrived", value: "arrived" };
    }

    if (status === "arrived") {
      return { label: "Start Assistance", value: "assisting" };
    }

    if (status === "assisting") {
      return { label: "Complete Emergency", value: "completed" };
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Truck size={17} />
                SAHAY Responder Command
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Emergency Response Queue
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Prioritized emergency dispatch, responder assignment and live
                response progression.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Responder Online
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
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
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
              <p className="font-semibold">Responder system alert</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            icon={Siren}
            label="Active"
            value={stats.active}
            description="Emergency queue"
          />

          <StatCard
            icon={ShieldAlert}
            label="Critical"
            value={stats.critical}
            description="Immediate dispatch"
          />

          <StatCard
            icon={AlertCircle}
            label="High"
            value={stats.high}
            description="High priority"
          />

          <StatCard
            icon={UserRound}
            label="Assigned"
            value={stats.assigned}
            description="Responder assigned"
          />

          <StatCard
            icon={Navigation}
            label="En Route"
            value={stats.enRoute}
            description="Moving to scene"
          />

          <StatCard
            icon={Activity}
            label="Assisting"
            value={stats.assisting}
            description="Response in progress"
          />
        </div>

        {/* Queue controls */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-slate-900">Dispatch Queue</p>
            <p className="text-xs text-slate-500">
              Highest-priority emergencies appear first
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["critical", "Critical"],
              ["high", "High"],
              ["medium", "Medium"],
              ["low", "Low"],
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
                Loading response queue...
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Connecting to SAHAY dispatch services.
              </p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Truck className="mx-auto text-slate-400" size={40} />
              <p className="mt-4 font-semibold text-slate-800">
                No matching emergencies
              </p>
              <p className="mt-1 text-sm text-slate-500">
                New emergency requests will appear automatically.
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const busy = actionId === incident.id;
              const nextAction = getNextAction(incident.status);

              return (
                <div
                  key={incident.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="p-5 sm:p-6">
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

                            {incident.status && (
                              <StatusBadge status={incident.status} />
                            )}
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

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                          Hospital
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {incident.hospital_name || "Coordination pending"}
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
                          Emergency Details
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {incident.description}
                        </p>
                      </div>
                    )}

                    {incident.responder_name && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                        <UserRound size={17} />
                        Assigned responder:{" "}
                        <strong>{incident.responder_name}</strong>
                      </div>
                    )}

                    {incident.status && (
                      <Progress status={incident.status} />
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 size={17} />
                      <span>
                        Status:{" "}
                        <strong className="text-slate-800">
                          {formatStatus(incident.status)}
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!incident.responder_name && incident.status !== "completed" && (
                        <button
                          onClick={() => acceptIncident(incident.id)}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Accept Emergency
                        </button>
                      )}

                      {incident.responder_name && nextAction && (
                        <button
                          onClick={() =>
                            updateStatus(incident.id, nextAction.value)
                          }
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : nextAction.value === "en_route" ? (
                            <Navigation size={16} />
                          ) : nextAction.value === "arrived" ? (
                            <MapPin size={16} />
                          ) : nextAction.value === "assisting" ? (
                            <Activity size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}

                          {nextAction.label}
                        </button>
                      )}

                      {incident.status === "completed" && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 size={17} />
                          Emergency Completed
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
            <Truck size={15} />
            SAHAY Emergency Response Network
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



