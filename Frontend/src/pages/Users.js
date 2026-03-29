import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users")
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const roleColor = (role) => {
    const map = { ADMIN: "purple", DL: "blue", MDL: "blue", SMDL: "green", USER: "yellow" };
    return map[role] || "yellow";
  };

  if (loading) return <div className="loading"><span className="spinner" />Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p>{users.length} registered users</p>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40 }}>👥</div>
            <h3>No users yet</h3>
            <p>Register a user via the API or seed the database.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Coins</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ color: "var(--text-1)", fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${roleColor(u.role)}`}>{u.role}</span>
                    </td>
                    <td style={{ color: "var(--accent-3)", fontWeight: 600 }}>🪙 {u.coins}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
