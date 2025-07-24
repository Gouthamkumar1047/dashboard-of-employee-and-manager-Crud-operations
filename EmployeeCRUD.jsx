// src/components/EmployeeCRUD.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CRUDStyles.css";

function EmployeeCRUD() {
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    position: ""
  });
  const [searchName, setSearchName] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // ✅ Set token once + fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = () => {
    axios
      .get("http://localhost:8081/get-users")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Fetch failed:", err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    axios
      .post("http://localhost:8081/add-user", formData)
      .then(() => {
        fetchEmployees();
        setModal("");
        setFormData({ id: "", name: "", email: "", position: "" });
      })
      .catch((err) => alert("Add failed: " + err.message));
  };

  const handleUpdate = () => {
    axios
      .put(`http://localhost:8081/update-user/${formData.id}`, formData)
      .then(() => {
        fetchEmployees();
        setModal("");
        setFormData({ id: "", name: "", email: "", position: "" });
      })
      .catch((err) => alert("Update failed: " + err.message));
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:8081/delete-user/${formData.id}`)
      .then(() => {
        fetchEmployees();
        setModal("");
        setFormData({ id: "", name: "", email: "", position: "" });
      })
      .catch((err) => alert("Delete failed: " + err.message));
  };

  const handleSearch = () => {
    axios
      .get(`http://localhost:8081/get-user-by-name/${searchName}`)
      .then((res) => setSearchResult(res.data))
      .catch(() => setSearchResult(null));
  };

  return (
    <div className="crud-container">
      <div className="button-group-section">
        <div className="button-group">
          <button onClick={() => setModal("add")}>Add</button>
          <button onClick={() => setModal("update")}>Update</button>
          <button onClick={() => setModal("delete")}>Delete</button>
          <button onClick={() => setModal("select")}>Select</button>
        </div>
      </div>

      <div className="heading-section">
        <h2>Employee Dashboard</h2>
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.position}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{modal.toUpperCase()} Employee</h3>

            {(modal === "add" || modal === "update") && (
              <>
                {modal === "update" && (
                  <input
                    name="id"
                    placeholder="Employee ID"
                    value={formData.id}
                    onChange={handleChange}
                  />
                )}
                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <input
                  name="position"
                  placeholder="Position"
                  value={formData.position}
                  onChange={handleChange}
                />
                <button onClick={modal === "add" ? handleAdd : handleUpdate}>
                  {modal === "add" ? "Add" : "Update"}
                </button>
              </>
            )}

            {modal === "delete" && (
              <>
                <input
                  name="id"
                  placeholder="Employee ID to delete"
                  value={formData.id}
                  onChange={handleChange}
                />
                <button onClick={handleDelete}>Delete</button>
              </>
            )}

            {modal === "select" && (
              <>
                <input
                  type="text"
                  placeholder="Search name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
                {searchResult ? (
                  <div className="result">
                    <p><strong>Name:</strong> {searchResult.name}</p>
                    <p><strong>Email:</strong> {searchResult.email}</p>
                    <p><strong>Position:</strong> {searchResult.position}</p>
                  </div>
                ) : (
                  <p style={{ marginTop: "10px" }}>No results</p>
                )}
              </>
            )}

            <button className="close-btn" onClick={() => setModal("")}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeCRUD;
