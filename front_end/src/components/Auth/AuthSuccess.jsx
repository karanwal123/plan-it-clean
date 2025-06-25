import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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
