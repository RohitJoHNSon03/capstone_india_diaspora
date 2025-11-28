import React from "react";
import { Outlet, Link } from "react-router-dom";
import "../styles/layout.css";

const Layout = () => {
  const token = localStorage.getItem("token");
  return (
    <>
      <nav>
        <div>
          <Link to="/">Marketplace</Link>
          <Link to="/products">Products</Link>
        </div>
        <div>
          {token ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />

      <footer>© 2025 Indian Marketplace Portal</footer>
      // In the footer section of Layout.jsx, add:
<div className="footer-links">
  <Link to="/privacy-policy">Privacy Policy</Link>
  <Link to="/terms-of-service">Terms of Service</Link>
  <Link to="/shipping-policy">Shipping Policy</Link>
</div>
    </>
  );
};

export default Layout;
