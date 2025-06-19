import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import passport from "./config/passport.js";

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // <-- frontend's port
    credentials: true,
  })
);
app.use(express.json());//middleware that lets your backend automatically parse JSON data sent in the body of incoming requests.



// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //Don’t save the session to the store if nothing has changed.
    saveUninitialized: false, //Don’t create a session until something is stored in it (like req.user).
    // ------- //
    cookie: {
      secure: false, // Send cookies over HTTP ||  Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
  res.json({ message: "Plan-it API Server with Google OAuth" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
