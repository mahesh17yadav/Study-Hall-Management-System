import { useState } from "react";
import api from "../api";

// Helper function to add exactly one month without timezone issues.
const addOneMonth = (dateStr) => {
  const [y, m, d] = (dateStr || new Date().toISOString().slice(0, 10))
    .split("-")
    .map(Number);
  const next = new Date(y, m, d); // m already +1 index
  if (next.getDate() !== d) next.setDate(0); // Jan 31 -> Feb 28 laanti cases
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${next.getFullYear()}-${mm}-${dd}`;
};

export default function StudentForm({ cabin, onClose, onSaved }) {
  const s = cabin.student;
  
  const defaultDue = s?.feeDueDate
    ? s.feeDueDate.slice(0, 10)
    : addOneMonth(s ? s.dateOfJoin.slice(0, 10) : new Date().toISOString().slice(0, 10));

  const [form, setForm] = useState({
    name: s?.name || "",
    age: s?.age || "",
    dateOfJoin: s ? s.dateOfJoin.slice(0, 10) : new Date().toISOString().slice(0, 10),
    phoneNo: s?.phoneNo || "",
    feeAmount: s?.feeAmount ?? 0,
    feeStatus: s?.feeStatus || "pending",
    feeDueDate: defaultDue,
  });
  
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const change = (e) => {
  const { name, value } = e.target;

  // When adding a new student: automatically set the due date to one month after the join date whenever the join date changes.
  if (name === "dateOfJoin" && !s) {
    setForm({ ...form, dateOfJoin: value, feeDueDate: addOneMonth(value) });
  } else {
    setForm({ ...form, [name]: value });
  }
};

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...form,
        age: Number(form.age),
        feeAmount: Number(form.feeAmount),
        cabinNo: cabin.cabinNo,
      };

      if (s && body.feeStatus === "paid" && s.feeStatus !== "paid") {
        body.feeDueDate = addOneMonth(body.feeDueDate);
        body.feeStatus = "pending";
        body.lastPaidAt = new Date().toISOString();
      }

      if (!body.feeDueDate) {
        body.feeDueDate = addOneMonth(body.dateOfJoin);
      }

      if (s) await api.put(`/students/${s._id}`, body);
      else await api.post("/students", body);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/students/${s._id}`);
      setShowDeleteModal(false);
      onSaved();
    } catch (err) {
      setError("Failed to delete student");
      setShowDeleteModal(false);
    }
  };

  // 👈 Glass background style used on the home page.
  const modalStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "24px",
    padding: "40px 30px",
    color: "#fff",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div className="modal-bg">
      <form style={modalStyle} onSubmit={save}>
        <h3 style={{ color: "var(--lime)", marginBottom: "20px" }}>Cabin {cabin.cabinNo}</h3>

        <label style={{ fontSize: "14px", color: "#ccc" }}>Name</label>
        <input name="name" placeholder="Name" value={form.name} onChange={change} required style={inputStyle} />

        <label style={{ fontSize: "14px", color: "#ccc" }}>Age</label>
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={change} required style={inputStyle} />

        <label style={{ fontSize: "14px", color: "#ccc" }}>Date of Join</label>
        <input name="dateOfJoin" type="date" value={form.dateOfJoin} onChange={change} required style={inputStyle} />

        <label style={{ fontSize: "14px", color: "#ccc" }}>Phone</label>
        <input name="phoneNo" placeholder="Phone (10 digits)" value={form.phoneNo} onChange={change} required style={inputStyle} />

        <label style={{ fontSize: "14px", color: "#ccc" }}>Fee Amount</label>
        <input name="feeAmount" type="number" placeholder="Fee amount" value={form.feeAmount} onChange={change} style={inputStyle} />

        <label style={{ fontSize: "14px", color: "#ccc" }}>Fee Status</label>
        <select name="feeStatus" value={form.feeStatus} onChange={change} style={inputStyle}>
          <option value="pending">Fee: Pending</option>
          <option value="paid">Fee: Paid</option>
        </select>

        <label style={{ fontSize: "14px", color: "#ccc" }}>Fee Due Date</label>
        <input name="feeDueDate" type="date" value={form.feeDueDate} onChange={change} style={inputStyle} />

        {!s && <small style={{ color: "#aaa" }}>Student login password = phone number (default)</small>}
        {error && <p style={{ color: "var(--tomato)", marginTop: "10px" }}>{error}</p>}
        
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "var(--lime)", color: "#000", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            {s ? "Update" : "Add"}
          </button>
          {s && (
            <button type="button" onClick={() => setShowDeleteModal(true)} style={{ padding: "12px", borderRadius: "8px", background: "var(--tomato)", color: "#fff", fontWeight: "bold", border: "none", cursor: "pointer" }}>
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>

      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="premium-modal-bg">
          <div className="premium-modal">
            <div className="premium-badge">
              <span>02</span> CLEAR CONSEQUENCES
            </div>

            <div className="premium-icon-bg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>

            <h2 className="premium-title">Delete "{s.name}"?</h2>

            <p className="premium-desc">
              This permanently deletes <span className="highlight-box">Cabin {cabin.cabinNo}</span> for everyone on your team. <br />
              <span className="highlight-danger">It can't be recovered.</span>
            </p>

            <div className="premium-actions">
              <button className="btn-no" onClick={() => setShowDeleteModal(false)}>No</button>
              <button className="btn-yes" onClick={confirmDelete}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}