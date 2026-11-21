import { useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/messages", form);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ flexDirection: "column", padding: 0 }}>
      <Navbar />
      
      <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "500px", marginTop: "40px", zIndex: 2, width: "90%" }}>
        <h1 className="login-title" style={{ textAlign: "center" }}>
          Contact <span>Us</span>
        </h1>
        <p className="login-sub" style={{ textAlign: "center" }}>We'd love to hear from you!</p>

        {submitted && (
          <div style={{ background: "rgba(212, 255, 36, 0.1)", border: "1px solid var(--lime)", padding: "10px", borderRadius: "8px", color: "var(--lime)", textAlign: "center", marginBottom: "10px" }}>
            Message sent successfully! 🎉
          </div>
        )}

        <label>Name</label>
        <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />

        <label>Message</label>
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="How can we help you?" rows="4" required style={{ padding: "14px", borderRadius: "10px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(21, 88, 201, 0.3)", color: "#fff", fontFamily: "inherit", outline: "none" }} />
        
        <button type="submit" style={{ marginTop: "15px" }} disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}