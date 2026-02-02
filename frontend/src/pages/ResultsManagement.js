import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/ResultsManagement.css";

const DIVISIONS = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
    "Lil Stingers",
];

const divisionFromAge = (ageRaw) => {
    const age = Number(ageRaw);

    if (age === 2 || age === 3) return "3 Year Old Division";
    if (age === 4) return "4 Year Old Division";
    if (age === 5) return "5 Year Old Division";
    if (age === 6) return "Snack Pack Division";

    // age 7 can be snack pack OR stingers (defaults snack pack if unknown)
    if (age === 7) return "Snack Pack Division";

    // age 8–9 must be stingers
    if (age === 8 || age === 9) return "Lil Stingers";

    return "Snack Pack Division";
};

const formatRaceDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

// Try admin endpoints first, fall back to public endpoints
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

const tryDelete = async (adminPath, fallbackPath) => {
    try {
        return await apiClient.delete(adminPath);
    } catch {
        return await apiClient.delete(fallbackPath);
    }
};

// helpers
const toCarNumberInt = (carNumber) => {
    if (carNumber === null || carNumber === undefined) return 9999;
    const n = String(carNumber).replace(/[^0-9]/g, "");
    return n ? Number(n) : 9999;
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

    // registrations for selected race (admin view)
    const [raceRegistrations, setRaceRegistrations] = useState([]);
    const [regsLoading, setRegsLoading] = useState(false);

    // ✅ NEW: used to build dropdown list (only show events w/ registrations)
    const [allAdminRegistrations, setAllAdminRegistrations] = useState([]);

    // Bulk entry rows (auto-populated per division)
    // row shape: { racerId: "", place: "" }
    const [bulkRows, setBulkRows] = useState([]);

    // ---------------------------
    // Load base data (races, racers, results, ALL registrations once)
    // ---------------------------
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");

                // Races
                const racesRes = await apiClient.get("/races");
                const mappedRaces = (racesRes.data || []).map((r) => ({
                    id: r.id,
                    raceName: r.raceName || r.name || "",
                    name: r.raceName || r.name || "",
                    raceDate: r.raceDate,
                    location: r.location,
                    description: r.description,
                    // ✅ NEW: needed to hide info-only events from results mgmt
                    requiresRegistration: r.requiresRegistration ?? true,
                }));

                mappedRaces.sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0));
                setRaces(mappedRaces);

                // Racers (admin ideally = all racers; fallback = parent's racers)
                const racersData = await tryGet("/admin/racers", "/racers");
                setRacers(racersData);

                // Results
                const resultsData = await tryGet("/admin/results", "/results");
                setResults(resultsData);

                // ✅ NEW: load ALL registrations once (admin)
                try {
                    const regsAllRes = await apiClient.get("/admin/registrations");
                    setAllAdminRegistrations(regsAllRes.data || []);
                } catch (e) {
                    console.warn("Could not load /admin/registrations for dropdown filtering.", e);
                    setAllAdminRegistrations([]);
                }

                // Default selected race: next upcoming, else first (will be overridden after filtering)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcoming = mappedRaces.find((x) => x.raceDate && new Date(x.raceDate) >= today);
                const first = upcoming || mappedRaces[0] || null;
                setSelectedRaceId(first ? String(first.id) : "");
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
    // Derived maps
    // ---------------------------
    const racersById = useMemo(() => {
        const m = new Map();
        (racers || []).forEach((r) => m.set(Number(r.id), r));
        return m;
    }, [racers]);

    // ✅ Normalize ALL registrations so we can reliably extract raceId
    const normalizedAllRegistrations = useMemo(() => {
        return (allAdminRegistrations || []).map((row) => {
            const raceId = Number(row.raceId ?? row.race_id ?? 0) || null;
            return { ...row, _raceId: raceId };
        });
    }, [allAdminRegistrations]);

    // ✅ Set of raceIds that have at least 1 registration
    const raceIdsWithRegistrations = useMemo(() => {
        const set = new Set();
        (normalizedAllRegistrations || []).forEach((row) => {
            if (row._raceId) set.add(Number(row._raceId));
        });
        return set;
    }, [normalizedAllRegistrations]);

    // ✅ Only show events that:
    // - require registration
    // - have at least 1 registration
    const selectableRaces = useMemo(() => {
        return (races || []).filter((r) => {
            const requiresReg = r.requiresRegistration ?? true;
            if (!requiresReg) return false; // hide info-only events
            return raceIdsWithRegistrations.has(Number(r.id)); // hide races with 0 registrations
        });
    }, [races, raceIdsWithRegistrations]);

    // ✅ If selectedRaceId is not selectable anymore, auto-fix it
    useEffect(() => {
        if (loading) return;

        if (!selectedRaceId) {
            if (selectableRaces.length > 0) setSelectedRaceId(String(selectableRaces[0].id));
            return;
        }

        const isStillValid = selectableRaces.some((r) => String(r.id) === String(selectedRaceId));
        if (!isStillValid) {
            setSelectedRaceId(selectableRaces.length > 0 ? String(selectableRaces[0].id) : "");
        }
    }, [loading, selectedRaceId, selectableRaces]);

    const selectedRace = useMemo(() => {
        const id = Number(selectedRaceId);
        return races.find((r) => Number(r.id) === id) || null;
    }, [races, selectedRaceId]);

    // ---------------------------
    // Load registrations for selected race
    // ---------------------------
    useEffect(() => {
        const loadRaceRegs = async () => {
            if (!selectedRaceId) {
                setRaceRegistrations([]);
                return;
            }

            setRegsLoading(true);
            try {
                // Preferred: GET /api/admin/registrations/by-race/{raceId}
                let data = [];
                try {
                    const res = await apiClient.get(`/admin/registrations/by-race/${selectedRaceId}`);
                    data = res.data || [];
                } catch (e) {
                    // Fallback: use already loaded ALL registrations and filter locally
                    const raw = allAdminRegistrations || [];
                    data = raw.filter((row) => Number(row.raceId) === Number(selectedRaceId));
                }

                setRaceRegistrations(data);
            } catch (e) {
                console.error("Failed loading registrations for race:", e);
                setRaceRegistrations([]);
            } finally {
                setRegsLoading(false);
            }
        };

        void loadRaceRegs();
    }, [selectedRaceId, allAdminRegistrations]);

    // ---------------------------
    // Normalize registrations (for this selected race)
    // ---------------------------
    const normalizedRaceRegistrations = useMemo(() => {
        return (raceRegistrations || []).map((row) => {
            const racerId = Number(row.racerId ?? row.racer_id ?? 0) || null;
            const age = row.racerAge ?? row.age ?? null;

            const division =
                row.racerDivision ||
                row.division ||
                divisionFromAge(age);

            const carNumber =
                row.carNumber ??
                row.racerCarNumber ??
                "";

            return {
                registrationId: row.registrationId ?? row.id ?? null,
                raceId: Number(row.raceId ?? row.race_id ?? 0) || null,
                racerId,
                racerFirstName: row.racerFirstName ?? "",
                racerLastName: row.racerLastName ?? "",
                racerAge: age,
                division,
                carNumber,
                parentEmail: row.parentEmail ?? "-",
            };
        });
    }, [raceRegistrations]);

    // ---------------------------
    // Normalize results
    // ---------------------------
    const normalizedResults = useMemo(() => {
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
                place: Number(row.placement ?? row.place ?? row.Place ?? 0),
            };
        });
    }, [results]);

    const resultsForSelectedRace = useMemo(() => {
        const rid = Number(selectedRaceId);
        return normalizedResults.filter((r) => {
            if (r.raceId != null) return Number(r.raceId) === rid;

            // fallback: name/date match
            const nameOk = selectedRace?.raceName ? r.raceName === selectedRace.raceName : true;
            const dateOk = selectedRace?.raceDate
                ? String(r.raceDate).startsWith(String(selectedRace.raceDate))
                : true;
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
            groups[div].sort((a, b) => (a.place || 999) - (b.place || 999));
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
            .sort((a, b) => toCarNumberInt(a.carNumber) - toCarNumberInt(b.carNumber));
    }, [racers, activeDivision]);

    // ---------------------------
    // Registered IDs for selected event + active division
    // ---------------------------
    const registeredRacerIdsForDivision = useMemo(() => {
        const ids = new Set();
        (normalizedRaceRegistrations || []).forEach((row) => {
            if (!row.racerId) return;
            if (row.division === activeDivision) ids.add(Number(row.racerId));
        });
        return ids;
    }, [normalizedRaceRegistrations, activeDivision]);

    // ---------------------------
    // Auto-populate registered racers for this division
    // ---------------------------
    const autoPopulateDivision = () => {
        const regRacers = (normalizedRaceRegistrations || [])
            .filter((row) => row.division === activeDivision)
            .map((row) => {
                const racerId = Number(row.racerId);
                const racer = racersById.get(racerId);
                const carNumber = row.carNumber ?? racer?.carNumber ?? "";
                return { racerId: String(racerId), carNumber };
            })
            .sort((a, b) => toCarNumberInt(a.carNumber) - toCarNumberInt(b.carNumber));

        setBulkRows((prev) => {
            const prevByRacerId = new Map((prev || []).map((r) => [String(r.racerId), r]));
            const rows = regRacers.map((r) => ({
                racerId: r.racerId,
                place: prevByRacerId.get(String(r.racerId))?.place || "",
            }));

            rows.push({ racerId: "", place: "" }, { racerId: "", place: "" }, { racerId: "", place: "" });
            return rows;
        });
    };

    useEffect(() => {
        if (!selectedRaceId) {
            setBulkRows([]);
            return;
        }
        autoPopulateDivision();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDivision, selectedRaceId, normalizedRaceRegistrations]);

    // ---------------------------
    // Bulk entry actions
    // ---------------------------
    const setBulkCell = (idx, key, value) => {
        setBulkRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
    };

    const addExtraRow = () => {
        setBulkRows((prev) => [...prev, { racerId: "", place: "" }]);
    };

    const removeBulkRow = (idx) => {
        setBulkRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearPlacesOnly = () => {
        setBulkRows((prev) => prev.map((r) => ({ ...r, place: "" })));
    };

    const nonRegisteredRacersForDivision = useMemo(() => {
        return racersForActiveDivision.filter((r) => !registeredRacerIdsForDivision.has(Number(r.id)));
    }, [racersForActiveDivision, registeredRacerIdsForDivision]);

    const placeClass = (val) => {
        const n = Number(val);
        if (n === 1) return "place-1";
        if (n === 2) return "place-2";
        if (n === 3) return "place-3";
        return "";
    };

    const saveBulk = async () => {
        const raceIdNum = Number(selectedRaceId);
        if (!raceIdNum) {
            alert("Select an event first.");
            return;
        }

        const cleaned = (bulkRows || [])
            .map((r) => ({
                racerId: Number(r.racerId),
                place: Number(r.place),
            }))
            .filter((r) => r.racerId && r.place);

        if (cleaned.length === 0) {
            alert("Add at least one racer + place.");
            return;
        }

        setSaving(true);
        try {
            for (const row of cleaned) {
                const racer = racersById.get(Number(row.racerId));

                const stored = (racer?.division || "").trim();
                const division = stored ? stored : divisionFromAge(racer?.age);

                const payload = {
                    raceId: raceIdNum,
                    racerId: Number(row.racerId),
                    division,
                    placement: row.place,
                };

                await tryPost("/admin/results", "/results", payload);
            }

            const refreshed = await tryGet("/admin/results", "/results");
            setResults(refreshed);

            alert(`✅ Saved ${cleaned.length} result(s).`);
        } catch (e) {
            console.error("Bulk save error:", e);
            alert("❌ Failed to save results. Check backend endpoint / permissions.");
        } finally {
            setSaving(false);
        }
    };

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
                ) : selectableRaces.length === 0 ? (
                    <p className="muted">
                        No registration-based events found yet. (Info-only events and events with 0 registrations are hidden.)
                    </p>
                ) : (
                    <>
                        {/* Event selector */}
                        <div className="controls">
                            <label className="control">
                                <span>Event</span>
                                <select value={selectedRaceId} onChange={(e) => setSelectedRaceId(e.target.value)}>
                                    <option value="">-- Select Event --</option>
                                    {selectableRaces.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.raceName || r.name} {r.raceDate ? `(${formatRaceDate(r.raceDate)})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {regsLoading && <span className="muted small">Loading registrations…</span>}
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

                        {/* Bulk entry */}
                        <div className="bulk-card">
                            <div className="bulk-header">
                                <h3>
                                    Bulk Add — {activeDivision}{" "}
                                    <span className="muted small">(Registered: {Array.from(registeredRacerIdsForDivision).length})</span>
                                </h3>

                                <div className="bulk-actions">
                                    <button type="button" className="btn-light" onClick={addExtraRow}>
                                        + Add Extra Racer
                                    </button>
                                    <button type="button" className="btn-light" onClick={clearPlacesOnly}>
                                        Clear Places
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
                                        <th className="col-small">Place</th>
                                        <th className="col-small"></th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {(bulkRows || []).map((row, idx) => (
                                        <tr key={idx} className={placeClass(row.place)}>
                                            <td>
                                                <select
                                                    value={row.racerId}
                                                    onChange={(e) => setBulkCell(idx, "racerId", e.target.value)}
                                                >
                                                    <option value="">-- Select Racer --</option>

                                                    {/* Registered racers first */}
                                                    {racersForActiveDivision
                                                        .filter((r) => registeredRacerIdsForDivision.has(Number(r.id)))
                                                        .map((r) => (
                                                            <option key={r.id} value={r.id}>
                                                                ✅ {racerLabel(r)}
                                                            </option>
                                                        ))}

                                                    {/* Then non-registered racers */}
                                                    {nonRegisteredRacersForDivision.map((r) => (
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
                                                    value={row.place}
                                                    onChange={(e) => setBulkCell(idx, "place", e.target.value)}
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
                                Registered racers auto-fill for this event/division. Use “Add Extra Racer” for walk-ups.
                            </p>
                        </div>

                        {/* Existing results */}
                        <div className="existing-results">
                            <h3>Existing Results (selected event)</h3>

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
                                                            <tr key={r.id} className={placeClass(r.place)}>
                                                                <td className="col-small">{r.place || "-"}</td>
                                                                <td>{r.racerName || "-"}</td>
                                                                <td className="col-small">
                                                                    {car ? `#${String(car).replace(/^#/, "")}` : "-"}
                                                                </td>
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