// middleware/auth.js - Updated to handle both Authorization headers and cookies

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    let token;

    // Priority 1: Check Authorization header
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }

    // Priority 2: Check cookies if no header token
    if (!token && req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        authenticated: false,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
          authenticated: false,
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Clear invalid cookie
      if (req.cookies && req.cookies.auth_token) {
        res.clearCookie("auth_token");
      }

      return res.status(401).json({
        message: "Invalid token",
        authenticated: false,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Server error in authentication",
      authenticated: false,
    });
  }
};

export default auth;
