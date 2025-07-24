import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CRUDStyles.css";

function ManagerCRUD() {
  const [managers, setManagers] = useState([]);
  const [modal, setModal] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    manager_id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    status: ""
  });
  const [searchName, setSearchName] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    fetchManagers();
  }, []);

  const fetchManagers = () => {
    axios.get("http://localhost:8081/get-managers")
      .then(res => setManagers(res.data))
      .catch(err => console.error("Error fetching managers:", err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    axios.post("http://localhost:8081/add-manager", formData)
      .then(() => {
        fetchManagers();
        setModal("");
      })
      .catch(err => alert("Add failed: " + err.message));
  };

  const handleUpdate = () => {
    axios.put(`http://localhost:8081/update-manager/${formData.id}`, formData)
      .then(() => {
        fetchManagers();
        setModal("");
      })
      .catch(err => alert("Update failed: " + err.message));
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:8081/delete-manager/${formData.id}`)
      .then(() => {
        fetchManagers();
        setModal("");
      })
      .catch(err => alert("Delete failed: " + err.message));
  };

  const handleSearch = () => {
    axios
      .get(`http://localhost:8081/get-manager-by-name/${searchName}`)
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
        <h2>Manager Dashboard</h2>
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Manager ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((mgr) => (
            <tr key={mgr.id || mgr.manager_id}>
              <td>{mgr.id}</td>
              <td>{mgr.manager_id}</td>
              <td>{mgr.name}</td>
              <td>{mgr.email}</td>
              <td>{mgr.phone}</td>
              <td>{mgr.department}</td>
              <td>{mgr.position}</td>
              <td>{mgr.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{modal.toUpperCase()} Manager</h3>

            {(modal === "add" || modal === "update") && (
              <>
                {modal === "update" && (
                  <input name="id" placeholder="Manager DB ID" onChange={handleChange} />
                )}
                <input name="manager_id" placeholder="Manager ID" onChange={handleChange} />
                <input name="name" placeholder="Name" onChange={handleChange} />
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input name="phone" placeholder="Phone" onChange={handleChange} />
                <input name="department" placeholder="Department" onChange={handleChange} />
                <input name="position" placeholder="Position" onChange={handleChange} />
                <input name="status" placeholder="Status" onChange={handleChange} />
                <button onClick={modal === "add" ? handleAdd : handleUpdate}>
                  {modal === "add" ? "Add" : "Update"}
                </button>
              </>
            )}

            {modal === "delete" && (
              <>
                <input name="id" placeholder="Manager DB ID to delete" onChange={handleChange} />
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
                    <p><strong>Phone:</strong> {searchResult.phone}</p>
                    <p><strong>Department:</strong> {searchResult.department}</p>
                    <p><strong>Position:</strong> {searchResult.position}</p>
                    <p><strong>Status:</strong> {searchResult.status}</p>
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

export default ManagerCRUD;
