import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser"; // ADD THIS
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import passport from "./config/passport.js";

dotenv.config();

const app = express();

// IMPORTANT: Add cookie parser before other middleware
app.use(cookieParser());
app.use(express.json());

// Connect to database
connectDB();

const allowedOrigins = [
  "http://localhost:5173", // FIXED: Changed from https to http for local dev
  "https://plan-it-clean.vercel.app",
  "https://plan-it-clean-ha1u6m89t-aditya-karanwals-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // FIXED: Dynamic based on environment
      httpOnly: true, // ADD THIS for security
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // FIXED: For cross-origin
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", protectedRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message:
      "Plan-it API Server with Google OAuth..right now this code was triggered app.get(/)",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});
