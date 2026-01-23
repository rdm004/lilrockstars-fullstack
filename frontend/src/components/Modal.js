// src/components/Modal.js
import React, { useEffect, useMemo, useRef } from "react";
import "../styles/Modal.css";

const Modal = ({
                   title,
                   isOpen,
                   onClose,
                   children,
                   onSubmit,
                   submitLabel,
                   submitDisabled = false, // preferred
                   disableSubmit = false,  // backwards-compatible
               }) => {
    // ✅ Hooks must be called unconditionally (always at top-level)
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);
    const lastActiveElementRef = useRef(null);

    const isDisabled = useMemo(() => {
        return Boolean(submitDisabled || disableSubmit);
    }, [submitDisabled, disableSubmit]);

    // ✅ Manage focus when modal opens/closes
    useEffect(() => {
        if (!isOpen) return;

        // Store the element that was focused before opening
        lastActiveElementRef.current = document.activeElement;

        // Focus the close button first (or modal container)
        const focusTarget = closeBtnRef.current || modalRef.current;
        if (focusTarget) focusTarget.focus();

        // Prevent background scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;

            // Restore focus to the element that opened the modal
            const prev = lastActiveElementRef.current;
            if (prev && typeof prev.focus === "function") {
                prev.focus();
            }
        };
    }, [isOpen]);

    // ✅ ESC closes modal
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose?.();
            }

            // Basic focus trap with Tab / Shift+Tab
            if (e.key === "Tab" && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (!focusable.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    // ✅ If closed, render nothing (safe because hooks already ran above)
    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            role="presentation"
            onMouseDown={(e) => {
                // click outside closes
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div
                className="modal-content"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label={title || "Dialog"}
                tabIndex={-1}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        type="button"
                        ref={closeBtnRef}
                        aria-label="Close dialog"
                    >
                        ✖
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isDisabled) onSubmit?.();
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
                            aria-disabled={isDisabled}
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