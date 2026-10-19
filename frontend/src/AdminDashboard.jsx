import { useState } from "react";
import { ShieldCheck, UserPlus, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "./lib/api";

const roles = ["citizen", "responder", "hospital", "authority"];

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "responder",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }

  async function createUser(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      await apiFetch("/api/auth/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setMessage("Account successfully created.");
      setForm({ name: "", email: "", password: "", role: "responder" });
    } catch (err) {
      setError(err?.message || "Account create nahi ho paya.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-emerald-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center gap-4 rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <ShieldCheck size={30} />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-600">SAHAY · SYSTEM CONTROL</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage authorized accounts for the emergency response network.
            </p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            Admin access
          </span>
        </header>

        <section className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-pink-100 p-3 text-pink-700">
                <UserPlus size={23} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Create an account</h2>
                <p className="text-sm text-slate-500">Assign the correct portal role.</p>
              </div>
            </div>

            <form onSubmit={createUser} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input className={field} name="name" value={form.name}
                  onChange={update} placeholder="Enter full name" required />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Email address</span>
                <input className={field} name="email" type="email" value={form.email}
                  onChange={update} placeholder="name@example.com" required />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Temporary password</span>
                <input className={field} name="password" type="password"
                  value={form.password} onChange={update}
                  placeholder="Create a strong password" minLength={8} required />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Account role</span>
                <select className={field} name="role" value={form.role} onChange={update}>
                  {roles.map((role) => (
                    <option value={role} key={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              {message && (
                <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={18} /> {message}
                </p>
              )}
              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                  <AlertCircle size={18} className="shrink-0" /> {error}
                </p>
              )}

              <button disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60">
                <UserPlus size={18} />
                {busy ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          <div className="space-y-5">
            <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Role management</h2>
                  <p className="text-sm text-slate-500">Available account types</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Citizen", "Requests emergency assistance", "bg-pink-50"],
                  ["Responder", "Handles emergency assignments", "bg-purple-50"],
                  ["Hospital", "Coordinates patient readiness", "bg-emerald-50"],
                  ["Authority", "Monitors emergency operations", "bg-amber-50"],
                ].map(([name, description, color]) => (
                  <div key={name} className={`${color} rounded-2xl border border-white p-4`}>
                    <p className="font-bold text-slate-800">{name}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-800">Security reminder</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Account creation is restricted by the backend to authenticated Admin users.
                Never share temporary passwords. User listing, editing and deletion are not
                included because their backend endpoints have not been confirmed.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
