import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import ParticleBg from "./components/ParticleBg";

import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AvailableCabins from "./pages/AvailableCabins";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import AdminMessages from "./pages/AdminMessages";
import NotFound from "./pages/NotFound";

export default function App() {
  const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");

  // 👈 Page load ayinapudu theme apply avuthundi
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      setIsDark(true);
    } else {
      document.body.classList.remove("dark-mode");
      setIsDark(false);
    }
  }, []);

  // Update the theme when an event is received from ThemeToggle.
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  return (
    <>
      <ParticleBg isDark={isDark} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/available-cabins" element={<AvailableCabins />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/admin-messages" element={<AdminMessages />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}