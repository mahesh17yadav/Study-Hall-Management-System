import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import CinematicBg from "../components/CinematicBg";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get("/messages");
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <CinematicBg />
      <div style={{ padding: "20px", zIndex: 2, position: "relative" }}>
        <h2 style={{ color: "var(--text)" }}>📩 Contact Messages</h2>
        
        {messages.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No messages yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
            {messages.map((msg) => (
              <div key={msg._id} className="card" style={{ padding: "20px", borderLeft: msg.isRead ? "4px solid #333" : "4px solid var(--lime)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, color: "var(--blue)" }}>{msg.name}</h3>
                  <small style={{ color: "var(--text-muted)" }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </small>
                </div>
                <p style={{ margin: "5px 0", color: "var(--text-muted)" }}>📧 {msg.email}</p>
                <p style={{ margin: "10px 0", color: "var(--text)", fontSize: "15px" }}>"{msg.message}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}