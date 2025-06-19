import React, { useState, useEffect } from "react";
import { User, Edit3, Save, X, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedUser.name,
          email: editedUser.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user in context if available
        if (updateUser) {
          updateUser(data.data);
        }
        setSuccess("Profile updated successfully!");
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#2B3638] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#89ECDB] mb-2">Profile</h1>
          <p className="text-gray-300">Manage your account information</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#3A4A4D] rounded-lg p-8 border border-[#4A5A5D]">
          <div className="flex items-start justify-between mb-6">
            {/* User Info Section */}
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-[#89ECDB] flex items-center justify-center text-[#2B3638] text-3xl font-bold overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        className="w-full bg-[#2B3638] border border-[#4A5A5D] rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-[#89ECDB] focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            email: e.target.value,
                          })
                        }
                        className="w-full bg-[#2B3638] border border-[#4A5A5D] rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-[#89ECDB] focus:border-transparent"
                        placeholder="Enter your email"
                        disabled={user?.authProvider === "google"}
                      />
                      {user?.authProvider === "google" && (
                        <p className="text-xs text-gray-400 mt-1">
                          Email cannot be changed for Google accounts
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">
                      {user?.name || "No Name"}
                    </h2>
                    <p className="text-lg text-gray-300">
                      {user?.email || "No Email"}
                    </p>
                    <div className="flex items-center space-x-3 mt-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user?.authProvider === "google"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {user?.authProvider === "google"
                          ? "Google Account"
                          : "Local Account"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-[#89ECDB] text-[#2B3638] px-4 py-2 rounded-lg hover:bg-[#7AD4C4] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-[#4A5A5D] text-white px-4 py-2 rounded-lg hover:bg-[#5A6A6D] transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {!isEditing && (
            <div className="border-t border-[#4A5A5D] pt-6">
              <h3 className="text-lg font-semibold text-[#89ECDB] mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2B3638] rounded-lg p-4">
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white font-medium">
                    {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
                  </p>
                </div>
                <div className="bg-[#2B3638] rounded-lg p-4">
                  <p className="text-sm text-gray-400">Account Type</p>
                  <p className="text-white font-medium capitalize">
                    {user?.authProvider || "Local"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
