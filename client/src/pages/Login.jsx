import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import partnersData from "../data/partners.json";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendOtp, verifyOtp, user } = useAuth();
  const gender = searchParams.get("gender") || "";

  const [mode, setMode] = useState("select");
  const [partners, setPartners] = useState(() => {
    const all = partnersData[gender] || [];
    return all.map((p) => ({ name: p.name, email: p.email }));
  });
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (gender) {
      const local = partnersData[gender] || [];
      setPartners(local.map((p) => ({ name: p.name, email: p.email })));
      fetch(`/api/partners/${gender}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.partners) {
            const merged = [
              ...local.map((p) => ({ name: p.name, email: p.email })),
            ];
            data.partners.forEach((p) => {
              if (!merged.find((m) => m.email === p.email)) {
                merged.push({ name: p.name, email: p.email });
              }
            });
            setPartners(merged);
          }
        })
        .catch(() => {});
    }
  }, [gender]);

  useEffect(() => {
    setFiltered(
      partners.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, partners]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  const selectName = (name, partnerEmail) => {
    setSelectedName(name);
    setSelectedEmail(partnerEmail);
    setSearch(name);
    setIsOpen(false);
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    let targetEmail = "";
    if (mode === "select") {
      if (!selectedName) {
        setError("Please select your name from the list");
        return;
      }
      if (!selectedEmail) {
        setError("Email not found for this name");
        return;
      }
      targetEmail = selectedEmail;
    } else {
      if (!email) {
        setError("Please enter your email");
        return;
      }
      targetEmail = email;
    }
    setLoading(true);
    try {
      await sendOtp(targetEmail);
      setEmail(targetEmail);
      setMessage("OTP sent to your email! Check your inbox.");
      setMode("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    const targetEmail = email || selectedEmail;
    setLoading(true);
    try {
      await verifyOtp(targetEmail, otp, { gender });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const startWithName = () => {
    setMode("select");
    setEmail("");
    setOtp("");
    setError("");
    setMessage("");
  };

  const startWithEmail = () => {
    setMode("email");
    setSelectedName("");
    setSelectedEmail("");
    setSearch("");
    setOtp("");
    setError("");
    setMessage("");
  };

  if (!gender) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-text">HeartSync</div>
          <p className="subtitle">
            Please go back and select your gender first
          </p>
          <a
            href="/"
            className="link-btn"
            style={{ textDecoration: "underline" }}
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-text">HeartSync</div>
        <h1>Welcome Back</h1>
        <p className="subtitle">
          Logging in as {gender === "boys" ? "a Boy" : "a Girl"}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {mode === "otp" ? (
          <form onSubmit={handleVerifyOtp}>
            <p
              style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}
            >
              An OTP was sent to{" "}
              <strong>
                {email || selectedEmail}. Please Check your spam folder if you
                don't see it.
              </strong>
            </p>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit code"
                autoComplete="off"
                required
                maxLength={6}
                style={{
                  fontSize: "24px",
                  letterSpacing: "8px",
                  textAlign: "center",
                }}
              />
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              <button
                type="button"
                onClick={() => {
                  setMode("select");
                  setOtp("");
                  setError("");
                  setMessage("");
                  setEmail("");
                  setSelectedName("");
                  setSelectedEmail("");
                }}
                className="link-btn"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                }}
              >
                Change email / name
              </button>
            </p>
          </form>
        ) : (
          <>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <button
                type="button"
                className={`tab-btn ${mode === "select" ? "active" : ""}`}
                onClick={startWithName}
                style={{ flex: 1 }}
              >
                Select my name
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === "email" ? "active" : ""}`}
                onClick={startWithEmail}
                style={{ flex: 1 }}
              >
                Enter email
              </button>
            </div>

            {mode === "select" && (
              <div className="form-group" ref={dropdownRef}>
                <label>Your Name</label>
                <div className="search-dropdown">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search your name..."
                    autoComplete="off"
                  />
                  {isOpen && (
                    <div className="dropdown-list open">
                      {filtered.length === 0 ? (
                        <div className="dropdown-item no-result">
                          No names found
                        </div>
                      ) : (
                        filtered.map((p) => (
                          <div
                            key={p.name}
                            className={`dropdown-item ${selectedName === p.name ? "selected" : ""}`}
                            onClick={() => selectName(p.name, p.email)}
                          >
                            {p.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {selectedName && (
                  <p
                    className="field-hint"
                    style={{ color: "#e74c3c", fontWeight: 600 }}
                  >
                    Selected: {selectedName} ({selectedEmail})
                  </p>
                )}
                <button
                  type="button"
                  className="submit-btn"
                  disabled={loading || !selectedName}
                  onClick={handleSendOtp}
                  style={{ marginTop: "12px" }}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}

            {mode === "email" && (
              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <p
                  style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}
                >
                  If your name is in our records, use "Select my name" above
                  instead.
                </p>
                <button
                  type="button"
                  className="submit-btn"
                  disabled={loading || !email}
                  onClick={handleSendOtp}
                  style={{ marginTop: "8px" }}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
