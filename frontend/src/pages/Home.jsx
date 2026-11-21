import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  LampDesk, CreditCard, MessageCircle, Wifi, Newspaper, Sparkles, Droplets, Armchair
} from "lucide-react";

import api from "../api";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const [stats, setStats] = useState({ totalCabins: 0, availableCabins: 0 });
  const [isDark, setIsDark] = useState(document.body.classList.contains("dark-mode"));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/cabins/public");
        const total = data.length;
        const available = data.filter((c) => !c.isOccupied).length;
        setStats({ totalCabins: total, availableCabins: available });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();

    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark-mode"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const cardStyle = {
    width: "320px",
    minHeight: "260px",
    padding: "40px 30px",
    borderRadius: "24px",
    textAlign: "center",
    cursor: "pointer",
    position: "relative",
    background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(21, 88, 201, 0.2)",
    borderLeft: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(21, 88, 201, 0.2)",
    borderRight: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(21, 88, 201, 0.2)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
    transformStyle: "preserve-3d"
  };

  const features = [
    { title: "Reading Hall Cabin", description: "Real-time view of occupied and empty cabins.", Icon: LampDesk, color: "#ff7043", shadow: "rgba(255, 99, 71, 0.4)" },
    { title: "Online Payments", description: "Integrated Razorpay for seamless fee collection.", Icon: CreditCard, color: "#2563eb", shadow: "rgba(21, 88, 201, 0.4)" },
    { title: "WhatsApp Alerts", description: "Automated fee reminders sent directly via WhatsApp.", Icon: MessageCircle, color: "#25D366", shadow: "rgba(37, 211, 102, 0.4)" },
    { title: "Free Wi-Fi", description: "High-speed internet access for learning and research.", Icon: Wifi, color: "#06b6d4", shadow: "rgba(6, 182, 212, 0.4)" },
    { title: "Daily Newspapers", description: "Stay updated with daily newspapers and current affairs.", Icon: Newspaper, color: "#f59e0b", shadow: "rgba(245, 158, 11, 0.4)" },
    { title: "Clean & Hygienic Cabins", description: "Clean and well-maintained cabins for a healthy study space.", Icon: Sparkles, color: "#a855f7", shadow: "rgba(168, 85, 247, 0.4)" },
    { title: "Mineral Water", description: "Drinking water facility available for students.", Icon: Droplets, color: "#0ea5e9", shadow: "rgba(14, 165, 233, 0.4)" },
    { title: "Comfortable Environment", description: "A peaceful and comfortable atmosphere for focused studying.", Icon: Armchair, color: "#ec4899", shadow: "rgba(236, 72, 153, 0.4)" }
  ];

  return (
    <div className="login-page" style={{ flexDirection: "column", padding: 0, minHeight: "100vh" }}>
      <Navbar />
      
      <ThemeToggle />

      <div style={{ zIndex: 2, textAlign: "center", maxWidth: "800px", padding: "40px 20px", marginTop: "80px" }}>
        <h1 className="login-title" style={{ fontSize: "56px", marginBottom: "20px", lineHeight: "1.2", color: "var(--text)", textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
          Welcome to <span>StudyHall</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "18px", marginBottom: "40px", lineHeight: "1.6" }}>
          The ultimate management system for study halls. Track cabins, manage student fees, and automate WhatsApp reminders seamlessly.
        </p>

        <Link to="/available-cabins" style={{ textDecoration: "none" }}>
          <div style={{
              display: "inline-block", background: isDark ? "rgba(212, 255, 36, 0.08)" : "rgba(255, 255, 255, 0.6)",
              border: "1px solid var(--lime)", padding: "15px 30px", borderRadius: "16px", marginBottom: "40px",
              boxShadow: "0 0 20px rgba(212, 255, 36, 0.15)", cursor: "pointer", transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(212, 255, 36, 0.4)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(212, 255, 36, 0.15)"; }}
          >
            <h3 style={{ margin: 0, color: "var(--lime)", fontSize: "20px" }}>🚪 {stats.availableCabins} Cabins Available Now! (Click to view)</h3>
            <p style={{ margin: "5px 0 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Out of {stats.totalCabins} total cabins</p>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
          <Link to="/login" style={{ background: "var(--lime)", color: "#000", padding: "16px 40px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 15px rgba(212, 255, 36, 0.2)", transition: "all 0.3s ease" }}>Login Now</Link>
          <Link to="/about" style={{ background: "var(--blue)", color: "#fff", padding: "16px 40px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 15px rgba(21, 88, 201, 0.2)", transition: "all 0.3s ease" }}>Learn More</Link>
        </div>
      </div>

      <div style={{ zIndex: 2, display: "flex", gap: "30px", marginTop: "20px", padding: "0 20px 80px", maxWidth: "1150px", width: "100%", boxSizing: "border-box", flexWrap: "wrap", justifyContent: "center", perspective: "1000px", marginLeft: "auto", marginRight: "auto" }}>
        {features.map((feature, index) => {
          const Icon = feature.Icon;
          return (
            <div 
              key={index} 
              style={{ ...cardStyle, borderTop: `2px solid ${feature.color}` }} // 👈 Ikkada borderTop dynamic ga add avuthundi
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                e.currentTarget.style.transform = `rotateX(${-y / 10}deg) rotateY(${x / 10}deg) translateY(-10px) scale(1.05)`;
                e.currentTarget.style.boxShadow = `0 25px 50px ${feature.shadow}`;
                e.currentTarget.style.background = `${feature.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotateX(0) rotateY(0) translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.6)";
              }}
            >
              <div style={{ width: "90px", height: "90px", margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "22px", background: `linear-gradient(145deg, ${feature.color}30, rgba(255,255,255,0.04))`, border: `1px solid ${feature.color}60`, boxShadow: `8px 8px 20px rgba(0,0,0,0.2), 0 0 20px ${feature.shadow}`, transform: "translateZ(30px)" }}>
                <Icon size={55} color={feature.color} strokeWidth={1.7} style={{ filter: `drop-shadow(0 8px 10px ${feature.shadow})` }} />
              </div>
              <h3 style={{ color: "var(--text)", fontSize: "21px", marginBottom: "12px", fontWeight: "bold", transform: "translateZ(20px)" }}>{feature.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.7", fontWeight: "500", transform: "translateZ(10px)" }}>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}