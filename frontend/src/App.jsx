import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Hospital,
  LocateFixed,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
  UserRound,
} from "lucide-react";

import ResponderDashboard from "./components/ResponderDashboard";
import HospitalDashboard from "./HospitalDashboard";
import AuthorityDashboard from "./AuthorityDashboard";

const API_BASE = "";

const emergencyTypes = [
  "Medical",
  "Accident",
  "Fire",
  "Crime",
  "Other",
];

const severityStyles = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const timelineIcons = {
  active: Siren,
  assigned: Ambulance,
  en_route: Ambulance,
  arrived: MapPin,
  assisting: Activity,
  completed: CheckCircle2,
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

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve({
          latitude: null,
          longitude: null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px] font-black uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="break-words font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EmergencyTimeline({ timelineData }) {
  if (!timelineData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <RefreshCw
            size={20}
            className="animate-spin text-slate-500"
          />

          <div>
            <h3 className="font-black text-slate-900">
              Emergency Response Timeline
            </h3>

            <p className="text-xs text-slate-500">
              Loading response progress...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Clock3 size={20} />
          </div>

          <div>
            <h3 className="font-black text-slate-900">
              Emergency Response Timeline
            </h3>

            <p className="text-xs text-slate-500">
              Incident #{timelineData.incident_id}
            </p>
          </div>
        </div>

        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black uppercase text-slate-600">
          {timelineData.current_status?.replaceAll("_", " ")}
        </span>
      </div>

      <div className="space-y-1">
        {timelineData.timeline?.map((item, index) => {
          const Icon =
            timelineIcons[item.status] || CheckCircle2;

          const isLast =
            index === timelineData.timeline.length - 1;

          return (
            <div
              key={item.status}
              className="relative flex gap-4"
            >
              {!isLast && (
                <div
                  className={`absolute left-5 top-11 h-8 w-0.5 ${
                    item.completed
                      ? "bg-green-400"
                      : "bg-slate-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                  item.current
                    ? "border-red-500 bg-red-50 text-red-600"
                    : item.completed
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <Icon size={17} />
              </div>

              <div className="pb-5 pt-1">
                <p
                  className={`text-sm font-black ${
                    item.current
                      ? "text-red-700"
                      : item.completed
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {item.title}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {item.current
                    ? "Current response stage"
                    : item.completed
                    ? "Completed"
                    : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoleSwitcher({ role, setRole }) {
  const roles = [
    ["citizen", "Citizen"],
    ["responder", "Responder"],
    ["hospital", "Hospital"],
    ["authority", "Authority"],
  ];

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2">
        <div className="mr-2 hidden items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 md:flex">
          <UserRound size={14} />
          Demo Role
        </div>

        {roles.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setRole(value)}
            className={`rounded-lg px-3 py-2 text-xs font-black transition ${
              role === value
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CitizenDashboard({ onRoleChange }) {
  const [emergencyType, setEmergencyType] =
    useState("Medical");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const [incidents, setIncidents] =
    useState([]);

  const [activeIncident, setActiveIncident] =
    useState(null);

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [timelineData, setTimelineData] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");

  const [locationLoading, setLocationLoading] =
    useState(false);

  async function fetchTimeline(incidentId) {
    if (!incidentId) {
      setTimelineData(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/incidents/${incidentId}/timeline`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load incident timeline."
        );
      }

      const data = await response.json();

      setTimelineData(data);
    } catch (error) {
      console.error(
        "Timeline error:",
        error
      );
    }
  }

  async function fetchIncidents() {
    try {
      const response = await fetch(
        `${API_BASE}/api/incidents/`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load incidents."
        );
      }

      const data = await response.json();

      setIncidents(data);

      const active = data.find(
        (incident) =>
          incident.status !== "completed"
      );

      if (active) {
        setActiveIncident(active);
        setSelectedIncident(active);
        fetchTimeline(active.id);
      } else {
        setActiveIncident(null);
      }
    } catch (error) {
      console.error(
        "Incident fetch error:",
        error
      );
    }
  }

  async function captureLocation() {
    setLocationLoading(true);

    const currentLocation =
      await getCurrentLocation();

    setLocation(currentLocation);

    setLocationLoading(false);

    return currentLocation;
  }

  async function handleSOS(event) {
    event.preventDefault();

    if (!description.trim()) {
      setMessage(
        "Please describe the emergency before sending SOS."
      );

      setMessageType("error");

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let currentLocation = location;

      if (
        currentLocation.latitude === null ||
        currentLocation.longitude === null
      ) {
        currentLocation =
          await captureLocation();
      }

      const response = await fetch(
        `${API_BASE}/api/incidents/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            citizen_name: "Muskan",

            emergency_type:
              emergencyType.toLowerCase(),

            description:
              description.trim(),

            latitude:
              currentLocation.latitude,

            longitude:
              currentLocation.longitude,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create emergency."
        );
      }

      setActiveIncident(data);
      setSelectedIncident(data);

      setMessage(
        `SOS #${data.id} created successfully. AI classified it as ${(
          data.severity || "medium"
        ).toUpperCase()} priority.`
      );

      setMessageType("success");

      setDescription("");

      await fetchTimeline(data.id);
      await fetchIncidents();
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          "Unable to create emergency."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();

    const interval = setInterval(() => {
      fetchIncidents();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedIncident?.id) {
      return;
    }

    fetchTimeline(selectedIncident.id);

    const interval = setInterval(() => {
      fetchTimeline(selectedIncident.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedIncident?.id]);

  const recentIncidents = useMemo(() => {
    return incidents.slice(0, 6);
  }, [incidents]);

  return (
    <div className="min-h-screen bg-slate-50">
      <RoleSwitcher
        role="citizen"
        setRole={onRoleChange}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
              <Siren size={25} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                SAHAY RESPONSE NETWORK
              </p>

              <h1 className="text-2xl font-black text-slate-900">
                Emergency Assistance
              </h1>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Smart emergency response powered by AI
            and coordinated response teams.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        {message && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm font-bold ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={20}
                  className="text-red-600"
                />

                <h2 className="text-xl font-black text-slate-900">
                  Request Emergency Help
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Describe what is happening. SAHAY
                Intelligence will analyze the emergency.
              </p>
            </div>

            <form
              onSubmit={handleSOS}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Emergency Type
                </label>

                <select
                  value={emergencyType}
                  onChange={(event) =>
                    setEmergencyType(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-red-400"
                >
                  {emergencyTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Emergency Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Example: A person is unconscious after a road accident and has severe bleeding."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-red-400"
                />
              </div>

              <button
                type="button"
                onClick={captureLocation}
                disabled={locationLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {locationLoading ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <LocateFixed size={17} />
                )}

                {location.latitude !== null
                  ? "Location Captured"
                  : "Capture My Location"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Siren size={20} />
                )}

                {loading
                  ? "Analyzing Emergency..."
                  : "SEND SOS"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <MapPin size={21} />
              </div>

              <div>
                <h2 className="font-black">
                  Emergency Location
                </h2>

                <p className="text-xs text-slate-400">
                  GPS coordinates sent with SOS
                </p>
              </div>
            </div>

            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
              {location.latitude !== null &&
              location.longitude !== null ? (
                <div className="text-center">
                  <MapPin
                    size={42}
                    className="mx-auto mb-3 text-red-400"
                  />

                  <p className="text-sm font-black">
                    Location Captured
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {Number(
                      location.latitude
                    ).toFixed(5)}
                    ,{" "}
                    {Number(
                      location.longitude
                    ).toFixed(5)}
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <LocateFixed
                    size={42}
                    className="mx-auto mb-3 opacity-50"
                  />

                  <p className="text-sm font-bold">
                    Location not captured yet
                  </p>

                  <p className="mt-1 text-xs">
                    Capture location before sending SOS.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {activeIncident && (
          <section className="mt-6">
            <div className="mb-4 flex items-center gap-2">
              <Activity
                size={20}
                className="text-red-600"
              />

              <h2 className="text-xl font-black text-slate-900">
                Active Emergency
              </h2>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-black text-white">
                      INCIDENT #{activeIncident.id}
                    </span>

                    <span
                      className={`rounded-lg border px-3 py-1 text-xs font-black uppercase ${
                        severityStyles[
                          activeIncident.severity?.toLowerCase()
                        ] ||
                        severityStyles.medium
                      }`}
                    >
                      {activeIncident.severity}
                    </span>
                  </div>

                  <p className="font-black text-slate-900">
                    {activeIncident.emergency_type}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {activeIncident.description}
                  </p>
                </div>

                <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-1 font-black uppercase text-red-600">
                    {activeIncident.status?.replaceAll(
                      "_",
                      " "
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <InfoCard
                  icon={<Activity size={16} />}
                  label="AI Priority"
                  value={`${activeIncident.priority_score ?? "--"}/100`}
                />

                <InfoCard
                  icon={<ShieldAlert size={16} />}
                  label="AI Confidence"
                  value={`${activeIncident.ai_confidence ?? "--"}%`}
                />

                <InfoCard
                  icon={<Ambulance size={16} />}
                  label="Responder"
                  value={
                    activeIncident.responder_name ||
                    "Searching"
                  }
                />

                <InfoCard
                  icon={<Hospital size={16} />}
                  label="Hospital"
                  value={
                    activeIncident.hospital_name ||
                    "Pending"
                  }
                />
              </div>

              {activeIncident.ai_recommendation && (
                <div className="mt-4 rounded-xl border border-red-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-red-500">
                    SAHAY AI Recommendation
                  </p>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {activeIncident.ai_recommendation}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5">
              <EmergencyTimeline
                timelineData={timelineData}
              />
            </div>
          </section>
        )}

        {!activeIncident &&
          selectedIncident &&
          selectedIncident.status === "completed" && (
            <section className="mt-6">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2
                  size={20}
                  className="text-green-600"
                />

                <h2 className="text-xl font-black text-slate-900">
                  Latest Emergency
                </h2>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-black text-white">
                        INCIDENT #{selectedIncident.id}
                      </span>

                      <span className="rounded-lg border border-green-200 bg-green-100 px-3 py-1 text-xs font-black uppercase text-green-700">
                        COMPLETED
                      </span>
                    </div>

                    <p className="font-black text-slate-900">
                      {selectedIncident.emergency_type}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {selectedIncident.description ||
                        "Emergency assistance requested."}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Final Status
                    </p>

                    <p className="mt-1 font-black uppercase text-green-600">
                      COMPLETED
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <InfoCard
                    icon={<Activity size={16} />}
                    label="AI Priority"
                    value={`${selectedIncident.priority_score ?? "--"}/100`}
                  />

                  <InfoCard
                    icon={<ShieldAlert size={16} />}
                    label="AI Confidence"
                    value={`${selectedIncident.ai_confidence ?? "--"}%`}
                  />

                  <InfoCard
                    icon={<Ambulance size={16} />}
                    label="Responder"
                    value={
                      selectedIncident.responder_name ||
                      "Not assigned"
                    }
                  />

                  <InfoCard
                    icon={<Hospital size={16} />}
                    label="Hospital"
                    value={
                      selectedIncident.hospital_name ||
                      "Not assigned"
                    }
                  />
                </div>

                <div className="mt-5">
                  <EmergencyTimeline
                    timelineData={timelineData}
                  />
                </div>
              </div>
            </section>
          )}

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Recent Incidents
              </h2>

              <p className="text-sm text-slate-500">
                Latest emergency activity
              </p>
            </div>

            <button
              onClick={fetchIncidents}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {recentIncidents.map((incident) => {
              const isCompleted =
                incident.status === "completed";

              return (
                <button
                  key={incident.id}
                  onClick={() => {
                    setSelectedIncident(
                      incident
                    );

                    if (isCompleted) {
                      setActiveIncident(null);
                    } else {
                      setActiveIncident(
                        incident
                      );
                    }

                    fetchTimeline(
                      incident.id
                    );
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-white">
                        #{incident.id}
                      </span>

                      <span
                        className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase ${
                          severityStyles[
                            incident.severity?.toLowerCase()
                          ] ||
                          severityStyles.medium
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    <ChevronRight
                      size={17}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="mt-3 font-black text-slate-900">
                    {incident.emergency_type}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {incident.description ||
                      "Emergency assistance requested."}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>
                      {incident.status?.replaceAll(
                        "_",
                        " "
                      )}
                    </span>

                    <span>
                      {formatTime(
                        incident.created_at
                      )}
                    </span>
                  </div>
                </button>
              );
            })}

            {recentIncidents.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center md:col-span-2">
                <CheckCircle2
                  size={32}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="font-bold text-slate-600">
                  No incidents yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 text-xs font-semibold text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

          SAHAY Emergency Response Network · Live
          monitoring
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState("citizen");

  if (role === "responder") {
    return (
      <div>
        <RoleSwitcher
          role={role}
          setRole={setRole}
        />

        <ResponderDashboard />
      </div>
    );
  }

  if (role === "hospital") {
    return (
      <div>
        <RoleSwitcher
          role={role}
          setRole={setRole}
        />

        <HospitalDashboard />
      </div>
    );
  }

  if (role === "authority") {
    return (
      <div>
        <RoleSwitcher
          role={role}
          setRole={setRole}
        />

        <AuthorityDashboard />
      </div>
    );
  }

  return (
    <CitizenDashboard
      onRoleChange={setRole}
    />
  );
}

