import React, { useMemo, useState } from "react";
import "../styles/AccountRegister.css";
import apiClient from "../utils/apiClient";

function checkPasswordStrength(pw) {
    const password = pw || "";

    const rules = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const score =
        (rules.length ? 1 : 0) +
        (rules.upper ? 1 : 0) +
        (rules.lower ? 1 : 0) +
        (rules.number ? 1 : 0) +
        (rules.special ? 1 : 0);

    // Define "strong" as meeting at least 4/5 rules,
    // but always require length.
    const isStrong = rules.length && score >= 4;

    return { rules, score, isStrong };
}

function looksLikeDuplicateEmailError(err) {
    const status = err?.response?.status;
    const msg =
        (err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "")
            .toString()
            .toLowerCase();

    // Common patterns across Spring Boot apps
    if (status === 409) return true; // Conflict
    if (msg.includes("already") && msg.includes("exist")) return true;
    if (msg.includes("duplicate")) return true;
    if (msg.includes("email") && msg.includes("taken")) return true;
    if (msg.includes("unique") && msg.includes("email")) return true;

    return false;
}

export default function AccountRegister() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const strength = useMemo(
        () => checkPasswordStrength(formData.password),
        [formData.password]
    );

    const passwordsMatch =
        formData.password.length > 0 &&
        formData.confirmPassword.length > 0 &&
        formData.password === formData.confirmPassword;

    const canSubmit =
        !submitting &&
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.email.trim() &&
        strength.isStrong &&
        passwordsMatch;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double submits
        if (submitting) return;

        setMessage(null);
        setError(null);

        if (!strength.isStrong) {
            setError("Password is not strong enough. Please meet the requirements below.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const payload = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            password: formData.password,
        };

        try {
            setSubmitting(true);
            await apiClient.post("/auth/register", payload);

            setMessage("✅ Account created successfully! You can now log in.");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (err) {
            console.error("Registration error:", err);

            if (looksLikeDuplicateEmailError(err)) {
                setError("❌ That email is already registered. Try logging in instead.");
            } else {
                setError(err?.response?.data?.message || "❌ Registration failed.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Simple visual indicator labels
    const ruleLine = (ok, text) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.9rem",
                color: ok ? "#166534" : "#555",
            }}
        >
            <span aria-hidden="true">{ok ? "✅" : "⬜"}</span>
            <span>{text}</span>
        </div>
    );

    return (
        <div className="account-register-container">
            <div className="account-register-content">
                <h1>Create an Account</h1>
                <p>Register to access member features and race tools.</p>

                {message && <div className="register-message success">{message}</div>}
                {error && <div className="register-message error">{error}</div>}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {/* ✅ Password strength checklist */}
                    <div
                        style={{
                            marginTop: 10,
                            padding: "12px",
                            borderRadius: 10,
                            border: "1px solid #eee",
                            background: "#fff",
                            textAlign: "left",
                        }}
                    >
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>
                            Password requirements
                            <span style={{ marginLeft: 10, fontWeight: 700, color: strength.isStrong ? "#166534" : "#b45309" }}>
                                {strength.isStrong ? "Strong" : "Needs work"}
                            </span>
                        </div>

                        {ruleLine(strength.rules.length, "At least 8 characters")}
                        {ruleLine(strength.rules.upper, "At least 1 uppercase letter")}
                        {ruleLine(strength.rules.lower, "At least 1 lowercase letter")}
                        {ruleLine(strength.rules.number, "At least 1 number")}
                        {ruleLine(strength.rules.special, "At least 1 special character")}
                        <div style={{ marginTop: 8, fontSize: "0.85rem", color: "#666" }}>
                            Tip: Meeting 4 of 5 rules (with length) is considered strong.
                        </div>

                        {/* ✅ confirm match note */}
                        {formData.confirmPassword.length > 0 && (
                            <div style={{ marginTop: 10, fontSize: "0.9rem", color: passwordsMatch ? "#166534" : "#b91c1c" }}>
                                {passwordsMatch ? "✅ Passwords match" : "❌ Passwords do not match"}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={!canSubmit}
                        style={{
                            opacity: canSubmit ? 1 : 0.6,
                            cursor: canSubmit ? "pointer" : "not-allowed",
                            marginTop: 14,
                        }}
                    >
                        {submitting ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}