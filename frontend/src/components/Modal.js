import React from "react";
import "../styles/Modal.css";

const Modal = ({
                   title,
                   isOpen,
                   onClose,
                   children,
                   onSubmit,
                   submitLabel,
                   submitDisabled = false, // ✅ preferred
                   disableSubmit = false,  // ✅ backwards-compatible (your DeleteRacerConfirmModal uses this)
               }) => {
    if (!isOpen) return null;

    // Use either prop
    const isDisabled = submitDisabled || disableSubmit;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose} type="button">
                        ✖
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isDisabled) onSubmit();
                    }}
                >
                    <div className="modal-body">{children}</div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isDisabled}
                            style={isDisabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                        >
                            {submitLabel || "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;