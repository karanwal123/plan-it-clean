import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserHeader() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 text-white hover:text-[#89ECDB] transition-colors"
      >
        <div className="w-10 h-10 bg-[#89ECDB] rounded-full flex items-center justify-center text-[#2B3638] font-bold overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <span className="hidden md:block">Welcome, {user?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-[#3C4648] rounded-lg shadow-lg border border-gray-600 z-20">
            <div className="py-2">
              <div className="px-4 py-2 text-gray-300 border-b border-gray-600">
                <div className="font-medium">{user?.name}</div>
                <div className="text-sm text-gray-400">{user?.email}</div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-white hover:bg-[#2B3638] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
