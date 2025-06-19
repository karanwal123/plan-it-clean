// src/components/Auth/AuthSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthSuccess() {
  const { loading, setTokenFromUrl } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      if (loading) return;
      const params = new URLSearchParams(search);
      const token = params.get("token");
      console.log("AuthSuccess, token:", token);

      if (!token) return navigate("/auth", { replace: true });

      try {
        await setTokenFromUrl(token);
        console.log("Token set, navigating to dashboard");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("setTokenFromUrl failed:", err);
        navigate("/auth", { replace: true });
      }
    })();
  }, [loading, search, setTokenFromUrl, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2B3638] text-[#89ECDB]">
      <p className="text-xl">Signing you in…</p>
    </div>
  );
}
