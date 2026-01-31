import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/AdminAuditLog.css";

const fmt = (iso) => {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
};

export default function AdminAuditLog() {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(25);

    const [data, setData] = useState(null); // Spring Page object
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const totalPages = data?.totalPages ?? 0;
    const content = data?.content ?? [];

    const canPrev = page > 0;
    const canNext = page + 1 < totalPages;

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        params.set("page", String(page));
        params.set("size", String(size));
        return params.toString();
    }, [q, page, size]);

    const fetchAudit = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await apiClient.get(`/admin/audit?${queryParams}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load audit log.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAudit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const onSubmitSearch = (e) => {
        e.preventDefault();
        setPage(0); // reset paging when searching
        // no need to manually call fetchAudit; queryParams change triggers it,
        // but it doesn't hurt—keeping it clean:
        void fetchAudit();
    };

    return (
        <Layout title="Admin Audit Log">
            <div className="audit-container">
                <div className="audit-header">
                    <div>
                        <h1 style={{ margin: 0 }}>Audit Log</h1>
                        <p className="audit-subtitle">
                            Admin changes to racers, races, registrations, and results (latest first).
                        </p>
                    </div>

                    <form className="audit-search" onSubmit={onSubmitSearch}>
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search admin, path, method, status, details…"
                            aria-label="Search audit log"
                        />
                        <button type="submit">Search</button>

                        <select
                            value={size}
                            onChange={(e) => {
                                setPage(0);
                                setSize(Number(e.target.value));
                            }}
                            aria-label="Rows per page"
                            title="Rows per page"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </form>
                </div>

                {/* ✅ Removed Clear button per request */}
                <div className="audit-actions">
                    <div className="audit-pager">
                        <button
                            type="button"
                            disabled={!canPrev}
                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        >
                            ← Prev
                        </button>

                        <span className="audit-pageinfo">
              Page <b>{page + 1}</b> of <b>{Math.max(totalPages, 1)}</b>
            </span>

                        <button
                            type="button"
                            disabled={!canNext}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="audit-loading">Loading…</p>
                ) : error ? (
                    <p className="audit-error">{error}</p>
                ) : (
                    <div className="table-scroll" role="region" aria-label="Audit log table" tabIndex={0}>
                        <table className="audit-table">
                            <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>Admin</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Path</th>
                                <th>Details</th>
                            </tr>
                            </thead>
                            <tbody>
                            {content.length === 0 ? (
                                <tr>
                                    <td colSpan="6">No audit events found.</td>
                                </tr>
                            ) : (
                                content.map((row) => (
                                    <tr key={row.id}>
                                        <td>{fmt(row.createdAt)}</td>
                                        <td>{row.actorEmail || "-"}</td>

                                        <td>
                        <span className={`pill pill-${String(row.method || "").toUpperCase()}`}>
                          {row.method || "-"}
                        </span>
                                        </td>

                                        <td>
                        <span className={`pill pill-status-${row.status >= 400 ? "bad" : "ok"}`}>
                          {row.status}
                        </span>
                                        </td>

                                        <td className="mono">{row.path || "-"}</td>

                                        {/* ✅ NEW: note/details from backend */}
                                        <td title={row.note || ""}>{row.note || "-"}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}