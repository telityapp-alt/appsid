import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

export const ToastContext = createContext(null);

let nextId = 1;

function toastReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = nextId++;
    dispatch({ type: "ADD", toast: { id, message, type, duration } });
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ── Toast item component ───────────────────────────────────────────────────

const TYPE_STYLES = {
  success: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#166534",
    icon: "✓",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    icon: "✕",
    role: "alert",
  },
  info: {
    background: "#fffdf8",
    border: "1px solid #f6a61e",
    color: "#92400e",
    icon: "ℹ",
  },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef(null);
  const styles = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info;

  // Mount animation
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Auto-dismiss
  React.useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 3500);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, toast.duration, onRemove]);

  function handleClose() {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }

  return (
    <div
      role={styles.role ?? "status"}
      aria-live={styles.role === "alert" ? "assertive" : "polite"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow:
          "0 4px 12px rgba(21,19,16,.12), inset 0 -2px 0 rgba(21,19,16,.06)",
        minWidth: 240,
        maxWidth: 380,
        pointerEvents: "auto",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        fontFamily: "inherit",
        background: styles.background,
        border: styles.border,
        color: styles.color,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        opacity: visible ? 1 : 0,
        transition: "transform 240ms cubic-bezier(.22,1,.36,1), opacity 240ms ease",
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{styles.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={handleClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 2px",
          color: styles.color,
          opacity: 0.6,
          fontSize: 14,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Toast container — fixed top-right ─────────────────────────────────────

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="toast-container"
      aria-label="Notifikasi"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
        width: "max-content",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
