// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// localStorage keys
const LS_USER  = "mp_user";
const LS_TOKEN = "mp_token";
// For offline/demo fallback registration store
const LS_USERS = "mp_users";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_USER)) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || "");
  const [loading, setLoading] = useState(false);

  // Keep axios auth header in sync
  useEffect(() => {
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  }, [token]);

  // Cross-tab sync (if user logs out in another tab)
  useEffect(() => {
    const onStorage = () => {
      setUser(() => {
        try { return JSON.parse(localStorage.getItem(LS_USER)) || null; } catch { return null; }
      });
      setToken(localStorage.getItem(LS_TOKEN) || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ---------------------------
  // Helpers for offline fallback
  // ---------------------------
  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem(LS_USERS)) || []; } catch { return []; }
  };
  const saveUsers = (arr) => localStorage.setItem(LS_USERS, JSON.stringify(arr));

  const persistSession = (u, t) => {
    localStorage.setItem(LS_USER, JSON.stringify(u));
    localStorage.setItem(LS_TOKEN, t);
    setUser(u);
    setToken(t);
  };

  // ---------------------------
  // Auth API (with fallback)
  // ---------------------------

  /** Login with email/password */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Try backend first
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
      // Expected shape: { token, user: {...} }
      const u = normalizeUser(data?.user);
      const t = data?.token || makeToken();
      persistSession(u, t);
      return u;
    } catch (err) {
      // Fallback to local demo store
      const users = loadUsers();
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) {
        throw new Error("Invalid credentials");
      }
      const u = normalizeUser(found);
      const t = makeToken();
      persistSession(u, t);
      return u;
    } finally {
      setLoading(false);
    }
  };

  /** Register user (buyer or seller). For sellers, mark isSellerVerified=false initially. */
  const register = async (payload) => {
    // payload may include: name/firstName/lastName, email, password, phone, gender, role
    // We keep both name + first/last for flexibility
    const newUser = normalizeUser({
      ...payload,
      // default flags
      role: payload.role || payload.userType || "buyer",
      isSellerVerified: payload.role === "seller" ? false : undefined,
    });

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register`, payload);
      // If backend immediately logs in the user, accept its token and user
      const u = normalizeUser(data?.user || newUser);
      const t = data?.token || makeToken();
      persistSession(u, t);
      return u;
    } catch (err) {
      // Offline fallback: store in LS
      const users = loadUsers();
      if (users.some((u) => u.email === newUser.email)) {
        setLoading(false);
        throw new Error("Email already registered");
      }
      users.push({ ...newUser, // store plaintext password ONLY in demo fallback
        password: payload.password
      });
      saveUsers(users);
      // auto-login on register (like many apps)
      persistSession(newUser, makeToken());
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seller finishes onboarding (org details page).
   * After successful verification, set isSellerVerified=true
   */
  const completeSellerProfile = async (profilePayload) => {
    setLoading(true);
    try {
      // If your backend exists, send it there:
      // await axios.post(`${API_BASE}/seller/profile`, profilePayload);
      const updated = {
        ...user,
        isSellerVerified: true,
        sellerProfile: profilePayload,
      };
      localStorage.setItem(LS_USER, JSON.stringify(updated));
      setUser(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  /** Logout */
  const logout = () => {
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_TOKEN);
    setUser(null);
    setToken("");
  };

  // ---------------------------
  // Utilities
  // ---------------------------
  function makeToken() {
    return Math.random().toString(36).slice(2) + "." + Date.now().toString(36);
  }

  function normalizeUser(raw = {}) {
    // Accept both {name} and {firstName,lastName}
    const name =
      raw.name?.trim() ||
      [raw.firstName, raw.lastName].filter(Boolean).join(" ").trim() ||
      raw.username ||
      "User";

    return {
      _id: raw._id || raw.id || cryptoId(),
      name,
      email: raw.email || "",
      role: raw.role || raw.userType || "buyer", // buyer | seller
      phone: raw.phone || "",
      gender: raw.gender || "",
      isSellerVerified: !!raw.isSellerVerified, // only true after onboarding
      // keep any extra fields
      ...("sellerProfile" in raw ? { sellerProfile: raw.sellerProfile } : {}),
    };
  }

  function cryptoId() {
    try {
      return crypto.randomUUID();
    } catch {
      return "id_" + Math.random().toString(36).slice(2, 10);
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      completeSellerProfile,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export default AuthProvider;
