// src/components/UserWelcome.jsx
import React, { useState, useEffect } from "react";

// User Avatar Dropdown Component
function UserAvatar({ user, onSignOut }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 bg-[#3A4A4D] hover:bg-[#4A5A5D] rounded-lg p-2 transition-colors"
        title={`Signed in as ${user.name}`}
      >
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className="w-8 h-8 rounded-full border-2 border-[#89ECDB] object-cover"
          onError={(e) => {
            e.target.src = "/default-avatar.png"; // Fallback image
          }}
        />
        <div className="text-left hidden sm:block">
          <div className="text-white font-medium text-sm">{user.name}</div>
          <div className="text-[#89ECDB] text-xs">{user.email}</div>
        </div>
        <svg
          className={`w-4 h-4 text-white transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
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

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-[#3A4A4D] border border-[#4A5A5D] rounded-lg shadow-xl z-50">
            {/* User Info Section */}
            <div className="p-4 border-b border-[#4A5A5D]">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-[#89ECDB] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {user.name}
                  </div>
                  <div className="text-[#89ECDB] text-sm truncate">
                    {user.email}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {user.authProvider === "google"
                      ? "🔗 Google Account"
                      : "👤 Local Account"}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-3 border-b border-[#4A5A5D]">
              <div className="text-xs text-gray-400 mb-2">Quick Stats</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-[#89ECDB] font-semibold">
                    {user.savedRoutes?.length || 0}
                  </div>
                  <div className="text-gray-400">Saved Routes</div>
                </div>
                <div className="text-center">
                  <div className="text-[#89ECDB] font-semibold">
                    {user.preferences?.defaultTravelMode || "DRIVING"}
                  </div>
                  <div className="text-gray-400">Default Mode</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Add your profile/settings handler here
                }}
                className="w-full text-left p-2 text-white hover:bg-[#4A5A5D] rounded transition-colors text-sm"
              >
                ⚙️ Settings & Preferences
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onSignOut();
                }}
                className="w-full text-left p-2 text-red-400 hover:bg-[#4A5A5D] rounded transition-colors text-sm"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Welcome Banner Component
function WelcomeBanner({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to explore new places today?",
      "Let's plan your next adventure!",
      "Where will your journey take you?",
      "Time to discover something amazing!",
      "Your next great trip awaits!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const firstName = user.name.split(" ")[0];

  return (
    <div className="bg-gradient-to-r from-[#89ECDB]/20 to-[#3A4A4D]/20 rounded-xl p-6 mb-6 border border-[#89ECDB]/30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.name}
            className="w-16 h-16 rounded-full border-3 border-[#89ECDB] object-cover shadow-lg"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          {user.authProvider === "google" && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-[#2B3638]">
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="text-[#89ECDB] text-base mb-2">
            {getMotivationalMessage()}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              📍 {user.savedRoutes?.length || 0} saved routes
            </span>
            <span className="flex items-center gap-1">
              🚗 {user.preferences?.defaultTravelMode || "DRIVING"} mode
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main UserWelcome component to be imported
export default function UserWelcome({ user, onSignOut, showBanner = true }) {
  if (!user) return null;

  return (
    <>
      {showBanner && <WelcomeBanner user={user} />}
      <UserAvatar user={user} onSignOut={onSignOut} />
    </>
  );
}

// Individual exports for flexibility
export { UserAvatar, WelcomeBanner };
