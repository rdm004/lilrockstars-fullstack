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

    // Division filter per raceId (admin dropdown)
    const [divisionFilterByRace, setDivisionFilterByRace] = useState({});

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

    const getDivisionsForRace = (rows) => {
        const set = new Set((rows || []).map(r => r.division).filter(Boolean));
        return ["All Divisions", ...Array.from(set)];
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
            r.division || r.divisionName || r.ageDivision || r.className;

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
    // Lookup maps
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
        (races || []).forEach((r) => {
            const id = Number(r?.id ?? r?.raceId ?? r?.raceID);
            if (id) m.set(id, r);
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
                apiClient.get("/admin/registrations"), // => /api/admin/registrations
                apiClient.get("/racers"),              // => /api/racers
                apiClient.get("/races"),               // => /api/races
            ]);

            setRacers(racersRes.data || []);
            setRaces(racesRes.data || []);

            const raw = regsRes.data || [];

            // ✅ Helpful debug (leave for now)
            // console.log("REG RAW SAMPLE:", raw?.[0]);

            const normalized = raw.map((row) => {
                const nestedRacerId =
                    row?.racer?.id ?? row?.racer?.racerId ?? row?.racer?.racerID;
                const nestedRaceId =
                    row?.race?.id ?? row?.race?.raceId ?? row?.race?.raceID;

                return {
                    // ✅ Defensive: support id or registrationId
                    id: row.id ?? row.registrationId ?? row.registrationID,

                    racerId:
                        row.racerId ??
                        row.racerID ??
                        nestedRacerId ??
                        row.racer_id ??
                        "",

                    raceId:
                        row.raceId ??
                        row.raceID ??
                        nestedRaceId ??
                        row.race_id ??
                        "",

                    // status might not exist on your entity (fine)
                    status: row.status ?? null,

                    parentEmail: row.parentEmail ?? row.parent_email ?? null,

                    // Optional display fields if backend sends them
                    racerName: row.racerName ?? null,
                    division: row.division ?? null,
                    carNumber: row.carNumber ?? null,
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
    // Build hydrated rows
    // ---------------------------
    const hydratedRows = useMemo(() => {
        return (registrations || []).map((reg) => {
            const racer = racersById.get(Number(reg.racerId));
            const race = racesById.get(Number(reg.raceId));

            const racerName = reg.racerName || getRacerName(racer);

            const carNumber =
                reg.carNumber ??
                racer?.carNumber ??
                racer?.car_number ??
                "";

            const division = reg.division || getRacerDivision(racer);

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
    // Group by raceId + sort rows (division then car #)
    // ---------------------------
    const regsByRace = useMemo(() => {
        const m = new Map();

        hydratedRows.forEach((row) => {
            const raceId = Number(row.raceId);
            if (!m.has(raceId)) m.set(raceId, []);
            m.get(raceId).push(row);
        });

        for (const [raceId, rows] of m.entries()) {
            rows.sort((a, b) => {
                const d = divisionRank(a.division) - divisionRank(b.division);
                if (d !== 0) return d;
                return toCarNumberInt(a.carNumber) - toCarNumberInt(b.carNumber);
            });
            m.set(raceId, rows);
        }

        return m;
    }, [hydratedRows]);

    const sortedRaceIds = useMemo(() => {
        const ids = Array.from(regsByRace.keys());
        ids.sort((a, b) => {
            const ra = racesById.get(a);
            const rb = racesById.get(b);
            const da = ra?.raceDate ? new Date(ra.raceDate).getTime() : 0;
            const db = rb?.raceDate ? new Date(rb.raceDate).getTime() : 0;
            return da - db;
        });
        return ids;
    }, [regsByRace, racesById]);

    // ---------------------------
    // Delete (ADMIN)
    // ---------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this registration?")) return;

        if (!id) {
            console.error("Delete blocked: missing registration id");
            alert("❌ Cannot delete: missing registration id from API.");
            return;
        }

        try {
            await apiClient.delete(`/admin/registrations/${id}`); // => /api/admin/registrations/{id}
            setRegistrations((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Error deleting registration:", err);
            alert("❌ Failed to delete registration.");
        }
    };

    // ---------------------------
    // Print sign-in sheet
    // ---------------------------
    const printSignInSheet = (raceId, divisionFilter = "All Divisions") => {
        const race = racesById.get(Number(raceId));
        const raceTitle = race?.raceName || race?.name || `Race #${raceId}`;
        const raceDate = race?.raceDate ? formatRaceDate(race.raceDate) : "";

        let rows = (regsByRace.get(Number(raceId)) || []).slice();

        if (divisionFilter !== "All Divisions") {
            rows = rows.filter((r) => r.division === divisionFilter);
        }

        rows.sort((a, b) => {
            const d = divisionRank(a.division) - divisionRank(b.division);
            if (d !== 0) return d;
            return toCarNumberInt(a.carNumber) - toCarNumberInt(b.carNumber);
        });

        const html = `
<!doctype html>
<html>
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
      <div><b>Date:</b> ${raceDate || "-"}</div>
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
                        (r) => `
          <tr>
            <td>${r.racerName || "-"}</td>
            <td>${r.carNumber ? `#${String(r.carNumber).replace(/^#/, "")}` : "-"}</td>
            <td>${r.division || "-"}</td>
            <td>${r.parentEmail || "-"}</td>
            <td></td>
            <td><span class="checkbox"></span></td>
          </tr>
        `
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
                <div className="registrations-header">
                    <div>
                        <h1 style={{ marginBottom: 6 }}>Registrations</h1>
                        <p style={{ margin: 0, color: "#666" }}>
                            Admin view: print sign-in sheets and manage registrations.
                        </p>
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
                        const raceDate = race?.raceDate ? formatRaceDate(race.raceDate) : "";
                        const rows = regsByRace.get(Number(raceId)) || [];

                        const selectedDivision = divisionFilterByRace[raceId] || "All Divisions";

                        const filteredRows =
                            selectedDivision === "All Divisions"
                                ? rows
                                : rows.filter((r) => r.division === selectedDivision);

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
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "12px",
                                        flexWrap: "wrap",
                                        marginTop: "10px",
                                    }}
                                >
                                    <select
                                        value={selectedDivision}
                                        onChange={(e) =>
                                            setDivisionFilterByRace((prev) => ({
                                                ...prev,
                                                [raceId]: e.target.value,
                                            }))
                                        }
                                        style={{
                                            padding: "8px 10px",
                                            borderRadius: "8px",
                                            border: "1px solid #bbb",
                                            background: "#fff",
                                            minWidth: "220px",
                                        }}
                                    >
                                        {getDivisionsForRace(rows).map((div) => (
                                            <option key={div} value={div}>
                                                {div}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        className="add-btn"
                                        style={{
                                            background: "#f3f3f3",
                                            color: "#111",
                                            border: "1px solid #bbb",
                                        }}
                                        onClick={() => printSignInSheet(raceId, selectedDivision)}
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
                                    {filteredRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="5">No registrations for this race yet.</td>
                                        </tr>
                                    ) : (
                                        filteredRows.map((r) => (
                                            <tr key={r.id}>
                                                <td>{r.racerName || "-"}</td>
                                                <td>
                                                    {r.carNumber
                                                        ? `#${String(r.carNumber).replace(/^#/, "")}`
                                                        : "-"}
                                                </td>
                                                <td>{r.division || "-"}</td>
                                                <td>{r.parentEmail || "-"}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(r.id)}
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