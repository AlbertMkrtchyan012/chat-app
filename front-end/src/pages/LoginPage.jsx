
import { useState } from "react";
import { login, register } from "../services/api";

function LoginPage({ onLogin }) {
  const [page, setPage] = useState("login");
  const [form, setForm] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  function changePage(nextPage) {
    setPage(nextPage);
    setError("");
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

        const token = result.token || result.data?.token;

        if (!token) {
          throw new Error("Login response did not contain a token.");
        }

        localStorage.setItem("token", token);
        onLogin(token);
      } else {
        await register(form.username.trim(), form.password);

        setPage("login");
        setForm({
          name: "",
          surname: "",
          username: form.username,
          password: "",
        });
        setError("");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
            {page === "login" ? "WELCOME BACK" : "JOIN OUR COMMUNITY"}
          </p>
          <h1>
            {page === "login" ? "Welcome back." : "Create account."}
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
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete={
                page === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button className="primary-button" type="submit" disabled={loading}>
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
              changePage(page === "login" ? "register" : "login")
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

export default LoginPage;
