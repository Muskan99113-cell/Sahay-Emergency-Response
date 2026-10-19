
import { useState } from "react";
import {
  ShieldCheck,
  HeartPulse,
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { apiFetch } from "./lib/api";

const roles = [
  { value: "citizen", label: "Citizen", description: "Request emergency assistance" },
  { value: "responder", label: "Responder", description: "Emergency response assignments" },
  { value: "hospital", label: "Hospital", description: "Hospital resources and coordination" },
  { value: "authority", label: "Authority", description: "Incident monitoring and oversight" },
  { value: "admin", label: "Admin", description: "Authorized system administration" },
];

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");

    if (nextMode === "login") {
      setName("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch(
        `/api/auth/${isLogin ? "login" : "register"}`,
        {
          method: "POST",
          body: JSON.stringify(
            isLogin
              ? {
                  email: email.trim().toLowerCase(),
                  password,
                }
              : {
                  name: name.trim(),
                  email: email.trim().toLowerCase(),
                  password,
                }
          ),
        }
      );

      // Registration creates a Citizen account.
      // Login always verifies the actual role returned by the backend.
      if (isLogin && data.role !== selectedRole) {
        await apiFetch("/api/auth/logout", {
          method: "POST",
        }).catch(() => {});

        const actualRole =
          roles.find((role) => role.value === data.role)?.label ||
          data.role ||
          "Unknown";

        throw new Error(
          `This account belongs to the ${actualRole} portal. Please select ${actualRole} and sign in again.`
        );
      }

      onAuthenticated(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sahay-auth-page">
      <div className="sahay-auth-decoration sahay-auth-decoration-one" />
      <div className="sahay-auth-decoration sahay-auth-decoration-two" />

      <section className="sahay-auth-layout">
        {/* LEFT SIDE — EXISTING DESIGN */}
        <aside className="sahay-auth-intro">
          <div className="sahay-auth-brand">
            <div className="sahay-auth-logo">
              <HeartPulse size={27} strokeWidth={2.5} />
            </div>

            <div>
              <p className="sahay-auth-brand-name">SAHAY</p>
              <p className="sahay-auth-brand-caption">
                RESPONSE NETWORK
              </p>
            </div>
          </div>

          <div className="sahay-auth-hero">
            <span className="sahay-auth-eyebrow">
              <span className="sahay-auth-live-dot" />
              HERE WHEN IT MATTERS
            </span>

            <h1>
              Help is closer
              <br />
              <span>than you think.</span>
            </h1>

            <p>
              Connecting people, responders and hospitals
              when every second counts.
            </p>
          </div>

          <div className="sahay-auth-trust">
            <div className="sahay-auth-trust-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <strong>Care you can count on</strong>
              <p>
                A connected network for faster
                emergency response.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE — LOGIN FORM */}
        <div className="sahay-auth-form-panel">
          <div className="sahay-auth-form-heading">
            <div className="sahay-auth-mobile-logo">
              <HeartPulse size={22} />
              <strong>SAHAY</strong>
            </div>

            <span className="sahay-auth-small-label">
              {isLogin ? "WELCOME BACK" : "JOIN SAHAY"}
            </span>

            <h2>
              {isLogin ? "Welcome back!" : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Select your portal and sign in with your existing account."
                : "Create a Citizen account to access emergency assistance."}
            </p>
          </div>

          {/* LOGIN / REGISTER SWITCH */}
          <div className="sahay-auth-mode-tabs" role="tablist">
            <button
              type="button"
              className={isLogin ? "active" : ""}
              onClick={() => switchMode("login")}
              role="tab"
              aria-selected={isLogin}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => switchMode("register")}
              role="tab"
              aria-selected={!isLogin}
            >
              Register
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div role="alert" className="sahay-auth-error">
              <span>!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="sahay-auth-form">
            {/* ROLE SELECTOR — LOGIN ONLY */}
            {isLogin && (
              <div className="sahay-auth-field sahay-auth-role-field">
                <label htmlFor="sahay-role">
                  Sign in to your portal
                </label>

                <select
                  id="sahay-role"
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <p className="sahay-auth-hint">
                  {
                    roles.find(
                      (role) => role.value === selectedRole
                    )?.description
                  }
                </p>
              </div>
            )}

            {/* NAME — REGISTER ONLY */}
            {!isLogin && (
              <div className="sahay-auth-field">
                <label htmlFor="sahay-name">Full name</label>

                <div className="sahay-auth-input-wrap">
                  <UserRound size={18} />

                  <input
                    id="sahay-name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div className="sahay-auth-field">
              <label htmlFor="sahay-email">Email address</label>

              <div className="sahay-auth-input-wrap">
                <Mail size={18} />

                <input
                  id="sahay-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="sahay-auth-field">
              <label htmlFor="sahay-password">Password</label>

              <div className="sahay-auth-input-wrap">
                <LockKeyhole size={18} />

                <input
                  id="sahay-password"
                  required
                  type="password"
                  minLength={isLogin ? 1 : 8}
                  maxLength={128}
                  autoComplete={
                    isLogin ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isLogin
                      ? "Enter your password"
                      : "At least 8 characters"
                  }
                />
              </div>

              {!isLogin && (
                <p className="sahay-auth-hint">
                  Use at least 8 characters for your password.
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="sahay-auth-submit"
            >
              <span>
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Login"
                    : "Create account"}
              </span>

              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          {/* SWITCH */}
          <div className="sahay-auth-switch">
            <span>
              {isLogin
                ? "New to SAHAY?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={() =>
                switchMode(isLogin ? "register" : "login")
              }
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>

          {/* FOOTER */}
          <div className="sahay-auth-footer">
            <ShieldCheck size={15} />
            <span>
              Your session is protected by the SAHAY backend.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
