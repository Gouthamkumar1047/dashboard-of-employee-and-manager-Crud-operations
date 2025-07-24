import React, { useState } from "react";
import axios from "axios";
import "../styles/LoginRegister.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendCode = async () => {
    if (!phone) return setMessage("❌ Please enter phone number");

    try {
      const res = await axios.post("http://localhost:8081/send-code", { phone });
      const code = res.data.code.toString();
      setGeneratedCode(code);
      setCodeSent(true);
      setMessage(`✅ Code sent: ${code}`);
    } catch (err) {
      console.error("Error sending code:", err.message);
      setMessage("❌ Failed to send code");
    }
  };

  const verifyCode = () => {
    if (enteredCode === generatedCode) {
      setCodeVerified(true);
      setMessage("✅ Code verified");
    } else {
      setMessage("❌ Invalid code");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !phone || !password || !confirmPassword) {
      return setMessage("❌ Please fill all fields.");
    }

    if (password !== confirmPassword) {
      return setMessage("❌ Passwords do not match.");
    }

    if (!codeVerified) {
      return setMessage("❌ Please verify the code.");
    }

    try {
      const res = await axios.post("http://localhost:8081/register", {
        username,
        password,
        phone,
        code: enteredCode,
      });

      setMessage("✅ " + res.data.message);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Registration failed"));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="button" onClick={handleSendCode}>Send Code</button>
          </div>

          {codeSent && (
            <>
              <input
                placeholder="Enter Code"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
              />
              <button type="button" onClick={verifyCode}>Verify Code</button>
            </>
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={!codeVerified}>Register</button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "10px",
              color: message.startsWith("✅") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

