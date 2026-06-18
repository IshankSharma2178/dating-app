import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendOtp, verifyOtp, user } = useAuth();
  const gender = searchParams.get("gender") || "";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  if (!gender) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-text">HeartSync</div>
          <p className="subtitle">Please go back and select your gender first</p>
          <a href="/" className="link-btn" style={{ textDecoration: "underline" }}>Back to home</a>
        </div>
      </div>
    );
  }

  const handleSendOtp = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendOtp(email);
      setMessage("OTP sent to your email! Check your inbox.");
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { setError("Please enter the OTP"); return; }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await verifyOtp(email, otp, { gender });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-text">HeartSync</div>
        <h1>Welcome</h1>
        <p className="subtitle">Logging in as {gender === "boys" ? "a Boy" : "a Girl"}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {showOtp ? (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
              An OTP was sent to <strong>{email}</strong>. Please check your spam folder if you don't see it.
            </p>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                autoComplete="off"
                required
                maxLength={6}
                style={{ fontSize: "24px", letterSpacing: "8px", textAlign: "center" }}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              <button type="button" onClick={() => { setShowOtp(false); setOtp(""); setError(""); setMessage(""); }} className="link-btn" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                Change email
              </button>
            </p>
          </form>
        ) : (
          <div className="form-group">
            <label>Your Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            <button type="button" className="submit-btn" disabled={loading || !email} onClick={handleSendOtp} style={{ marginTop: "12px" }}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
