import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Authorization header:", req.header("Authorization"));

    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Extracted token:", token);

    if (!token) {
      console.log("❌ No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log("Found user:", !!user, user?.email);

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    console.log("✅ Auth successful");
    next();
  } catch (error) {
    console.log("❌ Auth error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};
export default auth;
