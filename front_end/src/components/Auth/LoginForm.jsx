import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm({ onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#3C4648] p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-[#89ECDB] text-center mb-6">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-white text-sm font-medium mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#2B3638] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-[#89ECDB] focus:ring-1 focus:ring-[#89ECDB]"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-white text-sm font-medium mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#2B3638] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-[#89ECDB] focus:ring-1 focus:ring-[#89ECDB]"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#89ECDB] text-[#2B3638] font-semibold py-3 px-4 rounded-lg hover:bg-[#7AD3C1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-[#89ECDB] hover:text-[#7AD3C1] font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}
