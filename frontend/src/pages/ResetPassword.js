import React, { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/LoginPage.css"; // reuse your login styling

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

const passwordStrength = (pw) => {
    const errors = [];
    if (!pw || pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pw)) errors.push("One number");
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]/.test(pw)) errors.push("One special character");
    return errors;
};

export default function ResetPassword() {
    const query = useQuery();
    const navigate = useNavigate();

    const token = query.get("token") || "";

    const [form, setForm] = useState({ password: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const strengthErrors = useMemo(() => passwordStrength(form.password), [form.password]);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setErr("");

        if (!token) {
            setErr("Missing reset token. Please request a new reset link.");
            return;
        }

        if (strengthErrors.length > 0) {
            setErr("Password does not meet requirements.");
            return;
        }

        if (form.password !== form.confirm) {
            setErr("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post("/auth/reset-password", {
                token,
                newPassword: form.password,
            });

            setMsg("✅ Password updated! Redirecting to login…");
            setTimeout(() => navigate("/login"), 1200);
        } catch (e2) {
            console.error(e2);
            const apiMsg =
                e2?.response?.data?.message ||
                "Reset failed. The link may be expired. Please request a new one.";
            setErr(apiMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Reset Password</h1>
                <p>Create a new password for your account.</p>

                {msg && <p style={{ color: "green", marginBottom: 10 }}>{msg}</p>}
                {err && <p className="error-msg">{err}</p>}

                {!token && (
                    <p style={{ marginTop: 10 }}>
                        <Link to="/login">Back to Login</Link>
                    </p>
                )}

                {!!token && (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            name="password"
                            placeholder="New password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="confirm"
                            placeholder="Confirm new password"
                            value={form.confirm}
                            onChange={handleChange}
                            required
                        />

                        <div style={{ textAlign: "left", fontSize: 12, margin: "8px 0 12px", color: "#444" }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>Password must include:</div>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number", "One special character"].map((rule) => {
                                    const ok = !passwordStrength(form.password).includes(rule);
                                    return (
                                        <li key={rule} style={{ color: ok ? "green" : "#444" }}>
                                            {ok ? "✓ " : "• "}
                                            {rule}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Set New Password"}
                        </button>
                    </form>
                )}

                <div className="register-redirect" style={{ marginTop: 12 }}>
                    Remembered it? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}