// frontend/src/pages/RegistrationsManagement.js (ADMIN)
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/RegistrationsManagement.css";

const DIVISION_ORDER = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
];

const RegistrationsManagement = () => {
    const [rows, setRows] = useState([]); // flat rows from /api/admin/registrations
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatRaceDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
    };

    const normalizeDivision = (d) => (d || "").trim();

    const divisionSortValue = (division) => {
        const idx = DIVISION_ORDER.indexOf(division);
        return idx === -1 ? 999 : idx;
    };

    const safeCarNumber = (carNumber) => {
        // Helps sort numbers like "07" and "7" and also handles "A7"
        const s = String(carNumber ?? "").trim();
        const n = parseInt(s, 10);
        return Number.isFinite(n) ? n : 99999; // non-numeric pushes to bottom
    };

    const fetchAdminRegistrations = async () => {
        try {
            setLoading(true);
            setError("");

            // EXPECTED backend fields (recommended):
            // { id, raceId, raceName, raceDate, racerId, racerName, carNumber, division, parentEmail }
            const res = await apiClient.get("/admin/registrations");
            setRows(res.data || []);
        } catch (e) {
            console.error("Failed to load admin registrations:", e);
            setError("Could not load registrations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAdminRegistrations();
    }, []);

    // Group registrations by race
    const races = useMemo(() => {
        const map = new Map();

        (rows || []).forEach((r) => {
            const raceKey = r.raceId ?? r.raceName ?? "unknown";
            if (!map.has(raceKey)) {
                map.set(raceKey, {
                    raceId: r.raceId ?? null,
                    raceName: r.raceName || "Unknown Race",
                    raceDate: r.raceDate || null,
                    registrations: [],
                });
            }
            map.get(raceKey).registrations.push(r);
        });

        // sort races by date asc
        const arr = Array.from(map.values());
        arr.sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0));
        return arr;
    }, [rows]);

    // Delete a registration row (admin)
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this registration?")) return;
        try {
            await apiClient.delete(`/admin/registrations/${id}`);
            setRows((prev) => prev.filter((x) => x.id !== id));
        } catch (e) {
            console.error("Delete failed:", e);
            alert("❌ Failed to delete registration.");
        }
    };

    // ✅ PRINT HELPERS
    const buildPrintHtml = ({ raceName, raceDate, registrations }) => {
        // sort by division, then car number, then racer name
        const sorted = (registrations || [])
            .slice()
            .map((r) => ({
                ...r,
                division: normalizeDivision(r.division),
                carNumberStr: String(r.carNumber ?? "").trim(),
            }))
            .sort((a, b) => {
                const dA = divisionSortValue(a.division);
                const dB = divisionSortValue(b.division);
                if (dA !== dB) return dA - dB;

                const cA = safeCarNumber(a.carNumberStr);
                const cB = safeCarNumber(b.carNumberStr);
                if (cA !== cB) return cA - cB;

                return String(a.racerName || "").localeCompare(String(b.racerName || ""));
            });

        // group by division for printing
        const byDivision = new Map();
        sorted.forEach((r) => {
            const div = r.division || "Other";
            if (!byDivision.has(div)) byDivision.set(div, []);
            byDivision.get(div).push(r);
        });

        const divBlocks = Array.from(byDivision.entries())
            .sort((a, b) => divisionSortValue(a[0]) - divisionSortValue(b[0]))
            .map(([div, list]) => {
                const rowsHtml = list
                    .map((r, idx) => {
                        const car = String(r.carNumber ?? "").trim();
                        const name = r.racerName || "";
                        const parent = r.parentEmail || r.parentName || "";
                        return `
              <tr>
                <td class="num">${idx + 1}</td>
                <td class="car">${car ? "#" + car : "-"}</td>
                <td class="name">${escapeHtml(name)}</td>
                <td class="parent">${escapeHtml(parent)}</td>
                <td class="check"></td>
              </tr>
            `;
                    })
                    .join("");

                return `
          <section class="division">
            <h2>${escapeHtml(div)}</h2>
            <table>
              <thead>
                <tr>
                  <th class="num">#</th>
                  <th class="car">Car</th>
                  <th>Name</th>
                  <th class="parent">Parent</th>
                  <th class="check">Check-In</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `<tr><td colspan="5" class="empty">No racers in this division.</td></tr>`}
              </tbody>
            </table>
          </section>
        `;
            })
            .join("");

        return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(raceName)} - Sign In Sheet</title>
  <style>
    @page { margin: 0.6in; }
    body { font-family: Arial, sans-serif; color: #111; }
    .header { text-align: center; margin-bottom: 14px; }
    .header h1 { margin: 0 0 4px; font-size: 20px; }
    .header p { margin: 0; color: #444; font-size: 13px; }
    .division { margin-top: 16px; page-break-inside: avoid; }
    .division h2 { margin: 0 0 8px; font-size: 16px; border-bottom: 2px solid #f47c2a; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
    th { background: #f47c2a; color: #fff; text-align: left; }
    .num { width: 40px; text-align: center; }
    .car { width: 70px; text-align: center; }
    .parent { width: 220px; }
    .check { width: 90px; }
    .empty { text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(raceName)}</h1>
    <p>${raceDate ? escapeHtml(formatRaceDate(raceDate)) : ""}</p>
    <p>Sign-In Sheet (sorted by Division, then Car #)</p>
  </div>

  ${divBlocks}
</body>
</html>
    `;
    };

    const openPrintWindow = (raceObj) => {
        const html = buildPrintHtml(raceObj);
        const w = window.open("", "_blank", "width=980,height=720");
        if (!w) {
            alert("Popup blocked. Please allow popups for this site to print.");
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();

        // Give the browser a beat to render before printing
        setTimeout(() => {
            w.print();
            // Optional: w.close();
        }, 250);
    };

    return (
        <Layout title="Registrations Management">
            <div className="registrations-container">
                <div className="registrations-header">
                    <h1>Registrations</h1>
                    <p>Admin view: print sign-in sheets and manage registrations.</p>
                </div>

                {loading && <p className="loading">Loading registrations...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && races.length === 0 && <p>No registrations found.</p>}

                {!loading && !error && races.map((race) => (
                    <div key={race.raceId ?? race.raceName} className="race-reg-block">
                        <div className="race-reg-header">
                            <h2 className="race-title">{race.raceName}</h2>
                            {race.raceDate && <p className="race-date">{formatRaceDate(race.raceDate)}</p>}

                            <button
                                type="button"
                                className="print-btn"
                                onClick={() => openPrintWindow(race)}
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
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {race.registrations.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.racerName || "-"}</td>
                                    <td>{r.carNumber ? `#${r.carNumber}` : "-"}</td>
                                    <td>{r.division || "-"}</td>
                                    <td>{r.parentEmail || r.parentName || "-"}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => handleDelete(r.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export default RegistrationsManagement;