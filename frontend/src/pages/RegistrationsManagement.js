// frontend/src/pages/RegistrationsManagement.js
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/RegistrationsManagement.css";

const RegistrationsManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [racers, setRacers] = useState([]);
    const [races, setRaces] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showPastEvents, setShowPastEvents] = useState(false);

    // ---------------------------
    // Helpers
    // ---------------------------
    const formatRaceDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
    };

    const toCarNumberInt = (carNumber) => {
        if (carNumber === null || carNumber === undefined) return 9999;
        const n = String(carNumber).replace(/[^0-9]/g, "");
        return n ? Number(n) : 9999;
    };

    const divisionFromAge = (age) => {
        const n = Number(age);
        if (!n) return "-";
        if (n === 3) return "3 Year Old Division";
        if (n === 4) return "4 Year Old Division";
        if (n === 5) return "5 Year Old Division";
        if (n === 6 || n === 7) return "Snack Pack Division";
        return "Snack Pack Division";
    };

    const divisionRank = (division) => {
        const d = (division || "").toLowerCase();
        if (d.includes("3")) return 1;
        if (d.includes("4")) return 2;
        if (d.includes("5")) return 3;
        if (d.includes("snack")) return 4;
        return 99;
    };

    const getRacerId = (r) => {
        const id = r?.id ?? r?.racerId ?? r?.racerID;
        return id !== undefined && id !== null ? Number(id) : null;
    };

    const getRacerName = (r) => {
        if (!r) return "-";
        const first = r.firstName ?? r.first_name ?? "";
        const last = r.lastName ?? r.last_name ?? "";
        const full = `${first} ${last}`.trim();
        if (full) return full;
        return r.racerName || r.fullName || r.name || r.displayName || "-";
    };

    const getRacerDivision = (r) => {
        if (!r) return "-";

        const direct =
            r.division ||
            r.divisionName ||
            r.ageDivision ||
            r.className ||
            r.division_name;

        if (direct) return direct;

        const age = r.age ?? r.racerAge ?? r.ageYears ?? r.age_years;
        return divisionFromAge(age);
    };

    const getParentEmail = (r, reg) => {
        return (
            reg?.parentEmail ||
            reg?.parent_email ||
            r?.parentEmail ||
            r?.parent_email ||
            r?.parent?.email ||
            "-"
        );
    };

    // ---------------------------
    // Maps for lookup
    // ---------------------------
    const racersById = useMemo(() => {
        const m = new Map();
        (racers || []).forEach((r) => {
            const id = getRacerId(r);
            if (id) m.set(id, r);
        });
        return m;
    }, [racers]);

    const racesById = useMemo(() => {
        const m = new Map();
        (races || []).forEach((race) => {
            const id = Number(race?.id ?? race?.raceId ?? race?.raceID);
            if (id) m.set(id, race);
        });
        return m;
    }, [races]);

    // ---------------------------
    // Fetch
    // ---------------------------
    const fetchAll = async () => {
        try {
            setLoading(true);
            setError("");

            const [regsRes, racersRes, racesRes] = await Promise.all([
                apiClient.get("/admin/registrations"), // /api/admin/registrations
                // If you have /api/admin/racers (list), use that; otherwise leave /racers
                // apiClient.get("/admin/racers"),
                apiClient.get("/racers"),
                apiClient.get("/races"),
            ]);

            setRacers(racersRes.data || []);
            setRaces(racesRes.data || []);

            const raw = regsRes.data || [];

            // ✅ Normalize registrations (supports AdminRegistrationRow or nested entity shapes)
            const normalized = raw.map((row) => {
                const nestedRacerId =
                    row?.racer?.id ?? row?.racer?.racerId ?? row?.racer?.racerID;

                const nestedRaceId =
                    row?.race?.id ?? row?.race?.raceId ?? row?.race?.raceID;

                // ✅ IMPORTANT: AdminRegistrationRow uses registrationId (NOT id)
                const regId =
                    row?.registrationId ??
                    row?.id ?? // fallback if backend returns entity directly
                    row?.registration_id ??
                    null;

                return {
                    // ✅ always store the registration primary key here
                    id: regId,

                    racerId:
                        row?.racerId ??
                        row?.racerID ??
                        nestedRacerId ??
                        row?.racer_id ??
                        "",

                    raceId:
                        row?.raceId ??
                        row?.raceID ??
                        nestedRaceId ??
                        row?.race_id ??
                        "",

                    parentEmail: row?.parentEmail ?? row?.parent_email ?? null,

                    // Optional fields if backend sends them
                    racerName: row?.racerName ?? null,
                    division: row?.racerDivision ?? row?.division ?? null,
                    carNumber: row?.carNumber ?? null,

                    // Extra optional (sometimes in your DTO)
                    racerAge: row?.racerAge ?? null,
                    racerFirstName: row?.racerFirstName ?? null,
                    racerLastName: row?.racerLastName ?? null,
                };
            });

            setRegistrations(normalized);
        } catch (err) {
            console.error("Error loading registrations:", err);
            setError("Could not load registrations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAll();
    }, []);

    // ---------------------------
    // Hydrate rows with racer/race lookup
    // ---------------------------
    const hydratedRows = useMemo(() => {
        return (registrations || []).map((reg) => {
            const racer = racersById.get(Number(reg.racerId));
            const race = racesById.get(Number(reg.raceId));

            // If DTO already has first/last, use them:
            const dtoName =
                reg.racerFirstName || reg.racerLastName
                    ? `${reg.racerFirstName || ""} ${reg.racerLastName || ""}`.trim()
                    : null;

            const racerName = reg.racerName || dtoName || getRacerName(racer);

            const carNumber =
                reg.carNumber ??
                racer?.carNumber ??
                racer?.car_number ??
                "";

            const division =
                reg.division ||
                (reg.racerAge ? divisionFromAge(reg.racerAge) : null) ||
                getRacerDivision(racer);

            const parentEmail = getParentEmail(racer, reg);

            const raceName =
                race?.raceName || race?.name || `Race #${reg.raceId || "?"}`;

            const raceDate = race?.raceDate || "";

            return {
                ...reg,
                racerName,
                carNumber,
                division,
                parentEmail,
                raceName,
                raceDate,
            };
        });
    }, [registrations, racersById, racesById]);

    // ---------------------------
    // Group by raceId
    // ---------------------------
    const regsByRace = useMemo(() => {
        const m = new Map();

        hydratedRows.forEach((row) => {
            const raceIdNum = Number(row.raceId);
            if (!m.has(raceIdNum)) m.set(raceIdNum, []);
            m.get(raceIdNum).push(row);
        });

        for (const [raceIdNum, rows] of m.entries()) {
            rows.sort((a, b) => {
                const d = divisionRank(a.division) - divisionRank(b.division);
                if (d !== 0) return d;
                return toCarNumberInt(a.carNumber) - toCarNumberInt(b.carNumber);
            });
            m.set(raceIdNum, rows);
        }

        return m;
    }, [hydratedRows]);

    // Hide past events (optional toggle)
    const sortedRaceIds = useMemo(() => {
        const ids = Array.from(regsByRace.keys());

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = ids.filter((id) => {
            const race = racesById.get(Number(id));
            if (!race?.raceDate) return true;
            const d = new Date(race.raceDate);
            d.setHours(0, 0, 0, 0);
            return showPastEvents ? true : d >= today;
        });

        filtered.sort((a, b) => {
            const ra = racesById.get(Number(a));
            const rb = racesById.get(Number(b));
            const da = ra?.raceDate ? new Date(ra.raceDate).getTime() : 0;
            const db = rb?.raceDate ? new Date(rb.raceDate).getTime() : 0;
            return da - db;
        });

        return filtered;
    }, [regsByRace, racesById, showPastEvents]);

    // ---------------------------
    // Delete (Deregister)
    // ---------------------------
    const handleDelete = async (registrationId) => {
        if (!registrationId) {
            alert("❌ Missing registration id (cannot delete).");
            return;
        }

        if (!window.confirm("Delete this registration?")) return;

        try {
            await apiClient.delete(`/admin/registrations/${registrationId}`);
            setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
        } catch (err) {
            console.error("Error deleting registration:", err);
            alert("❌ Failed to delete registration.");
        }
    };

    // ---------------------------
    // Print
    // ---------------------------
    const printSignInSheet = (raceId) => {
        const race = racesById.get(Number(raceId));
        const raceTitle = race?.raceName || race?.name || `Race #${raceId}`;
        const raceDateText = race?.raceDate ? formatRaceDate(race.raceDate) : "";

        const rows = (regsByRace.get(Number(raceId)) || []).slice();
        rows.sort((a, b) => {
            const d = divisionRank(a.division) - divisionRank(b.division);
            if (d !== 0) return d;
            return toCarNumberInt(a.carNumber) - toCarNumberInt(b.carNumber);
        });

        const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${raceTitle} Sign-In Sheet</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 18px; color: #111; }
    .header { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom:16px; }
    .header h1 { margin:0; font-size: 22px; }
    .meta { color:#444; font-size: 13px; text-align:right; }
    table { width:100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; }
    th { background:#f4f4f4; text-align:left; }
    .col-small { width: 90px; }
    .col-medium { width: 180px; }
    .checkbox { width: 18px; height: 18px; display:inline-block; border: 2px solid #333; border-radius: 3px; }
    .note { margin-top: 6px; font-size: 12px; color:#444; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${raceTitle}</h1>
      <div class="note">Sorted by Division, then Car #</div>
    </div>
    <div class="meta">
      <div><b>Date:</b> ${raceDateText || "-"}</div>
      <div><b>Printed:</b> ${new Date().toLocaleString()}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Racer</th>
        <th class="col-small">Car #</th>
        <th class="col-medium">Division</th>
        <th>Parent</th>
        <th class="col-small">Draw #</th>
        <th class="col-small">Paid</th>
      </tr>
    </thead>
    <tbody>
      ${
            rows.length === 0
                ? `<tr><td colspan="6">No registrations found for this race.</td></tr>`
                : rows
                    .map(
                        (row) => `
        <tr>
          <td>${row.racerName || "-"}</td>
          <td>${row.carNumber ? `#${String(row.carNumber).replace(/^#/, "")}` : "-"}</td>
          <td>${row.division || "-"}</td>
          <td>${row.parentEmail || "-"}</td>
          <td></td>
          <td><span class="checkbox"></span></td>
        </tr>`
                    )
                    .join("")
        }
    </tbody>
  </table>
</body>
</html>
    `;

        const w = window.open("", "_blank", "width=1000,height=800");
        if (!w) return;

        w.document.open();
        w.document.write(html);
        w.document.close();

        setTimeout(() => w.print(), 250);
    };

    // ---------------------------
    // UI
    // ---------------------------
    return (
        <Layout title="Registrations Management">
            <div className="registrations-container">
                <div className="registrations-header" style={{ alignItems: "flex-start" }}>
                    <div>
                        <h1 style={{ marginBottom: 4 }}>Registrations</h1>
                        <p style={{ margin: "20px 0 20px", color: "#1e63ff" }}>
                            Admin view: print sign-in sheets and manage registrations.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#444" }}>
                            <input
                                type="checkbox"
                                checked={showPastEvents}
                                onChange={(e) => setShowPastEvents(e.target.checked)}
                            />
                            Show past events
                        </label>
                    </div>
                </div>

                {loading ? (
                    <p className="loading">Loading registrations...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : sortedRaceIds.length === 0 ? (
                    <p>No registrations found.</p>
                ) : (
                    sortedRaceIds.map((raceId) => {
                        const race = racesById.get(Number(raceId));
                        const raceName = race?.raceName || race?.name || `Race #${raceId}`;
                        const raceDateText = race?.raceDate ? formatRaceDate(race.raceDate) : "";
                        const rows = regsByRace.get(Number(raceId)) || [];

                        return (
                            <div
                                key={raceId}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #f47c2a",
                                    borderRadius: "10px",
                                    padding: "16px",
                                    marginBottom: "18px",
                                }}
                            >
                                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                                    <h2 style={{ margin: 0, color: "#f47c2a" }}>{raceName}</h2>
                                    <p style={{ margin: "6px 0 10px", color: "#666" }}>{raceDateText}</p>

                                    <button
                                        type="button"
                                        className="add-btn"
                                        style={{
                                            background: "#f3f3f3",
                                            color: "#111",
                                            border: "1px solid #bbb",
                                        }}
                                        onClick={() => printSignInSheet(raceId)}
                                    >
                                        🖨️ Print Sign-In Sheet
                                    </button>
                                </div>

                                <table className="registrations-table">
                                    <thead>
                                    <tr>
                                        <th>Racer</th>
                                        <th>Car #</th>
                                        <th>Division</th>
                                        <th>Parent</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan="5">No registrations for this race yet.</td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id ?? `${row.racerId}|${row.raceId}`}>
                                                <td>{row.racerName || "-"}</td>
                                                <td>{row.carNumber ? `#${String(row.carNumber).replace(/^#/, "")}` : "-"}</td>
                                                <td>{row.division || "-"}</td>
                                                <td>{row.parentEmail || "-"}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(row.id)}
                                                        disabled={!row.id}
                                                        title={!row.id ? "Missing registration id" : "Delete registration"}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                )}
            </div>
        </Layout>
    );
};

export default RegistrationsManagement;