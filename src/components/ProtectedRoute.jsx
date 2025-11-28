// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole, requireSellerVerified = false }) {
  const { user } = useAuth();
  const loc = useLocation();

  // must be logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  // role guard
  if (requiredRole && user.role !== requiredRole) {
    // buyer trying to access seller pages, etc.
    return <Navigate to="/" replace />;
  }

  // seller must be verified (after onboarding)
  if (requireSellerVerified && user.role === "seller" && !user.isSellerVerified) {
    return <Navigate to="/seller-registration" replace />;
  }

  return children;
}
