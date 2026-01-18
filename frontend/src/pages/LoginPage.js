import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = (localStorage.getItem("role") || "USER").toUpperCase();
        if (token) {
            navigate(role === "ADMIN" ? "/admin" : "/dashboard");
        }
    }, [navigate]);

    // 🔔 Show a one-time notice if we were redirected due to 401
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/login", form);

            const { token, firstName, role } = response.data; // ✅ role added

            localStorage.setItem("token", token);
            localStorage.setItem("firstName", firstName || "");
            localStorage.setItem("role", role || "USER");     // ✅ store role

            // ✅ Optional: send admins straight to admin dashboard
            if ((role || "").toUpperCase() === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
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
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {error && <p className="error-msg">{error}</p>}

                <div className="register-redirect">
                    Don’t have an account? <Link to="/accountregister">Register here</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;