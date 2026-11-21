import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

export default function AvailableCabins() {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", countryCode: "+91", phoneNo: "", feeAmount: "1000" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadCabins = async () => {
    try {
      const { data } = await api.get("/cabins/public");
      setCabins(data);
    } catch (error) {
      console.error("Failed to fetch cabins", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCabins();
  }, []);

  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  const handleBookClick = (cabinNo) => {
    setSelectedCabin(cabinNo);
    setForm({ name: "", age: "", countryCode: "+91", phoneNo: "", feeAmount: "1000" });
    setError("");
    setSuccess(false);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // 1. Create a Razorpay order.
      const { data: order } = await api.post("/students/create-payment", {
        amount: Number(form.feeAmount),
      });

      const fullPhoneNo = `${form.countryCode}${form.phoneNo}`;

      // 2. Razorpay Options
      const options = {
        key: "rzp_test_U2RN7lcyQKy1v4", 
        amount: order.amount,
        currency: order.currency,
        name: "StudyHall Booking",
        description: `Booking for Cabin ${selectedCabin}`,
        order_id: order.id,
        handler: async function (response) {
// 3. Send a request to the admin after successful payment.

          try {
            await api.post("/students/public-book", {
              name: form.name,
              age: form.age,
              phoneNo: fullPhoneNo,
              cabinNo: selectedCabin,
              feeAmount: Number(form.feeAmount),
            });
            
            setSuccess(true);
            setTimeout(() => {
              setSelectedCabin(null);
              loadCabins();
            }, 3000);
            
          } catch (err) {
            setError("Payment done, but booking failed. Please contact Admin.");
          }
        },
        prefill: {
          name: form.name,
          contact: fullPhoneNo,
        },
        theme: {
          color: "#1558c9",
        },
      };

      // 4. Razorpay Popup Open
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setError("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Try again.");
    }
  };

  const renderCabin = (n) => {
    const c = cabins.find((x) => x.cabinNo === n);
    if (!c) return null;
    
    return (
      <div 
        key={n} 
        className={`cabin ${c.isOccupied ? "occupied" : "empty"}`} 
        style={{ 
          cursor: c.isOccupied ? "not-allowed" : "pointer",
          opacity: c.isOccupied ? 0.5 : 1,
          border: c.isOccupied ? "2px solid var(--blue)" : "1px dashed var(--lime)"
        }}
        onClick={() => !c.isOccupied && handleBookClick(n)}
      >
        <b>{n}</b>
        <small>{c.isOccupied ? "Occupied" : "Book Now"}</small>
      </div>
    );
  };

  return (
    <div className="login-page" style={{ flexDirection: "column", padding: 0, minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ zIndex: 2, textAlign: "center", maxWidth: "800px", padding: "40px 20px", marginTop: "60px" }}>
        <h1 className="login-title" style={{ fontSize: "42px", marginBottom: "10px" }}>
          Available <span>Cabins</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "40px" }}>
          Click on any available (Grey) cabin to book it instantly. Admin will approve it.
        </p>

        {loading ? (
          <p style={{ color: "#fff" }}>Loading Cabins...</p>
        ) : (
          <div className="map" style={{ background: "rgba(10, 12, 16, 0.8)", padding: "30px" }}>
            <div className="row">{range(1, 7).map(renderCabin)}</div>
            <div className="row">{range(8, 14).map(renderCabin)}</div>
            <div className="side">
              <div className="col">{range(15, 18).map(renderCabin)}</div>
              <div className="col">{range(19, 22).map(renderCabin)}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "40px" }}>
          <Link to="/login" style={{ background: "var(--blue)", color: "#fff", padding: "14px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 15px rgba(21, 88, 201, 0.3)" }}>
            Back to Login
          </Link>
        </div>
      </div>

      {selectedCabin && (
        <div className="modal-bg">
          <div className="modal" style={{ borderTop: "4px solid var(--lime)" }}>
            <h3 style={{ color: "var(--lime)", margin: 0 }}>Book Cabin {selectedCabin}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "-5px" }}>Enter your details & pay to confirm.</p>

            {success ? (
              <div style={{ background: "rgba(212, 255, 36, 0.1)", border: "1px solid var(--lime)", padding: "15px", borderRadius: "8px", color: "var(--lime)", textAlign: "center", marginTop: "10px" }}>
                🎉 Payment Successful! Booking Request Sent to Admin. Wait for approval.
              </div>
            ) : (
              <form onSubmit={submitBooking} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label>Name</label>
                <input name="name" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

                <label>Age</label>
                <input name="age" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />

                <label>Phone Number</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select 
                    value={form.countryCode} 
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    style={{ width: "100px", padding: "10px", borderRadius: "6px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid var(--border)" }}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input 
                    name="phoneNo" 
                    placeholder="Phone Number" 
                    value={form.phoneNo} 
                    onChange={(e) => setForm({ ...form, phoneNo: e.target.value })} 
                    required 
                    style={{ flex: 1 }}
                  />
                </div>

                <label>Fee Amount (₹)</label>
                <input 
                  name="feeAmount" 
                  type="number" 
                  placeholder="Fee Amount" 
                  value={form.feeAmount} 
                  onChange={(e) => setForm({ ...form, feeAmount: e.target.value })} 
                  required 
                />

                {error && <p style={{ color: "var(--tomato)", fontSize: "13px", margin: "5px 0" }}>{error}</p>}

                <div className="actions">
                  <button type="submit" style={{ background: "var(--lime)", color: "#000" }}>Pay & Book</button>
                  <button type="button" onClick={() => setSelectedCabin(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}