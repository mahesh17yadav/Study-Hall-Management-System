import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div className="login-page" style={{ flexDirection: "column", padding: 0, minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ zIndex: 2, maxWidth: "800px", background: "rgba(10, 12, 16, 0.7)", padding: "40px", borderRadius: "16px", border: "1px solid rgba(21, 88, 201, 0.3)", marginTop: "80px", marginBottom: "40px", backdropFilter: "blur(10px)" }}>
        <h1 className="login-title" style={{ fontSize: "36px", marginBottom: "20px" }}>
          About <span>StudyHall</span>
        </h1>
        
        <p style={{ color: "#ddd", lineHeight: "1.8", fontSize: "16px" }}>
          StudyHall was built to solve the daily problems faced by study hall owners. Managing cabins manually, remembering fee due dates, and sending reminders takes a lot of time. 
        </p>
        
        <br />

        <p style={{ color: "#ddd", lineHeight: "1.8", fontSize: "16px" }}>
          Our platform provides a seamless digital solution with a <b style={{ color: "var(--blue)" }}>Cinematic User Interface</b>, real-time cabin tracking, automated fee calculations, and an integrated <b style={{ color: "var(--lime)" }}>Razorpay Payment Gateway</b> for students. We also offer direct WhatsApp integration to keep students notified.
        </p>

        <div style={{ display: "flex", gap: "20px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center" }}>
          <div className="card" style={{ flex: 1, minWidth: "200px", textAlign: "center" }}>
            <h3 style={{ color: "var(--lime)", fontSize: "18px", marginBottom: "10px" }}>Our Mission</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>To make study hall management effortless and digital.</p>
          </div>
          <div className="card" style={{ flex: 1, minWidth: "200px", textAlign: "center" }}>
            <h3 style={{ color: "var(--blue)", fontSize: "18px", marginBottom: "10px" }}>Our Vision</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>To be India's most trusted study hall management platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}