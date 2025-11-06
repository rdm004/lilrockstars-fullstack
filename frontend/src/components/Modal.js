import React from "react";
import "../styles/Modal.css";

const Modal = ({ title, isOpen, onClose, children, onSubmit, submitLabel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose}>
                        ✖
                    </button>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="modal-body">{children}</div>
                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            {submitLabel || "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;