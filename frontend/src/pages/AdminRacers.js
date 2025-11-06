import React, { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";
import Layout from "../components/Layout";
import "../styles/AdminRacers.css";

const AdminRacers = () => {
    const [racers, setRacers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formVisible, setFormVisible] = useState(false);
    const [editRacer, setEditRacer] = useState(null);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        age: "",
        division: "",
        carNumber: "",
    });

    useEffect(() => {
        fetchRacers();
    }, []);

    const fetchRacers = async () => {
        try {
            const response = await apiClient.get("/racers");
            setRacers(response.data);
        } catch (err) {
            setError("Unable to load racers.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editRacer) {
                await apiClient.put(`/racers/${editRacer.id}`, form);
            } else {
                await apiClient.post("/racers", form);
            }
            setForm({ firstName: "", lastName: "", age: "", division: "", carNumber: "" });
            setFormVisible(false);
            setEditRacer(null);
            fetchRacers();
        } catch (err) {
            alert("Failed to save racer.");
        }
    };

    const handleEdit = (racer) => {
        setEditRacer(racer);
        setForm(racer);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this racer?")) {
            await apiClient.delete(`/racers/${id}`);
            fetchRacers();
        }
    };

    if (loading) return <Layout title="Racers"><p>Loading...</p></Layout>;
    if (error) return <Layout title="Racers"><p>{error}</p></Layout>;

    return (
        <Layout title="Racers Management">
            <div className="racers-page">
                <div className="racers-header">
                    <h2>Racers</h2>
                    <button className="btn-primary" onClick={() => setFormVisible(!formVisible)}>
                        {formVisible ? "Cancel" : "Add Racer"}
                    </button>
                </div>

                {formVisible && (
                    <form className="racer-form" onSubmit={handleSubmit}>
                        <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
                        <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
                        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
                        <input type="text" name="division" placeholder="Division" value={form.division} onChange={handleChange} required />
                        <input type="text" name="carNumber" placeholder="Car #" value={form.carNumber} onChange={handleChange} required />
                        <button type="submit" className="btn-save">
                            {editRacer ? "Update Racer" : "Save Racer"}
                        </button>
                    </form>
                )}

                <table className="racers-table">
                    <thead>
                    <tr>
                        <th>Car #</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Division</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {racers.length > 0 ? (
                        racers.map((racer) => (
                            <tr key={racer.id}>
                                <td>{racer.carNumber}</td>
                                <td>{racer.firstName} {racer.lastName}</td>
                                <td>{racer.age}</td>
                                <td>{racer.division}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(racer)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(racer.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5">No racers found.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminRacers;