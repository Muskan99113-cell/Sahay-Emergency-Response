import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bed,
  CheckCircle2,
  Clock3,
  Hospital,
  MapPin,
  RefreshCw,
  ShieldAlert,
  UserRound,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

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

export default function HospitalDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function fetchIncidents(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE}/api/hospitals/incidents`
      );

      if (!response.ok) {
        throw new Error("Unable to load hospital emergencies.");
      }

      const data = await response.json();

      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to SAHAY backend. Make sure FastAPI is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents(true);

    const interval = setInterval(() => {
      fetchIncidents(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function acceptIncident(incidentId) {
    try {
      setProcessingId(incidentId);

      const response = await fetch(
        `${API_BASE}/api/hospitals/incidents/${incidentId}/accept`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to accept hospital emergency."
        );
      }

      setMessage(
        `Emergency #${incidentId} accepted. Hospital is preparing.`
      );
      setMessageType("success");

      await fetchIncidents(false);
    } catch (error) {
      console.error(error);

      setMessage(error.message);
      setMessageType("error");
    } finally {
      setProcessingId(null);
    }
  }

  async function updateHospitalStatus(
    incidentId,
    status
  ) {
    try {
      setProcessingId(incidentId);

      const response = await fetch(
        `${API_BASE}/api/hospitals/incidents/${incidentId}/status?status=${status}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
            data.detail ||
            "Unable to update hospital status."
        );
      }

      const labels = {
        preparing: "Hospital is preparing for arrival.",
        ready: "Hospital is ready for the patient.",
        unavailable: "Hospital marked unavailable.",
      };

      setMessage(
        `Emergency #${incidentId}: ${
          labels[status] || "Hospital status updated."
        }`
      );

      setMessageType("success");

      await fetchIncidents(false);
    } catch (error) {
      console.error(error);

      setMessage(error.message);
      setMessageType("error");
    } finally {
      setProcessingId(null);
    }
  }

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      const priorityDifference =
        (b.priority_score || 0) -
        (a.priority_score || 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(b.created_at || 0) -
        new Date(a.created_at || 0);
    });
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (filter === "all") {
      return sortedIncidents;
    }

    if (filter === "hospital_required") {
      return sortedIncidents.filter(
        (incident) => incident.hospital_required
      );
    }

    return sortedIncidents.filter(
      (incident) =>
        incident.severity?.toLowerCase() === filter
    );
  }, [sortedIncidents, filter]);

  const stats = {
    incoming: incidents.filter(
      (item) => !item.hospital_name
    ).length,

    critical: incidents.filter(
      (item) =>
        item.severity?.toLowerCase() === "critical"
    ).length,

    hospitalRequired: incidents.filter(
      (item) => Boolean(item.hospital_required)
    ).length,

    accepted: incidents.filter(
      (item) => Boolean(item.hospital_name)
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Hospital size={23} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  SAHAY HEALTH NETWORK
                </p>

                <h1 className="text-2xl font-black text-slate-900">
                  Hospital Command
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              AI-powered emergency intake and hospital coordination
            </p>
          </div>

          <button
            onClick={() => fetchIncidents(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh Queue
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {messageType === "error" ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="ml-auto text-xs font-bold opacity-60"
            >
              CLOSE
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Incoming
              </p>

              <Activity
                size={20}
                className="text-blue-600"
              />
            </div>

            <p className="text-3xl font-black text-slate-900">
              {stats.incoming}
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
              {stats.critical}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-orange-500">
                Hospital Required
              </p>

              <AlertTriangle
                size={20}
                className="text-orange-600"
              />
            </div>

            <p className="text-3xl font-black text-orange-700">
              {stats.hospitalRequired}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-green-600">
                Accepted
              </p>

              <CheckCircle2
                size={20}
                className="text-green-600"
              />
            </div>

            <p className="text-3xl font-black text-green-700">
              {stats.accepted}
            </p>
          </div>
        </div>

        {/* QUEUE HEADER */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Hospital
                  size={20}
                  className="text-blue-600"
                />

                <h2 className="text-lg font-black text-slate-900">
                  Emergency Intake Queue
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                AI identifies which emergencies require hospital coordination.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["hospital_required", "Hospital Required"],
                ["critical", "Critical"],
                ["high", "High"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    filter === value
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin text-blue-600"
            />

            <p className="font-bold text-slate-700">
              Loading hospital queue...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredIncidents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2
              size={42}
              className="mx-auto mb-4 text-green-500"
            />

            <h3 className="text-lg font-black text-slate-900">
              No emergencies in this queue
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Hospital-required emergencies will appear here.
            </p>
          </div>
        )}

        {/* INCIDENTS */}
        <div className="space-y-4">

          {filteredIncidents.map((incident) => {
            const severity =
              incident.severity?.toLowerCase() || "medium";

            const isAccepted =
              Boolean(incident.hospital_name);

            const isProcessing =
              processingId === incident.id;

            return (
              <div
                key={incident.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >

                {/* TOP */}
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white">
                      #{incident.id}
                    </span>

                    <span
                      className={`rounded-lg border px-3 py-1.5 text-xs font-black uppercase ${
                        severityStyles[severity] ||
                        severityStyles.medium
                      }`}
                    >
                      {severity}
                    </span>

                    {incident.hospital_required && (
                      <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white">
                        HOSPITAL REQUIRED
                      </span>
                    )}

                    {isAccepted && (
                      <span className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-black text-white">
                        ACCEPTED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock3 size={15} />
                    {formatTime(incident.created_at)}
                  </div>
                </div>

                <div className="p-5">

                  {/* AI METRICS */}
                  <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                    <div className="rounded-xl bg-red-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-red-500">
                        AI Priority
                      </p>

                      <p className="mt-1 text-2xl font-black text-red-700">
                        {incident.priority_score ?? "--"}
                        <span className="text-sm text-red-400">
                          /100
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        AI Confidence
                      </p>

                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {incident.ai_confidence ?? "--"}
                        <span className="text-sm text-slate-400">
                          %
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Responder
                      </p>

                      <p className="mt-2 text-sm font-black text-slate-900">
                        {incident.responder_name ||
                          "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Hospital Status
                      </p>

                      <p className="mt-2 text-sm font-black uppercase text-slate-900">
                        {incident.hospital_status ||
                          "Awaiting"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

                    {/* LEFT */}
                    <div>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                          <UserRound
                            size={17}
                            className="text-slate-400"
                          />

                          <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Patient / Citizen
                          </span>
                        </div>

                        <p className="font-black text-slate-900">
                          {incident.citizen_name}
                        </p>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertTriangle
                            size={17}
                            className="text-slate-400"
                          />

                          <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Emergency
                          </span>
                        </div>

                        <p className="leading-6 text-slate-700">
                          {incident.description ||
                            "Emergency assistance requested."}
                        </p>
                      </div>

                      {incident.recommended_hospital_type && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                          <p className="mb-1 text-xs font-black uppercase tracking-wide text-blue-600">
                            AI Recommended Facility
                          </p>

                          <p className="text-sm font-black text-blue-950">
                            {
                              incident.recommended_hospital_type
                            }
                          </p>
                        </div>
                      )}

                      {incident.ai_recommendation && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-1 text-xs font-black uppercase tracking-wide text-slate-400">
                            AI Recommendation
                          </p>

                          <p className="text-sm font-semibold leading-6 text-slate-700">
                            {incident.ai_recommendation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-3">

                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <MapPin
                            size={17}
                            className="text-red-500"
                          />

                          <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Emergency Location
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-800">
                          {incident.latitude &&
                          incident.longitude
                            ? `${Number(
                                incident.latitude
                              ).toFixed(4)}, ${Number(
                                incident.longitude
                              ).toFixed(4)}`
                            : "Location unavailable"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Bed
                            size={17}
                            className="text-blue-600"
                          />

                          <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Facility
                          </span>
                        </div>

                        <p className="text-sm font-black text-slate-900">
                          {incident.hospital_name ||
                            "SAHAY Emergency Hospital"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">

                    {!isAccepted && (
                      <button
                        disabled={
                          isProcessing ||
                          !incident.hospital_required
                        }
                        onClick={() =>
                          acceptIncident(incident.id)
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Hospital size={18} />

                        {isProcessing
                          ? "Accepting..."
                          : "Accept & Prepare"}
                      </button>
                    )}

                    {isAccepted &&
                      incident.hospital_status ===
                        "accepted" && (
                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            updateHospitalStatus(
                              incident.id,
                              "preparing"
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Activity size={18} />
                          Start Preparing
                        </button>
                      )}

                    {isAccepted &&
                      incident.hospital_status ===
                        "preparing" && (
                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            updateHospitalStatus(
                              incident.id,
                              "ready"
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle2 size={18} />
                          Mark Ready
                        </button>
                      )}

                    {isAccepted &&
                      incident.hospital_status ===
                        "ready" && (
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-black text-green-700">
                          <CheckCircle2 size={18} />
                          Hospital Ready for Arrival
                        </div>
                      )}

                    {isAccepted && (
                      <div className="flex flex-1 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-blue-700">
                        <Hospital
                          size={18}
                          className="mr-2"
                        />
                        {incident.hospital_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live hospital queue · updates every 5 seconds
        </div>
      </div>
    </div>
  );
}