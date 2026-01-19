import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();

    // If already logged in, route based on role
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = (localStorage.getItem("role") || "USER").toUpperCase();
        if (token) navigate(role === "ADMIN" ? "/admin" : "/dashboard");
    }, [navigate]);

    // One-time notice if redirected due to auth
    const [notice, setNotice] = useState("");
    useEffect(() => {
        const msg = sessionStorage.getItem("authMessage");
        if (msg) {
            setNotice(msg);
            sessionStorage.removeItem("authMessage");
        }
    }, []);

    // Login form
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Forgot password UI
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMsg, setForgotMsg] = useState("");
    const [forgotErr, setForgotErr] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/login", {
                email: form.email,
                password: form.password,
            });

            const { token, firstName, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("firstName", firstName || "");
            localStorage.setItem("role", role || "USER");

            if ((role || "").toUpperCase() === "ADMIN") navigate("/admin");
            else navigate("/dashboard");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Invalid email or password";
            setError(typeof msg === "string" ? msg : "Invalid email or password");
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
        setForgotEmail("");
        setForgotMsg("");
        setForgotErr("");
    };

    const submitForgot = async (e) => {
        e.preventDefault();
        setForgotMsg("");
        setForgotErr("");

        const email = (forgotEmail || "").trim();
        if (!email) {
            setForgotErr("Please enter your email.");
            return;
        }

        setForgotLoading(true);
        try {
            // Your backend returns the same success message whether or not the email exists ✅
            const res = await apiClient.post("/auth/forgot-password", { email });
            const msg = res?.data?.message || "If that email exists, we sent a password reset link.";
            setForgotMsg(msg);
        } catch (err) {
            // Still show generic success to prevent email enumeration
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

                <div style={{ color: "red", fontWeight: 900, marginBottom: 10 }}>
                    LOGIN PAGE UPDATED ✅
                </div>

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
                <div style={{ marginTop: 10, textAlign: "center" }}>
                    <button
                        type="button"
                        onClick={openForgot}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#1e63ff",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0,
                        }}
                    >
                        Forgot password?
                    </button>
                </div>

                <div className="register-redirect">
                    Don’t have an account? <Link to="/accountregister">Register here</Link>
                </div>

                {/* Simple modal */}
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
                                width: "100%",
                                maxWidth: 420,
                                background: "#fff",
                                borderRadius: 12,
                                padding: 18,
                                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                                textAlign: "left",
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Reset your password</h3>
                            <p style={{ marginTop: 0, color: "#555" }}>
                                Enter your email and we’ll send a reset link.
                            </p>

                            {forgotMsg && (
                                <div
                                    style={{
                                        background: "#e7f5ff",
                                        border: "1px solid #b3e5ff",
                                        color: "#034a6b",
                                        padding: "10px",
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                >
                                    {forgotMsg}
                                </div>
                            )}

                            {forgotErr && (
                                <div
                                    style={{
                                        background: "#fdecea",
                                        border: "1px solid #f5c6cb",
                                        color: "#721c24",
                                        padding: "10px",
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                >
                                    {forgotErr}
                                </div>
                            )}

                            <form onSubmit={submitForgot}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    style={{ width: "100%", marginBottom: 10 }}
                                />

                                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                    <button
                                        type="button"
                                        onClick={closeForgot}
                                        style={{
                                            background: "#f3f3f3",
                                            border: "1px solid #ddd",
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            fontWeight: 700,
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        style={{
                                            background: "#f47c2a",
                                            border: "none",
                                            color: "#fff",
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {forgotLoading ? "Sending..." : "Send reset link"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginPage;