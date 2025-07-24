const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8081;
const JWT_SECRET = "your_secret_key";

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789", 
  database: "db",      
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection error:", err.message);
  } else {
    console.log("✅ Connected to MySQL");
  }
});


function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// 🔑 Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (results.length === 0)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: results[0].id, username }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    }
  );
});

// 🔐 In-memory phone verification code
const codeCache = {}; // { phone: { code, expiresAt } }

// 📤 Send code
app.post("/send-code", (req, res) => {
  const { phone } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = Date.now() + 5 * 60 * 1000;
  codeCache[phone] = { code, expiresAt };
  res.json({ code });
});

// 📝 Register
app.post("/register", (req, res) => {
  const { username, password, phone, code } = req.body;
  const entry = codeCache[phone];

  if (!entry || Date.now() > entry.expiresAt || code != entry.code) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  db.query(
    "INSERT INTO users (username, password, phone) VALUES (?, ?, ?)",
    [username, password, phone],
    (err) => {
      if (err) return res.status(500).json({ error: "Registration failed" });
      delete codeCache[phone];
      res.json({ message: "Registered successfully" });
    }
  );
});

// 🔁 Change password
app.post("/change-password", (req, res) => {
  const { username, phone, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND phone = ?",
    [username, phone],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ error: "User not found" });

      db.query(
        "UPDATE users SET password = ? WHERE username = ? AND phone = ?",
        [password, username, phone],
        (err) => {
          if (err) return res.status(500).json({ error: "Update failed" });
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});

//
// ========== EMPLOYEE ROUTES (protected) ==========
//
app.get("/get-users", verifyToken, (req, res) => {
  db.query("SELECT * FROM employee", (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

app.post("/add-user", verifyToken, (req, res) => {
  const { name, email, position } = req.body;
  console.log("📥 Add request body:", req.body); // 👈 see what's being sent
  db.query(
    "INSERT INTO employee (name, email, position) VALUES (?, ?, ?)",
    [name, email, position],
    (err) => {
      if (err) {
        console.error("❌ Add failed:", err.message); // 👈 log actual MySQL error
        return res.status(500).json({ error: "Insert failed" });
      }
      res.json({ message: "Employee added" });
    }
  );
});


app.put("/update-user/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, email, position } = req.body;
  db.query(
    "UPDATE employee SET name=?, email=?, position=? WHERE id=?",
    [name, email, position, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Employee updated" });
    }
  );
});

app.delete("/delete-user/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employee WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Employee deleted" });
  });
});

app.get("/get-user-by-name/:name", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM employee WHERE name = ?",
    [req.params.name],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(result[0]);
    }
  );
});

//
// ========== MANAGER ROUTES (protected) ==========
//
app.get("/get-managers", verifyToken, (req, res) => {
  db.query("SELECT * FROM manager", (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

app.post("/add-manager", verifyToken, (req, res) => {
  const { manager_id, name, email, phone, department, position, status } = req.body;
  db.query(
    "INSERT INTO manager (manager_id, name, email, phone, department, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [manager_id, name, email, phone, department, position, status],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Manager added" });
    }
  );
});

app.put("/update-manager/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { manager_id, name, email, phone, department, position, status } = req.body;
  db.query(
    "UPDATE manager SET manager_id=?, name=?, email=?, phone=?, department=?, position=?, status=? WHERE id=?",
    [manager_id, name, email, phone, department, position, status, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Manager updated" });
    }
  );
});

app.delete("/delete-manager/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM manager WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Manager deleted" });
  });
});

app.get("/get-manager-by-name/:name", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM manager WHERE name = ?",
    [req.params.name],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(result[0]);
    }
  );
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
