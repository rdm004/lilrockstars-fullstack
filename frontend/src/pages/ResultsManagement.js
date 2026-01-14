import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/ResultsManagement.css";

const DIVISIONS = ["3 Year Old Division", "4 Year Old Division", "5 Year Old Division", "Snack Pack Division"];

const divisionFromAge = (ageRaw) => {
    const age = Number(ageRaw);
    if (age === 2 || age === 3) return "3 Year Old Division";
    if (age === 4) return "4 Year Old Division";
    if (age === 5) return "5 Year Old Division";
    if (age === 6 || age === 7) return "Snack Pack Division";
    return "Snack Pack Division";
};

const formatRaceDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

// Try admin endpoints first, fall back to public endpoints (so you don’t break anything)
const tryGet = async (adminPath, fallbackPath) => {
    try {
        const res = await apiClient.get(adminPath);
        return res.data || [];
    } catch {
        const res = await apiClient.get(fallbackPath);
        return res.data || [];
    }
};

const tryPost = async (adminPath, fallbackPath, payload) => {
    try {
        return await apiClient.post(adminPath, payload);
    } catch {
        return await apiClient.post(fallbackPath, payload);
    }
};

const tryPut = async (adminPath, fallbackPath, payload) => {
    try {
        return await apiClient.put(adminPath, payload);
    } catch {
        return await apiClient.put(fallbackPath, payload);
    }
};

const tryDelete = async (adminPath, fallbackPath) => {
    try {
        return await apiClient.delete(adminPath);
    } catch {
        return await apiClient.delete(fallbackPath);
    }
};

