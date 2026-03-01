const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

/*
========================================
TEST ROUTE
========================================
*/
router.get("/test", (req, res) => {
  res.json({ message: "User routes working" });
});

/*
========================================
GET CURRENT USER PROFILE
========================================
*/
router.get("/me", protect, async (req, res) => {
  try {
    const { uid, email } = req.user;

    const user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
========================================
UPDATE PROFILE
========================================
*/
router.put("/update-profile", protect, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const uid = req.user.uid || req.user.user_id;
    const email = req.user.email;

    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email }]
    });

    if (!user) {
      user = new User({
        name,
        email,
        firebaseUid: uid,
        profilePicture: profilePicture || ""
      });
    } else {
      user.name = name; // ALWAYS set name
      if (profilePicture !== undefined) {
        user.profilePicture = profilePicture;
      }
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
