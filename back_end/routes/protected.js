import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Save route
router.post("/save-route", auth, async (req, res) => {
  try {
    const { name, locations } = req.body;

    const user = await User.findById(req.user._id);
    user.savedRoutes.push({ name, locations });

    await user.save();
    res.json({ message: "Route saved successfully" });
  } catch (error) {
    console.error("Error saving route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get saved routes
router.get("/saved-routes", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.savedRoutes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/profile", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, preferences } = req.body;

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        preferences,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// Delete saved route
router.delete("/routes/:routeId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { routeId } = req.params;

    // Find user and remove the route from savedRoutes array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove route from savedRoutes array
    user.savedRoutes = user.savedRoutes.filter(
      (route) => route._id.toString() !== routeId
    );

    await user.save();

    res.json({
      message: "Route deleted successfully",
      savedRoutes: user.savedRoutes,
    });
  } catch (error) {
    console.error("Route deletion error:", error);
    res.status(500).json({
      message: "Failed to delete route",
      error: error.message,
    });
  }
});

// Get specific route details
router.get("/routes/:routeId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { routeId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the specific route
    const route = user.savedRoutes.find(
      (route) => route._id.toString() === routeId
    );

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json({
      message: "Route retrieved successfully",
      route: route,
    });
  } catch (error) {
    console.error("Route retrieval error:", error);
    res.status(500).json({
      message: "Failed to retrieve route",
      error: error.message,
    });
  }
});
export default router;
