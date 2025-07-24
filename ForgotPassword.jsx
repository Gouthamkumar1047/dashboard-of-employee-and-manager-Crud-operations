import React, { useState } from "react";
import axios from "axios";
import "../styles/LoginRegister.css";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !phone || !newPassword) {
      return setMessage("❌ Please fill all fields.");
    }

    try {
      const res = await axios.post("http://localhost:8081/change-password", {
        username,
        phone,
        password: newPassword,
      });

      setMessage("✅ " + res.data.message);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Reset failed"));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleReset}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit">Change Password</button>
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
