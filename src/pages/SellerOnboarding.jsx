// src/pages/SellerOnboarding.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function SellerOnboarding() {
  const { user, completeSellerProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    orgName: "",
    location: "",
    license: "",
    gst: "",
    establishmentDate: "",
    certificates: "",
  });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "seller") {
    // this page is only for logged-in sellers
    return null;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (err) setErr("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // simple client-side validation
    if (!form.orgName || !form.location || !form.license || !form.gst || !form.establishmentDate) {
      setErr("Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      await completeSellerProfile(form);
      navigate("/seller/dashboard", { replace: true });
    } catch {
      setErr("Could not save seller profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Seller Onboarding</h2>
        <p className="subtitle">Complete your organization details to access the seller dashboard.</p>

        {err && <div className="error-message">{err}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Organization Name *</label>
            <input name="orgName" value={form.orgName} onChange={onChange} placeholder="e.g., Crafts Co." required />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input name="location" value={form.location} onChange={onChange} placeholder="City, State" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>License Number *</label>
              <input name="license" value={form.license} onChange={onChange} placeholder="License No." required />
            </div>
            <div className="form-group">
              <label>GST / Tax ID *</label>
              <input name="gst" value={form.gst} onChange={onChange} placeholder="GSTIN / Tax ID" required />
            </div>
          </div>

          <div className="form-group">
            <label>Establishment Date *</label>
            <input type="date" name="establishmentDate" value={form.establishmentDate} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label>Certificates (optional)</label>
            <input name="certificates" value={form.certificates} onChange={onChange} placeholder="Comma-separated list" />
          </div>

          <button type="submit" className="auth-btn" disabled={saving}>
            {saving ? "Saving..." : "Submit & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
