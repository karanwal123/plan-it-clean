// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { setTokenFromUrl } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Get user info and token from backend (cookie is sent automatically)
        const res = await axios.get("/auth/me", { withCredentials: true });
        if (res.data && res.data.user && res.data.token) {
          // Store token in localStorage and context
          await setTokenFromUrl(res.data.token);
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/auth?error=google_auth_failed", { replace: true });
        }
      } catch (err) {
        navigate("/auth?error=google_auth_failed", { replace: true });
      }
    };
    fetchToken();
  }, [navigate, setTokenFromUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2B3638] text-white">
      <div className="text-center">
        <div className="text-2xl mb-4 text-[#89ECDB] font-bold">
          Logging you in with Google...
        </div>
        <div className="text-gray-400">
          Please wait, redirecting to your dashboard.
        </div>
      </div>
    </div>
  );
}
