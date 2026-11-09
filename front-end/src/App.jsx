import { useState } from "react";
import { login, register } from "./services/api";
import ChatPage from "./pages/ChatPage";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [form, setForm] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function changePage(nextPage) {
    setPage(nextPage);
    setError("");
    setShowPassword(false);

    setForm({
      name: "",
      surname: "",
      username: "",
      password: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.username.trim() ||
      !form.password ||
      (page === "register" &&
        (!form.name.trim() || !form.surname.trim()))
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (page === "login") {
        const result = await login(
          form.username.trim(),
          form.password
        );

        const accessToken =
          result.accessToken ||
          result.token ||
          result.data?.accessToken ||
          result.data?.token;

        if (!accessToken) {
          throw new Error(
            "Login response did not contain a token."
          );
        }

        localStorage.setItem("token", accessToken);
        setToken(accessToken);
      } else {
        await register(
          form.username.trim(),
          form.password,
          form.name.trim(),
          form.surname.trim()
        );

        setForm({
          name: "",
          surname: "",
          username: "",
          password: "",
        });

        setPage("login");
        setShowPassword(false);
        setError("");
      }
    } catch (err) {
      setError(
        err.message || "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <ChatPage
        token={token}
        onLogout={() => {
          localStorage.removeItem("token");
          setToken(null);
        }}
      />
    );
  }

  return (
    <main className="app">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <section
        key={page}
        className={`auth-card ${
          page === "register" ? "register-card" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>
            chat<span className="brand-accent">app</span>
          </span>
        </div>

        <div className="heading">
          <p className="eyebrow">
            {page === "login"
              ? "WELCOME BACK"
              : "JOIN OUR COMMUNITY"}
          </p>

          <h1>
            {page === "login"
              ? "Welcome back."
              : "Create account."}
          </h1>

          <p className="subtitle">
            {page === "login"
              ? "Sign in to continue your conversations."
              : "Your next conversation starts here."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {page === "register" && (
            <div className="name-row">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className={error ? "input-error" : ""}
                />
              </div>

              <div className="field">
                <label htmlFor="surname">Surname</label>
                <input
                  id="surname"
                  name="surname"
                  placeholder="Your surname"
                  value={form.surname}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className={error ? "input-error" : ""}
                />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              className={error ? "input-error" : ""}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>

            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete={
                  page === "login"
                    ? "current-password"
                    : "new-password"
                }
                className={error ? "input-error" : ""}
                style={{ paddingRight: "48px" }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 9 7 9 7a16 16 0 0 1-3.1 3.8" />
                    <path d="M6.2 6.2C3.5 8 3 12 3 12s4 7 9 7a9.5 9.5 0 0 0 3-.5" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : page === "login"
                ? "Login"
                : "Create account"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="switch-page">
          <span>
            {page === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={() =>
              changePage(
                page === "login" ? "register" : "login"
              )
            }
          >
            {page === "login" ? "Register now" : "Login"}
          </button>
        </div>

        <p className="footer-note">
          PRIVATE CONVERSATIONS. REAL CONNECTIONS.
        </p>
      </section>
    </main>
  );
}

export default App;
