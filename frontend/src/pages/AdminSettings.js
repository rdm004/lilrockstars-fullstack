import React, { useState } from "react";
import Layout from "../components/Layout";
import "../styles/AdminSettings.css";

const AdminSettings = () => {
    const [adminInfo, setAdminInfo] = useState({
        name: "Ryan Administrator",
        email: "admin@lilrockstars.com",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const handleAdminChange = (e) => {
        const { name, value } = e.target;
        setAdminInfo({ ...adminInfo, [name]: value });
        setErrors({});
        setSuccessMessage("");
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasNumber = /\d/.test(password);
        const hasLetter = /[A-Za-z]/.test(password);
        return password.length >= minLength && hasNumber && hasLetter;
    };

    const validateForm = () => {
        let newErrors = {};

        if (showPasswordFields) {
            if (!adminInfo.currentPassword) {
                newErrors.currentPassword = "Please enter your current password.";
            }

            if (!adminInfo.newPassword) {
                newErrors.newPassword = "Please enter a new password.";
            } else if (!validatePassword(adminInfo.newPassword)) {
                newErrors.newPassword =
                    "Password must be at least 8 characters and include both letters and numbers.";
            }

            if (adminInfo.newPassword !== adminInfo.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Simulate backend update
        setTimeout(() => {
            setSuccessMessage("✅ Profile updated successfully!");
            setAdminInfo({
                ...adminInfo,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setShowPasswordFields(false);

            // Clear success message after 4 seconds
            setTimeout(() => setSuccessMessage(""), 4000);
        }, 600);
    };

    return (
        <Layout title="Admin Settings">
            <div className="settings-container">
                <h1>Admin Account Settings</h1>

                <div className="settings-section">
                    <h2>👤 Profile Information</h2>
                    <form onSubmit={handleSaveProfile} className="settings-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={adminInfo.name}
                                onChange={handleAdminChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={adminInfo.email}
                                onChange={handleAdminChange}
                            />
                        </div>

                        {!showPasswordFields && (
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setShowPasswordFields(true)}
                            >
                                Change Password
                            </button>
                        )}

                        {showPasswordFields && (
                            <>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={adminInfo.currentPassword}
                                        onChange={handleAdminChange}
                                        placeholder="••••••••"
                                    />
                                    {errors.currentPassword && (
                                        <p className="error-text">{errors.currentPassword}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={adminInfo.newPassword}
                                        onChange={handleAdminChange}
                                        placeholder="••••••••"
                                    />
                                    {errors.newPassword && (
                                        <p className="error-text">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={adminInfo.confirmPassword}
                                        onChange={handleAdminChange}
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="error-text">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowPasswordFields(false)}
                                >
                                    Cancel Password Change
                                </button>
                            </>
                        )}

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={Object.keys(errors).length > 0}
                        >
                            Save Changes
                        </button>

                        {successMessage && (
                            <p className="success-text">{successMessage}</p>
                        )}
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AdminSettings;