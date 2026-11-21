import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import StudentForm from "../components/StudentForm";
import { dueInfo, whatsappLink } from "../utils/fees";
import Navbar from "../components/Navbar";
import { Search } from "lucide-react";
import "./Dashboard.css";
import clearSession from "../utils/clearSession";

const DUE_SOON_DAYS = 7; // mee ishtam: 3, 5, 10...

export default function Dashboard() {
  const [cabins, setCabins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get("/cabins");
      setCabins(data);
    } catch (err) {
      if (err.response?.status === 401) {
        clearSession();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const q = search.trim().toLowerCase();
  const matchCabin = (c) => {
    if (!q) return true;
    if (String(c.cabinNo).includes(q)) return true;
    if (!c.student) return false;
    return (
      (c.student.name || "").toLowerCase().includes(q) ||
      (c.student.phoneNo || "").includes(q)
    );
  };

 // Due list: Show overdue payments or payments due within the next 7 days.
  const dueList = cabins
    .filter((c) => c.student && c.student.isApproved !== false)
    .map((c) => ({ ...c.student, due: dueInfo(c.student) }))
    .filter((s) => {
      if (!s.due) return s.feeStatus === "pending";
      if (s.due.level === "danger") return true; 
      return s.due.days <= DUE_SOON_DAYS;
    })
    .sort((a, b) => {
      if (!a.due || !b.due) return 0;
      return a.due.days - b.due.days;
    });

  const totalStudents = cabins.filter((c) => c.student).length;
  const emptyCabins = cabins.filter((c) => !c.isOccupied).length;
  const dueCount = dueList.length;

  const cabin = (n) => {
    const c = cabins.find((x) => x.cabinNo === n);
    if (!c) return null;
    if (!matchCabin(c)) return null;

    const isDue = dueList.some((s) => s.cabinNo === n);

    return (
      <div
        key={n}
        className={`cabin ${c.isOccupied ? "occupied" : "empty"} ${isDue ? "due" : ""}`}
        onClick={() => setSelected(c)}
      >
        <b>{n}</b>
        <small>{c.student ? c.student.name : "Empty"}</small>
      </div>
    );
  };

  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  const filteredDue = dueList.filter(
    (s) =>
      !q ||
      (s.name || "").toLowerCase().includes(q) ||
      (s.phoneNo || "").includes(q) ||
      String(s.cabinNo).includes(q)
  );

  return (
    <div className="dashboard dashboard-page">
      <Navbar />

      {/* Statistics Cards */}
      <div className="dash-stats">
        <div className="dash-card">
          <small>Total Students</small>
          <b>{totalStudents}</b>
        </div>
        <div className="dash-card">
          <small>Empty Cabins</small>
          <b>{emptyCabins}</b>
        </div>
        <div className="dash-card dash-card--due">
          <small>Fee Due</small>
          <b>{dueCount}</b>
        </div>
      </div>

      <div className="dash-body">
        <Link to="/admin-messages" className="dash-msg-btn">
          📩 View Contact Messages
        </Link>

        {/* Search */}
        <div className="dash-search-wrap">
          <Search size={20} className="dash-search-icon" />
          <input
            className="dash-search"
            placeholder="Search by name / phone / cabin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="dash-legend">
          <span><i className="dash-dot empty" /> Empty</span>
          <span><i className="dash-dot occupied" /> Occupied</span>
          <span><i className="dash-dot due" /> Fee due</span>
        </div>

        <div className="dash-panel dash-map">
          <div className="dash-row">{range(1, 7).map(cabin)}</div>
          <div className="dash-row">{range(8, 14).map(cabin)}</div>
          <div className="dash-side">
            <div className="dash-col">{range(15, 18).map(cabin)}</div>
            <div className="dash-col">{range(19, 22).map(cabin)}</div>
          </div>
        </div>

        <div className="dash-panel dash-due">
          <h3>Fee due students ({filteredDue.length})</h3>
          {filteredDue.length === 0 && <p>No pending reminders 🎉</p>}
          <div className="dash-due-list">
            {filteredDue.map((s) => (
              <div className="dash-due-item" key={s._id}>
                <div>
                  <b className="dash-due-name">{s.name}</b>{" "}
                  <span className="dash-due-cabin">(Cabin {s.cabinNo})</span>
                  <br />
                  <small
                    className={`dash-due-label ${s.due?.level === "danger" ? "danger" : "warn"}`}
                  >
                    ₹{s.feeAmount} - {s.due?.label || "Fee Due"}
                  </small>
                </div>
                <a
                  className="dash-wa-btn"
                  href={whatsappLink(s)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Remind on WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <StudentForm
          cabin={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}