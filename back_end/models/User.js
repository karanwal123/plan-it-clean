import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password required only if not Google user
      },
      minlength: 6,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    avatar: {
      type: String, // Store Google profile picture URL
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    // Store user's saved routes
    savedRoutes: [
      {
        name: String,
        locations: Array,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // User preferences
    preferences: {
      defaultTravelMode: {
        type: String,
        default: "DRIVING",
      },
      units: {
        type: String,
        default: "metric",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only for local auth)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.authProvider === "google") {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method (only for local auth)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.authProvider === "google") {
    throw new Error("Cannot compare password for Google-authenticated user");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
