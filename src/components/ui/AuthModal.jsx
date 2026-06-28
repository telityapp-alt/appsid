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
    <div className="retro-backdrop-center" onClick={onClose}>
      <div className="auth-window" onClick={(e) => e.stopPropagation()}>
        {/* Title bar — same as RetroPopover */}
        <div
          className="retro-titlebar"
          style={{ borderRadius: "12px 12px 0 0" }}
        >
          <div className="retro-titlebar-left">
            <div className="pop-dots">
              <button
                className="pop-dot pop-dot-close"
                onClick={onClose}
                aria-label="Tutup"
              />
              <button className="pop-dot pop-dot-min" aria-label="Minimise" />
              <button className="pop-dot pop-dot-max" aria-label="Maximise" />
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span className="pop-tb-brand">Apphunt</span>
            <span className="pop-tb-sep">—</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#55606d" }}>
              {mode === "signin" ? "Masuk" : "Daftar"}
            </span>
          </div>
          {/* spacer to balance the dots */}
          <div style={{ width: 13 * 3 + 7 * 2 }} />
        </div>

        {/* Body */}
        <div className="auth-window-body">
          {/* Heading */}
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0d1d38",
                letterSpacing: "-0.03em",
                margin: "0 0 4px",
                lineHeight: 1.2,
              }}
            >
              {mode === "signin" ? "Masuk ke akun" : "Buat akun baru"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#7b8594",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {mode === "signin"
                ? "Lanjutkan ke Apphunt"
                : "Bergabung dengan komunitas Apphunt"}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Nama lengkap</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="email@kamu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === "signin"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder={
                  mode === "signup" ? "Minimal 6 karakter" : "••••••••"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#fff3f3",
                  border: "1px solid #f5c6c6",
                  color: "#c0392b",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#f0faf0",
                  border: "1px solid #b6e2b6",
                  color: "#1e7e34",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="cta-button"
              disabled={loading}
              style={{
                width: "100%",
                height: 38,
                fontSize: 14,
                marginTop: 2,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Memproses..."
                : mode === "signin"
                  ? "Masuk"
                  : "Buat akun"}
            </button>
          </form>

          {/* Switch mode */}
          <p
            style={{
              fontSize: 12,
              color: "#7b8594",
              fontWeight: 600,
              margin: 0,
              textAlign: "center",
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
                  style={linkBtnStyle}
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
                  style={linkBtnStyle}
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#55606d",
  letterSpacing: "0.01em",
};

const inputStyle = {
  height: 38,
  padding: "0 12px",
  borderRadius: 8,
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

const linkBtnStyle = {
  background: "none",
  border: "none",
  color: "#f6a61e",
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
  fontSize: 12,
};
