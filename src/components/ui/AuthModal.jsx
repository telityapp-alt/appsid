import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { signIn, signUp } = useAuth();

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        onClose();
      } else {
        await signUp(email, password, { full_name: name });
        setSuccess("Akun berhasil dibuat! Cek email kamu untuk konfirmasi.");
      }
    } catch (err) {
      setError(err.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(21,19,16,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fffdf8",
          border: "1.5px solid #d9d1c2",
          borderBottomWidth: 3,
          borderRadius: 14,
          boxShadow:
            "inset 0 -3px 0 rgba(21,19,16,.09), 0 8px 40px rgba(21,19,16,.18)",
          width: "100%",
          maxWidth: 400,
          padding: "32px 32px 28px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: 7,
            border: "1px solid #d9d1c2",
            background: "#f5f2ec",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#55606d",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0d1d38",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {mode === "signin" ? "Masuk ke akun" : "Buat akun baru"}
          </h2>
        </div>

        {/* Mode toggle tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 24,
            background: "#f5f2ec",
            border: "1px solid #d9d1c2",
            borderRadius: 9,
            padding: 4,
          }}
        >
          {[
            { key: "signin", label: "Masuk" },
            { key: "signup", label: "Daftar" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setError(null);
                setSuccess(null);
              }}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 7,
                border:
                  mode === key ? "1px solid #c7820e" : "1px solid transparent",
                background: mode === key ? "#f6a61e" : "transparent",
                boxShadow: mode === key ? "inset 0 -2px 0 #cf860d" : "none",
                fontSize: 14,
                fontWeight: 800,
                color: mode === key ? "#111" : "#55606d",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                transition: "all 120ms ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {mode === "signup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#29405f",
                  letterSpacing: "-0.01em",
                }}
              >
                Nama lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#29405f",
                letterSpacing: "-0.01em",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#29405f",
                letterSpacing: "-0.01em",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "signup" ? "Minimal 8 karakter" : "Password kamu"
              }
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #f5b8b8",
                background: "#fef2f2",
                fontSize: 13,
                fontWeight: 600,
                color: "#a03030",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #a3e4c6",
                background: "#edfaf4",
                fontSize: 13,
                fontWeight: 600,
                color: "#1a6b48",
              }}
            >
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="cta-button"
            disabled={loading}
            style={{
              width: "100%",
              height: 42,
              fontSize: 15,
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Memproses..."
              : mode === "signin"
                ? "Masuk"
                : "Buat akun"}
          </button>
        </form>

        {/* Footer note */}
        <p
          style={{
            fontSize: 12,
            color: "#7b8594",
            textAlign: "center",
            margin: "18px 0 0",
            lineHeight: 1.5,
          }}
        >
          {mode === "signin" ? (
            <>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f6a61e",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 12,
                }}
              >
                Daftar sekarang
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f6a61e",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 12,
                }}
              >
                Masuk
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

const inputStyle = {
  height: 40,
  padding: "0 12px",
  borderRadius: 9,
  border: "1.5px solid #d9d1c2",
  background: "#faf8f4",
  fontSize: 14,
  fontWeight: 600,
  color: "#0d1d38",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 120ms ease",
};
