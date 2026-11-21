
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import clearSession from "../utils/clearSession";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isOpen, setIsOpen] = useState(false);

const logout = () => {
  clearSession();
  navigate("/");
};

  const isPublicPage = [
    "/",
    "/about",
    "/contact",
    "/available-cabins",
  ].includes(location.pathname);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar-container">
      <div className="navbar-top">

        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          Study<span>Hall</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {isPublicPage ? (
            <>
              <Link to="/" className="nav-link">Home</Link>

              <Link to="/about" className="nav-link">About</Link>

              <Link to="/contact" className="nav-link">Contact</Link>

              <Link to="/login" className="nav-login-btn">
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="nav-user-text">
                Hi, <b>{user.name || user.email}</b>
              </span>

              {user.role === "admin" ? (
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              ) : (
                <Link to="/student-profile" className="nav-link">
                  My Profile
                </Link>
              )}

              <button onClick={logout} className="nav-logout-btn">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger Menu */}
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="mobile-dropdown">
          {isPublicPage ? (
            <>
              <Link to="/" onClick={toggleMenu} className="nav-link">
                Home
              </Link>

              <Link to="/about" onClick={toggleMenu} className="nav-link">
                About
              </Link>

              <Link to="/contact" onClick={toggleMenu} className="nav-link">
                Contact
              </Link>

              <Link to="/login" onClick={toggleMenu} className="nav-login-btn">
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="nav-user-text" style={{ padding: "10px 0" }}>
                Hi, <b>{user.name || user.email}</b>
              </span>

              {user.role === "admin" ? (
                <Link
                  to="/dashboard"
                  onClick={toggleMenu}
                  className="nav-link"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/student-profile"
                  onClick={toggleMenu}
                  className="nav-link"
                >
                  My Profile
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="nav-logout-btn"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
