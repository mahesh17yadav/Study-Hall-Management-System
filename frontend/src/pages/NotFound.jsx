import { Link } from "react-router-dom";
import CinematicBg from "../components/CinematicBg";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <div className="login-page" style={{ flexDirection: "column", padding: 0, minHeight: "100vh" }}>
      <Navbar />
      <CinematicBg />
      
      <div style={{ zIndex: 2, textAlign: "center", marginTop: "100px", padding: "40px", background: "rgba(10, 12, 16, 0.7)", borderRadius: "16px", border: "1px solid rgba(21, 88, 201, 0.3)", backdropFilter: "blur(10px)" }}>
        <h1 style={{ fontSize: "100px", margin: "0", color: "var(--tomato)", textShadow: "0 0 30px rgba(255, 99, 71, 0.5)", lineHeight: "1" }}>
          404
        </h1>
        
        <h2 style={{ color: "#fff", marginTop: "10px", fontSize: "28px" }}>Page Not Found</h2>
        
        <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "30px" }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/" style={{ background: "var(--blue)", color: "#fff", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", boxShadow: "0 4px 15px rgba(21, 88, 201, 0.4)" }}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
}