const ResultsManagement = () => {
    const [races, setRaces] = useState([]);
    const [racers, setRacers] = useState([]);
    const [results, setResults] = useState([]);

    const [selectedRaceId, setSelectedRaceId] = useState("");
    const [activeDivision, setActiveDivision] = useState(DIVISIONS[0]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Bulk rows for the active division
    const [bulkRows, setBulkRows] = useState([
        { racerId: "", placement: "" },
        { racerId: "", placement: "" },
        { racerId: "", placement: "" },
    ]);

    // ---------------------------
    // Load base data
    // ---------------------------
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");

                // Races (events)
                const racesRes = await apiClient.get("/races"); // public is fine
                const mappedRaces = (racesRes.data || []).map((r) => ({
                    id: r.id,
                    raceName: r.raceName ?? r.raceName ?? r.raceName ?? r.raceName ?? r.raceName, // harmless
                    name: r.raceName || r.name,
                    raceDate: r.raceDate,
                    location: r.location,
                    description: r.description,
                }));

                mappedRaces.sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0));
                setRaces(mappedRaces);

                // Racers — admin needs “all racers”, but if you don’t have /admin/racers yet,
                // this falls back to /racers (which will only show the logged-in parent's racers).
                const racersData = await tryGet("/admin/racers", "/racers");
                setRacers(racersData);

                // Results — your existing endpoint is /results
                const resultsData = await tryGet("/admin/results", "/results");
                setResults(resultsData);

                // Default race selection: next upcoming, else first
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcoming = mappedRaces.find((x) => x.raceDate && new Date(x.raceDate) >= today);
                setSelectedRaceId(String((upcoming || mappedRaces[0] || {}).id || ""));
            } catch (e) {
                console.error("ResultsManagement load error:", e);
                setError("Could not load races/racers/results.");
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    // ---------------------------
    // Helpers / derived
    // ---------------------------
    const racersById = useMemo(() => {
        const m = new Map();
        (racers || []).forEach((r) => m.set(Number(r.id), r));
        return m;
    }, [racers]);

    const selectedRace = useMemo(() => {
        const id = Number(selectedRaceId);
        return races.find((r) => Number(r.id) === id) || null;
    }, [races, selectedRaceId]);

    // Normalize results into a consistent shape
    const normalizedResults = useMemo(() => {
        // Your backend RaceResultController returns:
        // { id, raceName, raceDate, racerName, division, placement }
        // But for management we also want raceId + racerId when possible.
        // If your admin endpoint later returns IDs, we’ll use them automatically.
        return (results || []).map((row) => {
            const racer = row.racer || null;
            const race = row.race || null;

            const racerId = row.racerId ?? racer?.id ?? null;
            const raceId = row.raceId ?? race?.id ?? null;

            const racerName =
                row.racerName ||
                (racer ? `${racer.firstName || ""} ${racer.lastName || ""}`.trim() : "");

            const division =
                row.division ||
                (racer ? (racer.division || divisionFromAge(racer.age)) : "");

            return {
                id: row.id,
                raceId,
                raceName: row.raceName || race?.raceName || "",
                raceDate: row.raceDate || race?.raceDate || "",
                racerId,
                racerName,
                division,
                placement: Number(row.placement ?? 0),
            };
        });
    }, [results]);

    // Filter results to selected race
    const resultsForSelectedRace = useMemo(() => {
        const rid = Number(selectedRaceId);
        return normalizedResults.filter((r) => {
            // If we have IDs, match by ID
            if (r.raceId != null) return Number(r.raceId) === rid;

            // Else fallback to matching by name/date (works with your current DTO)
            const nameOk = selectedRace?.raceName ? r.raceName === selectedRace.raceName : true;
            const dateOk = selectedRace?.raceDate ? String(r.raceDate).startsWith(String(selectedRace.raceDate)) : true;
            return nameOk && dateOk;
        });
    }, [normalizedResults, selectedRaceId, selectedRace]);

    const groupedByDivision = useMemo(() => {
        const groups = {};
        DIVISIONS.forEach((d) => (groups[d] = []));

        resultsForSelectedRace.forEach((row) => {
            const div = row.division || "Snack Pack Division";
            if (!groups[div]) groups[div] = [];
            groups[div].push(row);
        });

        Object.keys(groups).forEach((div) => {
            groups[div].sort((a, b) => (a.placement || 999) - (b.placement || 999));
        });

        return groups;
    }, [resultsForSelectedRace]);

    const racerLabel = (r) => {
        const name = `${r.firstName || ""} ${r.lastName || ""}`.trim() || `Racer #${r.id}`;
        const car = r.carNumber ? ` (#${String(r.carNumber).replace(/^#/, "")})` : "";
        const div = r.division ? ` — ${r.division}` : r.age ? ` — ${divisionFromAge(r.age)}` : "";
        return `${name}${car}${div}`;
    };

    const racersForActiveDivision = useMemo(() => {
        return (racers || [])
            .map((r) => ({
                ...r,
                _division: r.division || divisionFromAge(r.age),
            }))
            .filter((r) => r._division === activeDivision)
            .sort((a, b) => {
                const an = String(a.carNumber || "").replace(/\D/g, "");
                const bn = String(b.carNumber || "").replace(/\D/g, "");
                return (Number(an || 9999) - Number(bn || 9999)) || racerLabel(a).localeCompare(racerLabel(b));
            });
    }, [racers, activeDivision]);

    // ---------------------------
    // Bulk entry actions
    // ---------------------------
    const setBulkCell = (idx, key, value) => {
        setBulkRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
    };

    const addBulkRow = () => {
        setBulkRows((prev) => [...prev, { racerId: "", placement: "" }]);
    };

    const removeBulkRow = (idx) => {
        setBulkRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearBulk = () => {
        setBulkRows([{ racerId: "", placement: "" }, { racerId: "", placement: "" }, { racerId: "", placement: "" }]);
    };

    const saveBulk = async () => {
        const raceIdNum = Number(selectedRaceId);
        if (!raceIdNum) {
            alert("Select an event first.");
            return;
        }

        const cleaned = bulkRows
            .map((r) => ({
                racerId: Number(r.racerId),
                placement: Number(r.placement),
            }))
            .filter((r) => r.racerId && r.placement);

        if (cleaned.length === 0) {
            alert("Add at least one racer + placement.");
            return;
        }

        setSaving(true);
        try {
            // Post one-by-one (works now).
            // Later we can create /api/admin/results/bulk and send the whole list at once.
            for (const row of cleaned) {
                const racer = racersById.get(Number(row.racerId));
                const division = racer?.division || divisionFromAge(racer?.age);

                const payload = {
                    raceId: raceIdNum,
                    racerId: Number(row.racerId),
                    division,
                    placement: row.placement,
                };

                await tryPost("/admin/results", "/results", payload);
            }

            // Refresh results list
            const refreshed = await tryGet("/admin/results", "/results");
            setResults(refreshed);

            clearBulk();
            alert(`✅ Saved ${cleaned.length} result(s).`);
        } catch (e) {
            console.error("Bulk save error:", e);
            alert("❌ Failed to save results. Check backend endpoint / permissions.");
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------
    // Delete result (if backend supports it)
    // ---------------------------
    const deleteResult = async (resultId) => {
        if (!window.confirm("Delete this result entry?")) return;
        try {
            await tryDelete(`/admin/results/${resultId}`, `/results/${resultId}`);
            const refreshed = await tryGet("/admin/results", "/results");
            setResults(refreshed);
        } catch (e) {
            console.error("Delete result error:", e);
            alert("❌ Failed to delete result (backend endpoint may not exist yet).");
        }
    };

    // ---------------------------
    // UI
    // ---------------------------
    return (
        <Layout title="Results Management">
            <div className="results-page">
                <div className="results-header">
                    <div>
                        <h2>Race Results</h2>
                        <p className="muted">
                            Pick an event, then enter results by division. Racers do <b>not</b> need to be registered to be added.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="loading">Loading…</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <>
                        {/* Event selector */}
                        <div className="controls">
                            <label className="control">
                                <span>Event</span>
                                <select value={selectedRaceId} onChange={(e) => setSelectedRaceId(e.target.value)}>
                                    <option value="">-- Select Event --</option>
                                    {races.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.raceName || r.name} {r.raceDate ? `(${formatRaceDate(r.raceDate)})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Division tabs */}
                        <div className="division-tabs">
                            {DIVISIONS.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`division-tab ${activeDivision === d ? "active" : ""}`}
                                    onClick={() => setActiveDivision(d)}
                                >
                                    {d.replace(" Division", "")}
                                </button>
                            ))}
                        </div>

                        {/* Bulk entry table */}
                        <div className="bulk-card">
                            <div className="bulk-header">
                                <h3>Bulk Add — {activeDivision}</h3>
                                <div className="bulk-actions">
                                    <button type="button" className="btn-light" onClick={addBulkRow}>
                                        + Row
                                    </button>
                                    <button type="button" className="btn-light" onClick={clearBulk}>
                                        Clear
                                    </button>
                                    <button type="button" className="btn-primary" onClick={saveBulk} disabled={saving}>
                                        {saving ? "Saving…" : "Save All"}
                                    </button>
                                </div>
                            </div>

                            <div className="bulk-table-wrap">
                                <table className="bulk-table">
                                    <thead>
                                    <tr>
                                        <th>Racer</th>
                                        <th className="col-small">Placement</th>
                                        <th className="col-small"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {bulkRows.map((row, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <select
                                                    value={row.racerId}
                                                    onChange={(e) => setBulkCell(idx, "racerId", e.target.value)}
                                                >
                                                    <option value="">-- Select Racer --</option>
                                                    {racersForActiveDivision.map((r) => (
                                                        <option key={r.id} value={r.id}>
                                                            {racerLabel(r)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="col-small">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={row.placement}
                                                    onChange={(e) => setBulkCell(idx, "placement", e.target.value)}
                                                    placeholder="1"
                                                />
                                            </td>
                                            <td className="col-small">
                                                <button type="button" className="btn-danger" onClick={() => removeBulkRow(idx)}>
                                                    ✖
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className="muted small">
                                Tip: set placements (1,2,3…) as you enter them. If a racer isn’t showing in this division, check their age/division on the Racers page.
                            </p>
                        </div>

                        {/* Existing results grouped by division */}
                        <div className="existing-results">
                            <h3>Existing Results (for selected event)</h3>

                            {DIVISIONS.map((div) => {
                                const rows = groupedByDivision[div] || [];
                                return (
                                    <div key={div} className="division-section">
                                        <div className="division-title">
                                            <h4>{div}</h4>
                                            <span className="muted">{rows.length} result(s)</span>
                                        </div>

                                        <div className="table-wrap">
                                            <table className="results-table">
                                                <thead>
                                                <tr>
                                                    <th className="col-small">Place</th>
                                                    <th>Racer</th>
                                                    <th className="col-small">Car #</th>
                                                    <th className="col-small">Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {rows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4">No results yet.</td>
                                                    </tr>
                                                ) : (
                                                    rows.map((r) => {
                                                        const racer = r.racerId ? racersById.get(Number(r.racerId)) : null;
                                                        const car = racer?.carNumber || "";
                                                        return (
                                                            <tr key={r.id}>
                                                                <td className="col-small">{r.placement || "-"}</td>
                                                                <td>{r.racerName || "-"}</td>
                                                                <td className="col-small">{car ? `#${String(car).replace(/^#/, "")}` : "-"}</td>
                                                                <td className="col-small">
                                                                    <button className="btn-danger" onClick={() => deleteResult(r.id)}>
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ResultsManagement;