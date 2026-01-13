import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const DeleteRacerConfirmModal = ({
                                     isOpen,
                                     onClose,
                                     onConfirm,
                                     racerName = "this racer",
                                     racerId,
                                     counts = null, // optional: { registrations: number, results: number, links: number }
                                 }) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (isOpen) setChecked(false);
    }, [isOpen]);

    const registrationsText =
        counts?.registrations != null ? `${counts.registrations} registration(s)` : "All registrations";
    const resultsText =
        counts?.results != null ? `${counts.results} result record(s)` : "All race results";
    const linksText =
        counts?.links != null ? `${counts.links} linked parent relationship(s)` : "All linked parent relationships";

    return (
        <Modal
            title="⚠️ Delete Racer - Permanent Action"
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={() => checked && onConfirm(racerId)}
            submitLabel="Delete Racer"
            disableSubmit={!checked}
        >
            <div style={{ lineHeight: 1.5 }}>
                <p style={{ marginTop: 0 }}>
                    You are about to permanently delete <b>{racerName}</b>.
                </p>

                <div
                    style={{
                        background: "#fff7ed",
                        border: "1px solid #fdba74",
                        padding: "12px",
                        borderRadius: "8px",
                        margin: "12px 0",
                    }}
                >
                    <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
                        This will permanently remove:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        <li><b>{registrationsText}</b> for this racer (they will no longer appear in sign-in sheets)</li>
                        <li><b>{resultsText}</b> for this racer (standings/leaderboards may change)</li>
                        <li><b>{linksText}</b> (co-parent/linked accounts will lose access)</li>
                    </ul>

                    <p style={{ margin: "10px 0 0", fontSize: "0.9rem", color: "#7c2d12" }}>
                        This action cannot be undone.
                    </p>
                </div>

                <label style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        style={{ marginTop: "4px" }}
                    />
                    <span>
            I understand deleting this racer will remove registrations, results, and linked access.
          </span>
                </label>
            </div>
        </Modal>
    );
};

export default DeleteRacerConfirmModal;