// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/LoginRegister.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (animating) return;
    setAnimating(true);

    try {
      const res = await axios.post("http://localhost:8081/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      setError("❌ Wrong username or password");
    } finally {
      setAnimating(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}

          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/register">Signup</Link>
          </div>

          <div className="login-anim-btn">
            <button type="submit" disabled={animating}>
              <span className="btn-text">Login</span>
              <div className="man" />
              <div className="door" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
