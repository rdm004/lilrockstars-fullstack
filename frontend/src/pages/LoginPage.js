// frontend/src/pages/LoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();

    // If already logged in, go to the correct dashboard
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = (localStorage.getItem("role") || "USER").toUpperCase();
        if (token) navigate(role === "ADMIN" ? "/admin" : "/dashboard");
    }, [navigate]);

    // one-time notice if redirected
    const [notice, setNotice] = useState("");
    useEffect(() => {
        const msg = sessionStorage.getItem("authMessage");
        if (msg) {
            setNotice(msg);
            sessionStorage.removeItem("authMessage");
        }
    }, []);

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Forgot password modal state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMsg, setForgotMsg] = useState("");
    const [forgotErr, setForgotErr] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/login", form);
            const { token, firstName, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("firstName", firstName || "");
            localStorage.setItem("role", role || "USER");

            if ((role || "").toUpperCase() === "ADMIN") navigate("/admin");
            else navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const openForgot = () => {
        setShowForgot(true);
        setForgotEmail(form.email || "");
        setForgotMsg("");
        setForgotErr("");
    };

    const closeForgot = () => {
        setShowForgot(false);
        setForgotMsg("");
        setForgotErr("");
        setForgotLoading(false);
    };

    const submitForgot = async (e) => {
        e.preventDefault();
        setForgotMsg("");
        setForgotErr("");
        setForgotLoading(true);

        try {
            // backend should always return the same message
            const res = await apiClient.post("/auth/forgot-password", { email: forgotEmail });
            setForgotMsg(res?.data?.message || "If that email exists, we sent a password reset link.");
        } catch (err) {
            console.error(err);
            // still show a generic message (prevents email enumeration)
            setForgotMsg("If that email exists, we sent a password reset link.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Welcome Back!</h1>
                <p>Log in to access your dashboard</p>

                {notice && (
                    <div
                        style={{
                            background: "#fff3cd",
                            border: "1px solid #ffeeba",
                            color: "#856404",
                            padding: "10px",
                            borderRadius: 6,
                            marginBottom: 12,
                        }}
                    >
                        {notice}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {error && <p className="error-msg">{error}</p>}

                {/* Forgot password link */}
                <div style={{ marginTop: 12, textAlign: "center" }}>
                    <button
                        type="button"
                        onClick={openForgot}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#1e63ff",
                            fontWeight: 800,
                            fontSize: "1.2rem",
                        }}
                    >
                        Forgot password?
                    </button>
                </div>

                <div className="register-redirect" style={{ marginTop: 14 }}>
                    Don’t have an account? <Link to="/accountregister">Register here</Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div
                    onClick={closeForgot}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: 16,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(520px, 95vw)",
                            background: "#fff",
                            borderRadius: 12,
                            padding: 18,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>Reset Password</h2>
                        <p style={{ marginTop: 6, color: "#555" }}>
                            Enter your email and we’ll send a reset link (if it exists in our system).
                        </p>

                        <form onSubmit={submitForgot}>
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="Email"
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                    marginTop: 8,
                                    marginBottom: 10,
                                }}
                            />

                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={closeForgot}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: 8,
                                        border: "1px solid #bbb",
                                        background: "#f3f3f3",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                    }}
                                >
                                    Close
                                </button>

                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "#f47c2a",
                                        color: "white",
                                        cursor: "pointer",
                                        fontWeight: 800,
                                    }}
                                >
                                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </div>
                        </form>

                        {forgotErr && <p style={{ color: "#c00", marginTop: 10 }}>{forgotErr}</p>}
                        {forgotMsg && <p style={{ color: "#1f7a1f", marginTop: 10 }}>{forgotMsg}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;