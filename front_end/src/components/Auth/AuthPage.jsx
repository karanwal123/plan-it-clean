import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import GoogleSignIn from "./GoogleSignIn";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { register, login } = useAuth();

  return (
    <div className="min-h-screen bg-[#2B3638] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* responsive grid: 1 col on mobile, 2 on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center items-center gap-12">
          {/* Left: branding */}
          <div className="max-w-md text-center md:text-left space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold text-[#89ECDB]">
              Plan‑it
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              Your intelligent route planning companion
            </p>
            <div className="space-y-4 text-gray-400">
              {[
                "Optimize your travel routes instantly",
                "Get real-time weather insights",
                "Save and share your favorite routes",
                "Export detailed route summaries",
              ].map((line) => (
                <div key={line} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#89ECDB] rounded-full" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: auth box */}
          <div className="w-full max-w-md bg-[#3C4648] p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-[#89ECDB] text-center mb-6">
              {isLogin ? "Welcome Back" : "Join Plan‑it"}
            </h2>

            <GoogleSignIn />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#3C4648] text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {isLogin ? (
              <LoginForm
                login={login}
                onSwitchToRegister={() => setIsLogin(false)}
              />
            ) : (
              <RegisterForm
                register={register}
                onSwitchToLogin={() => setIsLogin(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
