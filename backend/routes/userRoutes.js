const express = require("express");
const router = express.Router();

// If you create User model later, uncomment this:
// const User = require("../models/User");

// Temporary test route (to confirm it's working)
router.get("/test", (req, res) => {
  res.json({ message: "User routes working" });
});

// Update Profile (TEMPORARY version without DB)
router.put("/update-profile/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    // Since you are using Firebase, not Mongo users,
    // we will just return success for now.

    res.json({
      message: "Profile updated successfully",
      userId: id,
      updatedName: name,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
