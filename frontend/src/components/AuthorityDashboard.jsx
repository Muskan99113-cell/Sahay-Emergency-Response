import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  CheckCircle2,
  Clock3,
  Hospital,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";

const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "";

const severityStyles = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

function formatTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuthorityDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchDashboard(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE}/api/authority/dashboard`
      );

      if (!response.ok) {
        throw new Error("Unable to load authority dashboard.");
      }

      const data = await response.json();

      setDashboard(data);
      setMessage("");
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to SAHAY backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const incidents = dashboard?.incidents || [];
  const summary = dashboard?.summary || {};

  const filteredIncidents = useMemo(() => {
    if (filter === "all") {
      return incidents;
    }

    if (filter === "unassigned") {
      return incidents.filter(
        (incident) => !incident.responder_name
      );
    }

    if (filter === "hospital") {
      return incidents.filter(
        (incident) => incident.hospital_name
      );
    }

    return incidents.filter(
      (incident) =>
        incident.severity?.toLowerCase() === filter
    );
  }, [incidents, filter]);

  const averagePriority = incidents.length
    ? Math.round(
        incidents.reduce(
          (sum, incident) =>
            sum + (incident.priority_score || 0),
          0
        ) / incidents.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <ShieldAlert size={23} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  SAHAY COMMAND CENTER
                </p>

                <h1 className="text-2xl font-black text-slate-900">
                  Authority Dashboard
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Live emergency coordination and response monitoring
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh Command Center
          </button>
        </div>

        {/* ERROR */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle size={18} />
            {message}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin text-slate-900"
            />

            <p className="font-bold text-slate-700">
              Loading command center...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* SUMMARY */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Active Incidents
                  </p>

                  <Siren
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <p className="text-3xl font-black text-slate-900">
                  {summary.active_incidents || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-red-500">
                    Critical
                  </p>

                  <ShieldAlert
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <p className="text-3xl font-black text-red-700">
                  {summary.critical_incidents || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-500">
                    High Priority
                  </p>

                  <AlertTriangle
                    size={20}
                    className="text-orange-600"
                  />
                </div>

                <p className="text-3xl font-black text-orange-700">
                  {summary.high_incidents || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-blue-500">
                    Responders Assigned
                  </p>

                  <Ambulance
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <p className="text-3xl font-black text-blue-700">
                  {summary.assigned_responders || 0}
                </p>
              </div>
            </div>

            {/* SECONDARY STATS */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Hospital size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Hospitals Coordinated
                    </p>

                    <p className="text-2xl font-black text-slate-900">
                      {summary.hospital_assigned || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <BarChart3 size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Average AI Priority
                    </p>

                    <p className="text-2xl font-black text-slate-900">
                      {averagePriority}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Activity size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      System Status
                    </p>

                    <p className="text-2xl font-black text-green-600">
                      OPERATIONAL
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE OPERATIONS */}
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <Activity
                      size={20}
                      className="text-red-600"
                    />

                    <h2 className="text-lg font-black text-slate-900">
                      Live Operations
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Monitor every active emergency and resource assignment.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    ["all", "All"],
                    ["critical", "Critical"],
                    ["high", "High"],
                    ["unassigned", "Unassigned"],
                    ["hospital", "Hospital"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setFilter(value)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        filter === value
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MAP / OPERATIONS AREA */}
            <div className="mb-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">

              {/* MAP PLACEHOLDER */}
              <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">

                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="relative z-10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Live Incident Map
                      </p>

                      <h3 className="mt-1 text-xl font-black text-white">
                        Emergency Operations View
                      </h3>
                    </div>

                    <span className="flex items-center gap-2 rounded-lg bg-green-500/20 px-3 py-2 text-xs font-bold text-green-300">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                      LIVE
                    </span>
                  </div>

                  <div className="mt-8 flex h-[270px] items-center justify-center">
                    {incidents.length > 0 ? (
                      <div className="grid max-w-md grid-cols-2 gap-4">
                        {incidents.slice(0, 6).map((incident) => (
                          <div
                            key={incident.id}
                            className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <MapPin
                                size={18}
                                className="text-red-400"
                              />

                              <span className="text-xs font-black text-white">
                                #{incident.id}
                              </span>
                            </div>

                            <p className="text-xs font-bold uppercase text-slate-300">
                              {incident.severity}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {incident.latitude &&
                              incident.longitude
                                ? `${Number(
                                    incident.latitude
                                  ).toFixed(3)}, ${Number(
                                    incident.longitude
                                  ).toFixed(3)}`
                                : "No GPS"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <MapPin
                          size={40}
                          className="mx-auto mb-3 opacity-50"
                        />

                        <p className="font-bold">
                          No active incidents
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* QUICK STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-5">
                  <h3 className="text-lg font-black text-slate-900">
                    Response Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Current resource coordination.
                  </p>
                </div>

                <div className="space-y-3">

                  <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldAlert
                        size={19}
                        className="text-red-600"
                      />

                      <span className="text-sm font-bold text-red-900">
                        Critical incidents
                      </span>
                    </div>

                    <span className="text-lg font-black text-red-700">
                      {summary.critical_incidents || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={19}
                        className="text-orange-600"
                      />

                      <span className="text-sm font-bold text-orange-900">
                        High priority
                      </span>
                    </div>

                    <span className="text-lg font-black text-orange-700">
                      {summary.high_incidents || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <Ambulance
                        size={19}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-bold text-blue-900">
                        Responders assigned
                      </span>
                    </div>

                    <span className="text-lg font-black text-blue-700">
                      {summary.assigned_responders || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <Hospital
                        size={19}
                        className="text-green-600"
                      />

                      <span className="text-sm font-bold text-green-900">
                        Hospitals coordinated
                      </span>
                    </div>

                    <span className="text-lg font-black text-green-700">
                      {summary.hospital_assigned || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={17}
                      className="text-slate-500"
                    />

                    <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Live Monitoring
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Command center automatically refreshes every 5 seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* INCIDENT TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="font-black text-slate-900">
                  Active Incident Registry
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredIncidents.length} incident(s) currently visible
                </p>
              </div>

              <div className="divide-y divide-slate-100">

                {filteredIncidents.length === 0 && (
                  <div className="p-10 text-center">
                    <CheckCircle2
                      size={38}
                      className="mx-auto mb-3 text-green-500"
                    />

                    <p className="font-bold text-slate-700">
                      No incidents match this filter.
                    </p>
                  </div>
                )}

                {filteredIncidents.map((incident) => {
                  const severity =
                    incident.severity?.toLowerCase() ||
                    "medium";

                  return (
                    <div
                      key={incident.id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex-1">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                              #{incident.id}
                            </span>

                            <span
                              className={`rounded-lg border px-2.5 py-1 text-xs font-black uppercase ${
                                severityStyles[severity] ||
                                severityStyles.medium
                              }`}
                            >
                              {severity}
                            </span>

                            <span className="text-xs font-bold uppercase text-slate-400">
                              {incident.emergency_type}
                            </span>
                          </div>

                          <p className="font-black text-slate-900">
                            {incident.citizen_name}
                          </p>

                          <p className="mt-1 max-w-2xl text-sm text-slate-600">
                            {incident.description ||
                              "Emergency assistance requested."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[500px]">

                          <div className="rounded-xl bg-red-50 p-3">
                            <p className="text-[9px] font-black uppercase text-red-500">
                              AI Priority
                            </p>

                            <p className="mt-1 font-black text-red-700">
                              {incident.priority_score ??
                                "--"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[9px] font-black uppercase text-slate-400">
                              Responder
                            </p>

                            <p className="mt-1 text-xs font-black text-slate-800">
                              {incident.responder_name
                                ? "Assigned"
                                : "Pending"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[9px] font-black uppercase text-slate-400">
                              Hospital
                            </p>

                            <p className="mt-1 text-xs font-black text-slate-800">
                              {incident.hospital_name
                                ? "Assigned"
                                : "Pending"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[9px] font-black uppercase text-slate-400">
                              Status
                            </p>

                            <p className="mt-1 text-xs font-black uppercase text-slate-800">
                              {incident.status?.replace(
                                "_",
                                " "
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          SAHAY Command Center · Live monitoring · 5 second refresh
        </div>
      </div>
    </div>
  );
}



