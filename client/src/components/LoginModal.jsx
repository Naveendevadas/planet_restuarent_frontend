import { useState } from "react";

const C = {
  green:      "#0D2B1E",
  greenMid:   "#163d2a",
  gold:       "#F5C97A",
  goldDark:   "#c9a34e",
  goldLight:  "#fde6aa",
  cream:      "#fdf6e3",
};

export default function LoginModal({ onClose, onSuccess }) {
  const [mode, setMode]             = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const switchMode = (m) => {
    setMode(m);
    setIdentifier("");
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(245,201,122,.2)",
    color: C.cream,
    padding: "13px 16px",
    fontFamily: "'Jost', sans-serif",
    fontSize: 14,
    fontWeight: 300,
    outline: "none",
    marginBottom: 14,
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: C.goldDark,
    marginBottom: 8,
    display: "block",
  };

  const handleSubmit = async () => {
    if (mode === "signup") {
      if (!name.trim())             { setError("Please enter your name."); return; }
      if (!identifier.trim())       { setError("Please enter your phone number."); return; }
      if (!password)                { setError("Please enter your password."); return; }
      if (password.length < 6)      { setError("Password must be at least 6 characters."); return; }
    } else {
      if (!identifier.trim())       { setError("Please enter your email or phone number."); return; }
      if (!password)                { setError("Please enter your password."); return; }
    }

    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          ...(mode === "signup" && { name }),
          ...(mode === "signup" && email.trim() && { email }),
        }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.role ?? "customer");
        if (data.token) localStorage.setItem("token", data.token);

        if (mode === "signup" || data.role === "customer") {
          window.location.href = "/account";
        } else if (["admin", "super_admin", "staff"].includes(data.role)) {
          window.location.href = "/admin";
        }

        onSuccess();
        onClose();
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.green,
          border: "1px solid rgba(245,201,122,.2)",
          padding: "48px 44px",
          width: "100%",
          maxWidth: 440,
          position: "relative",
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {/* Corner decoration */}
        <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:`linear-gradient(to bottom,${C.gold},transparent)` }}/>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 18, right: 20,
            background: "none", border: "none",
            color: "rgba(245,201,122,.5)", fontSize: 20, cursor: "pointer",
            lineHeight: 1,
          }}
        >✕</button>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize:10, letterSpacing:5, textTransform:"uppercase", color:C.gold, display:"block", marginBottom:10 }}>
            {mode === "login" ? "Welcome Back" : "Get Started"}
          </span>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:26, color:C.gold, fontWeight:600, marginBottom:6 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </div>
          <p style={{ fontSize:13, color:"rgba(253,246,227,.38)", fontWeight:300 }}>
            {mode === "login"
              ? "Enter your credentials to continue"
              : "Fill in your details to get started"}
          </p>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${C.goldDark})` }}/>
          <div style={{ width:6, height:6, background:C.gold, transform:"rotate(45deg)" }}/>
          <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${C.goldDark})` }}/>
        </div>

        {/* Name — signup only */}
        {mode === "signup" && (
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              style={inputStyle}
            />
          </div>
        )}

        {/* Phone — signup: required | login: email or phone */}
        <div>
          <label style={labelStyle}>
            {mode === "signup" ? "Phone Number *" : "Email or Phone Number *"}
          </label>
          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder={mode === "signup" ? "+91 XXXXX XXXXX" : "email@example.com or +91 XXXXX XXXXX"}
            style={inputStyle}
          />
        </div>

        {/* Email — signup only, optional */}
        {mode === "signup" && (
          <div>
            <label style={labelStyle}>Email Address <span style={{ color:"rgba(245,201,122,.4)", fontSize:9 }}>(optional)</span></label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
              style={inputStyle}
            />
          </div>
        )}

        {/* Password */}
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>Password *</label>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
            style={{ ...inputStyle, paddingRight: 44 }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={() => setShowPass(v => !v)}
            style={{
              position: "absolute", right: 14, top: 34,
              background: "none", border: "none",
              color: "rgba(245,201,122,.45)", cursor: "pointer",
              fontSize: 13, letterSpacing: 0.5,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        {/* Forgot password — login only */}
        {mode === "login" && (
          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>
            <button
              style={{
                background: "none", border: "none", padding: 0,
                color: "rgba(245,201,122,.45)", fontSize: 12,
                cursor: "pointer", letterSpacing: 0.5,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ fontSize:13, color:"#f5a5a5", marginBottom:14 }}>{error}</div>
        )}

        {/* Primary button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "rgba(245,201,122,.55)" : C.gold,
            border: "none",
            color: C.green,
            padding: "16px",
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            cursor: loading ? "wait" : "pointer",
            transition: "all .3s",
            marginBottom: 20,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.goldLight; }}
          onMouseLeave={e => { e.currentTarget.style.background = loading ? "rgba(245,201,122,.55)" : C.gold; }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {/* Bottom toggle */}
        <p style={{ fontSize:12, color:"rgba(253,246,227,.35)", textAlign:"center", letterSpacing:.5, margin:0 }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                style={{
                  background:"none", border:"none", padding:0,
                  color: C.gold, fontSize:12, cursor:"pointer",
                  letterSpacing:.5, fontFamily:"'Jost',sans-serif",
                  textDecoration:"underline",
                }}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => switchMode("login")}
                style={{
                  background:"none", border:"none", padding:0,
                  color: C.gold, fontSize:12, cursor:"pointer",
                  letterSpacing:.5, fontFamily:"'Jost',sans-serif",
                  textDecoration:"underline",
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}