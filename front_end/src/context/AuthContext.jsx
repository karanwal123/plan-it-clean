// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // keep axios header in sync
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // fetch /auth/me
  const checkAuthStatus = async () => {
    if (!token) {
      setUser(null);
      return false;
    }
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      return false;
    }
  };

  // on-mount and whenever token changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      await checkAuthStatus();
      setLoading(false);
    })();
  }, [token]);

  // SIGN UP
  const register = async (name, email, password) => {
    try {
      const res = await axios.post("/auth/register", { name, email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  // SIGN IN
  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      const { token: newToken, user: loggedInUser } = res.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // LOG OUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // for deep-link token setting (e.g. magic links)
  const setTokenFromUrl = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const ok = await checkAuthStatus();
    if (!ok) throw new Error("Token validation failed");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setTokenFromUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
