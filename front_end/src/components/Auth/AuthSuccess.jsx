// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // start by loading any existing token
  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || null
  );
  const [loading, setLoading] = useState(false);

  // whenever token changes, sync axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // called by AuthSuccess, or anywhere you get a fresh token
  const setTokenFromUrl = async (newToken) => {
    setLoading(true);
    // persist it
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        setTokenFromUrl,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
