import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, AlertCircle } from "lucide-react";
import api from "../api";
import { dueInfo, whatsappLink } from "../utils/fees";
import Navbar from "../components/Navbar";
import clearSession from "../utils/clearSession";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Report State
  const [reportMsg, setReportMsg] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  const navigate = useNavigate();

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const hallInfo = {
    openTime: "06:00 AM",
    closeTime: "11:00 PM",
    wifiName: "StudyHall_HighSpeed",
    wifiPass: "Study@2026",
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const { data } = await api.get("/students/me", {
    params: { phoneNo: user.phoneNo },
  });
        setStudent(data);
      } catch (err) {
        console.error(err);
        setError("Could not load your details. Please re-login.");
      }
    };
    fetchMe();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setReportStatus("loading");
    try {
      await api.post("/students/report-issue", {
        studentName: student.name,
        cabinNo: student.cabinNo,
        message: reportMsg,
      });
      setReportStatus("success");
      setReportMsg("");
      setTimeout(() => setReportStatus(""), 3000);
    } catch (err) {
      setReportStatus("error");
    }
  };

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      const { data: order } = await api.post("/students/create-payment", {
        amount: student.feeAmount,
      });

      const options = {
        key: "rzp_test_U2RN7lcyQKy1v4",
        amount: order.amount,
        currency: order.currency,
        name: "Study Hall Management",
        description: `Fee Payment for Cabin ${student.cabinNo}`,
        order_id: order.id,
        handler: async function (response) {
          alert("Payment Successful! Please inform Admin.");
          const msg = `Hi Admin, I have paid Rs.${student.feeAmount} for Cabin ${student.cabinNo}. Payment ID: ${response.razorpay_payment_id}`;
          window.open(`https://wa.me/918639003846?text=${encodeURIComponent(msg)}`, "_blank");
        },
        prefill: {
          name: student.name,
          contact: student.phoneNo,
        },
        theme: {
          color: "#1558c9",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment Failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
        alert("Something went wrong. Try again.");
        console.error(error);
    } finally {
      setIsPaying(false);
    }
  };

  if (error) return (
    <div className="login-page">
      <div className="login-card">
        <h2 style={{ color: "var(--tomato)" }}>{error}</h2>
        <button
  onClick={() => {
    clearSession();
    navigate("/");
  }}
>
  Logout
</button>
      </div>
    </div>
  );

  if (!student) return (
    <div className="login-page">
      <div className="login-card"><h2>Loading...</h2></div>
    </div>
  );

  const due = dueInfo(student);

  return (
    <div className="dashboard" style={{ position: "relative", zIndex: 2 }}>
      <Navbar />
      
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <header style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "15px" }}>
          <img 
            src={defaultAvatar} 
            alt="Profile" 
            style={{ 
              width: "65px", height: "65px", borderRadius: "50%", 
              border: "3px solid var(--blue)", boxShadow: "0 0 15px rgba(21, 88, 201, 0.5)",
              objectFit: "cover"
            }} 
          />
          <div>
            <h2 style={{ margin: 0, color: "var(--text)" }}>Hello, {student.name} 👋</h2>
            <small style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Cabin {student.cabinNo} | {student.phoneNo}
            </small>
          </div>
        </header>

        <div className="cards" style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div className="card" style={{ flex: 1, minWidth: "200px", padding: "20px", borderRadius: "16px", border: "1px solid rgba(212, 255, 36, 0.3)", background: "rgba(255, 255, 255, 0.05)" }}>
            <small style={{ color: "var(--text-muted)" }}>⏰ Opening Time</small>
            <b style={{ display: "block", fontSize: "20px", color: "var(--lime)", marginTop: "10px" }}>{hallInfo.openTime}</b>
          </div>
          <div className="card" style={{ flex: 1, minWidth: "200px", padding: "20px", borderRadius: "16px", border: "1px solid rgba(212, 255, 36, 0.3)", background: "rgba(255, 255, 255, 0.05)" }}>
            <small style={{ color: "var(--text-muted)" }}>⏰ Closing Time</small>
            <b style={{ display: "block", fontSize: "20px", color: "var(--lime)", marginTop: "10px" }}>{hallInfo.closeTime}</b>
          </div>
          <div className="card" style={{ flex: 1, minWidth: "200px", padding: "20px", borderRadius: "16px", border: "1px solid rgba(21, 88, 201, 0.3)", background: "rgba(255, 255, 255, 0.05)" }}>
            <small style={{ color: "var(--text-muted)" }}>🚪 Your Cabin</small>
            <b style={{ display: "block", fontSize: "20px", color: "var(--blue)", marginTop: "10px" }}>{student.cabinNo}</b>
          </div>
        </div>

        <div className="due-box" style={{ border: "1px solid rgba(21, 88, 201, 0.3)", background: 'rgba(21, 88, 201, 0.05)', padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
          <h3 style={{ color: 'var(--blue)', marginTop: 0 }}>📶 WiFi Details</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>Network: <b style={{ color: "var(--text)" }}>{hallInfo.wifiName}</b></p>
              <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>Password: <b style={{ color: "var(--text)" }}>{hallInfo.wifiPass}</b></p>
            </div>
            
            <button 
              onClick={() => copyToClipboard(hallInfo.wifiPass)}
              style={{ 
                background: copied ? "var(--lime)" : "var(--blue)", 
                color: copied ? "#000" : "#fff", 
                border: "none", 
                padding: "8px 16px", 
                borderRadius: "6px", 
                cursor: "pointer", 
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
            >
              {copied ? (
                <><Check size={18} /> Copied!</>
              ) : (
                <><Copy size={18} /> Copy</>
              )}
            </button>
          </div>
        </div>

        {/* 👈 STUDENT REPORT FORM */}
        <div className="due-box" style={{ border: "1px solid var(--lime)", background: 'rgba(212, 255, 36, 0.05)', padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
          <h3 style={{ color: 'var(--lime)', marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={22} /> Report an Issue
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "15px" }}>
            Face any problem in the study hall? Let the Admin know directly.
          </p>

          <form onSubmit={submitReport} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea 
              rows="3" 
              placeholder="Describe your issue here (e.g., AC not working, WiFi is slow, etc.)"
              value={reportMsg}
              onChange={(e) => setReportMsg(e.target.value)}
              required
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "var(--text)", fontSize: "14px", outline: "none", fontFamily: "inherit" }}
            />
            
            <button 
              type="submit" 
              disabled={reportStatus === "loading"}
              style={{ background: "var(--lime)", color: "#000", padding: "10px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: reportStatus === "loading" ? "not-allowed" : "pointer" }}
            >
              {reportStatus === "loading" ? "Sending..." : "Send Report to Admin"}
            </button>
          </form>

          {reportStatus === "success" && (
            <p style={{ color: "var(--lime)", marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
              ✅ Report sent successfully! Admin will look into it.
            </p>
          )}
          {reportStatus === "error" && (
            <p style={{ color: "var(--tomato)", marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
              ❌ Failed to send report. Please try again.
            </p>
          )}
        </div>

        <h3 style={{ marginTop: "30px", color: "var(--text)" }}>Fee Details</h3>
        
        {due ? (
          <div className="due-box" style={{ border: "1px solid var(--tomato)", background: 'rgba(255, 99, 71, 0.05)', padding: "20px", borderRadius: "16px" }}>
            <h3 style={{ color: 'var(--tomato)', marginTop: 0 }}>Fee Reminder ⚠️</h3>
            <p style={{ color: "var(--text)" }}>Your fee of <b style={{ color: "var(--tomato)" }}>₹{student.feeAmount}</b> is <b>{due.label}</b>.</p>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
              <button 
                onClick={handlePayment}
                disabled={isPaying}
                style={{ 
                  flex: 1, background: "var(--lime)", color: "#000", 
                  padding: "12px 20px", border: "none", borderRadius: "8px", 
                  fontWeight: "bold", fontSize: "16px", cursor: isPaying ? "not-allowed" : "pointer",
                  boxShadow: "0 0 15px rgba(212, 255, 36, 0.4)"
                }}
              >
                {isPaying ? "Processing..." : `Pay ₹${student.feeAmount} Now`}
              </button>
              <a className="wa-btn" href={whatsappLink(student)} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "12px", background: "var(--tomato)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                Contact Admin
              </a>
            </div>
          </div>
        ) : (
          <div className="due-box" style={{ border: "1px solid var(--lime)", background: 'rgba(212, 255, 36, 0.05)', padding: "20px", borderRadius: "16px" }}>
            <h3 style={{ color: 'var(--lime)', marginTop: 0 }}>All Clear! 🎉</h3>
            <p style={{ color: "var(--text)" }}>Your fee is paid. Next due date: <b style={{ color: "var(--lime)" }}>
              {student.feeDueDate 
                ? new Date(student.feeDueDate).toLocaleDateString() 
                : (student.dateOfJoin 
                    ? new Date(new Date(student.dateOfJoin).setMonth(new Date(student.dateOfJoin).getMonth() + 1)).toLocaleDateString() 
                    : "Not set")}
            </b></p>
          </div>
        )}
      </div>
    </div>
  );
}