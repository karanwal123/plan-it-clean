// src/components/AuthSuccess.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AuthSuccess() {
  const { setTokenFromUrl } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (token) {
      // store it and re‑run your checkAuthStatus
      setTokenFromUrl(token);
    }
    // clean up the URL and send user home:
    navigate("/", { replace: true });
  }, [search, setTokenFromUrl, navigate]);

  return <p>Signing you in…</p>;
}
