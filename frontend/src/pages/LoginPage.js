import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/LoginPage.css";
import { useEffect } from "react";

function LoginPage() {
    const navigate = useNavigate();
    // ✅ If already logged in, go straight to dashboard
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);
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
            const { token, firstName } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("firstName", firstName);

            navigate("/dashboard"); // redirect after login
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
                    Don’t have an account?{" "}
                    <a href="/register">Register here</a>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;