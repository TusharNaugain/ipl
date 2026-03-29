import { useEffect, useState } from "react";
import { api } from "../../services/api";

const ROLES = ["SMDL", "MDL", "DL", "USER"];
const ROLE_COLORS = { ADMIN: "purple", SMDL: "blue", MDL: "green", DL: "yellow", USER: "red" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER", commissionRate: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coinsUser, setCoinsUser] = useState(null);
  const [coinsAmount, setCoinsAmount] = useState(0);

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/users").then(setUsers).finally(() => setLoading(false));
  }, []);

  const createUser = async () => {
    setError(""); setSuccess("");
    try {
      await api.post("/users/create", form);
      setSuccess(`✅ ${form.role} created!`);
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "USER", commissionRate: 0 });
      const updated = await api.get("/users");
      setUsers(updated);
    } catch (e) { setError(e.message); }
  };

  const addCoins = async (userId) => {
    try {
      await api.post("/users/coins", { userId, amount: parseInt(coinsAmount), description: "Admin credit" });
      setSuccess(`✅ Coins added!`);
      setCoinsUser(null);
      const updated = await api.get("/users");
      setUsers(updated);
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="loading"><span className="spinner" />Loading users...</div>;

  // Filter available roles based on current user role
  const creatableRoles = { ADMIN: ROLES, SMDL: ["MDL","DL","USER"], MDL: ["DL","USER"], DL: ["USER"] };
  const availableRoles = creatableRoles[me.role] || [];

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p>{users.length} total users in system</p>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}
      {success && <div className="error-msg" style={{ background: "rgba(67,233,123,0.1)", borderColor: "rgba(67,233,123,0.25)", color: "#43e97b" }}>{success}</div>}

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {availableRoles.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            ➕ Create User
          </button>
        )}
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-2)" }}>Create New User</h2>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
            <div className="form-group"><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ maxWidth: 200 }}>
            <label>Commission % (from downline bets)</label>
            <input type="number" min="0" max="20" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={createUser}>Create</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Coins</th><th>VIP</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ color: "var(--text-1)", fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${ROLE_COLORS[u.role] || "blue"}`}>{u.role}</span></td>
                  <td style={{ color: "var(--accent-3)", fontWeight: 600 }}>🪙 {u.coins}</td>
                  <td>{u.isVIP ? <span className="badge purple">VIP</span> : <span className="badge">—</span>}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    {coinsUser === u._id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="number" style={{ width: 80, padding: "4px 8px" }} placeholder="Amount" onChange={e => setCoinsAmount(e.target.value)} />
                        <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => addCoins(u._id)}>Add</button>
                        <button className="btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setCoinsUser(null)}>✕</button>
                      </div>
                    ) : me.role === "ADMIN" ? (
                      <button className="btn btn-danger" style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => setCoinsUser(u._id)}>+ Coins</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
