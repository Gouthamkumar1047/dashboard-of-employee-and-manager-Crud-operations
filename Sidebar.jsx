
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleSignout = () => {
    localStorage.removeItem("token"); // 🚪 remove token
    navigate("/"); // 🔁 go to login
  };

  return (
    <div className="sidebar">
      <h2>MENU</h2>
      <ul>
       <li><Link to="/home">🏠 Home</Link></li>

        <li><Link to="/employee">👤 Employee</Link></li>
        <li><Link to="/manager">👨‍💼 Manager</Link></li>
      </ul>

      <button className="signout-btn" onClick={handleSignout}>
        🚪 Sign Out
      </button>
    </div>
  );
}

export default Sidebar;
