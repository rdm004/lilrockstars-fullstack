import React, { useEffect, useMemo, useRef } from "react";
import "../styles/Modal.css";

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(",");

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
    if (!isOpen) return null;

    const isDisabled = submitDisabled || disableSubmit;

    const overlayRef = useRef(null);
    const contentRef = useRef(null);
    const previouslyFocusedElRef = useRef(null);

    const titleId = useMemo(() => {
        const safe = String(title || "modal")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        return `modal-title-${safe}-${Math.random().toString(16).slice(2)}`;
    }, [title]);

    // Open: store previous focus, move focus into modal, prevent background scroll
    useEffect(() => {
        previouslyFocusedElRef.current = document.activeElement;

        // prevent background scroll
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // focus first focusable element, else focus content container
        const focusTimer = window.setTimeout(() => {
            const root = contentRef.current;
            if (!root) return;

            const focusables = root.querySelectorAll(FOCUSABLE_SELECTOR);
            if (focusables.length > 0) {
                focusables[0].focus();
            } else {
                root.focus();
            }
        }, 0);

        return () => {
            window.clearTimeout(focusTimer);
            document.body.style.overflow = prevOverflow;

            // restore focus
            const prev = previouslyFocusedElRef.current;
            if (prev && typeof prev.focus === "function") {
                prev.focus();
            }
        };
    }, [isOpen]);

    // ESC closes + focus trap
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose?.();
                return;
            }

            if (e.key !== "Tab") return;

            const root = contentRef.current;
            if (!root) return;

            const focusables = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR))
                .filter((el) => !el.hasAttribute("disabled"));

            if (focusables.length === 0) {
                e.preventDefault();
                root.focus();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (e.shiftKey) {
                // Shift+Tab
                if (active === first || !root.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab
                if (active === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [onClose]);

    // Close when clicking overlay (but not when clicking inside content)
    const handleOverlayMouseDown = (e) => {
        if (e.target === overlayRef.current) {
            onClose?.();
        }
    };

    return (
        <div
            className="modal-overlay"
            ref={overlayRef}
            onMouseDown={handleOverlayMouseDown}
            aria-hidden="false"
        >
            <div
                className="modal-content"
                ref={contentRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <div className="modal-header">
                    <h2 id={titleId}>{title}</h2>
                    <button className="close-btn" onClick={onClose} type="button" aria-label="Close dialog">
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