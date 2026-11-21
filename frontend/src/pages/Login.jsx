import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", phoneNo: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 👈 ADMIN / STUDENT REDIRECT LOGIC
      if (data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/student-profile");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid credentials or Server Down. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form 
        className="login-card" 
        onSubmit={submit} 
        style={{ 
          maxWidth: "450px", 
          padding: "50px 40px", 
          borderRadius: "24px" 
        }}
      >
        <h1 className="login-title" style={{ fontSize: "32px", marginBottom: "5px" }}>
          Study<span>Hall</span>
        </h1>
        <p className="login-sub" style={{ fontSize: "15px", marginBottom: "30px" }}>
          Admin / Student Login
        </p>

        <label style={{ fontSize: "14px" }}>Email (Admin) / Phone (Student)</label>
        <input 
          name="email" 
          type="text" 
          placeholder="Email or Phone Number" 
          value={form.email || form.phoneNo} 
          onChange={(e) => {
            const val = e.target.value;
            if (val.includes("@")) {
              setForm({ ...form, email: val, phoneNo: "" });
            } else {
              setForm({ ...form, phoneNo: val, email: "" });
            }
          }} 
          required 
          style={{ height: "48px", marginBottom: "20px", fontSize: "16px" }} 
        />

        <label style={{ fontSize: "14px" }}>Password</label>
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={change} 
          required 
          style={{ height: "48px", marginBottom: "20px", fontSize: "16px" }} 
        />

        {/* Display the error message on the screen */}
        {error && (
          <div style={{ background: "rgba(255, 99, 71, 0.1)", border: "1px solid var(--tomato)", padding: "10px", borderRadius: "8px", color: "var(--tomato)", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          style={{ height: "50px", fontSize: "17px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}