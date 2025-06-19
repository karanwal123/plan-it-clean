import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#3C4648] p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-[#89ECDB] text-center mb-6">
        Join Plan-it
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-white text-sm font-medium mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#2B3638] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-[#89ECDB] focus:ring-1 focus:ring-[#89ECDB]"
            placeholder="Enter your full name"
          />
        </div>

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
            placeholder="Create a password (min 6 characters)"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-white text-sm font-medium mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#2B3638] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-[#89ECDB] focus:ring-1 focus:ring-[#89ECDB]"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#89ECDB] text-[#2B3638] font-semibold py-3 px-4 rounded-lg hover:bg-[#7AD3C1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-[#89ECDB] hover:text-[#7AD3C1] font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
