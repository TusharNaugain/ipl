import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function VIP() {
  const [me, setMe] = useState(null);

  useEffect(() => { api.get("/auth/me").then(setMe).catch(() => {}); }, []);

  const plans = [
    { label: "1 Month VIP",  price: "₹199",  days: 30,  features: ["All VIP predictions", "Priority support", "Exclusive tips"] },
    { label: "3 Month VIP",  price: "₹499",  days: 90,  features: ["All VIP predictions", "Priority support", "Exclusive tips", "Weekly report"], popular: true },
    { label: "1 Year VIP",   price: "₹1499", days: 365, features: ["All VIP predictions", "Priority support", "Exclusive tips", "Weekly report", "1-on-1 consultation"] },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>💎 VIP Membership</h1>
        <p>Unlock premium predictions and exclusive content</p>
      </div>

      {me?.isVIP && (
        <div style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))",
          border: "1px solid rgba(108,99,255,0.3)", borderRadius: 14, padding: "20px 24px", marginBottom: 28
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#a78bfa", marginBottom: 4 }}>✅ You're a VIP Member!</div>
          <div style={{ color: "var(--text-2)", fontSize: 13 }}>
            Expires: {me.vipExpiry ? new Date(me.vipExpiry).toLocaleDateString("en-IN") : "—"}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
        {plans.map(plan => (
          <div key={plan.label} style={{
            background: plan.popular ? "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.08))" : "var(--bg-card)",
            border: `1px solid ${plan.popular ? "rgba(108,99,255,0.4)" : "var(--border)"}`,
            borderRadius: 16, padding: "28px 24px", position: "relative"
          }}>
            {plan.popular && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "var(--accent)", color: "#fff", padding: "3px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700
              }}>MOST POPULAR</div>
            )}
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{plan.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: plan.popular ? "var(--accent)" : "var(--text-1)", marginBottom: 20, letterSpacing: "-1px" }}>{plan.price}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
                  <span style={{ color: "#43e97b" }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}
              onClick={() => alert("Contact admin to activate VIP!")}>
              Get VIP
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text-2)" }}>ℹ️ How VIP works</h2>
        <p style={{ color: "var(--text-3)", fontSize: 13, lineHeight: 1.7 }}>
          VIP members get access to all locked predictions on the IPL Live page. Contact your agent (DL/MDL/SMDL) or admin directly to activate VIP. Payment via UPI, cash, or in-app wallet.
        </p>
      </div>
    </div>
  );
}
