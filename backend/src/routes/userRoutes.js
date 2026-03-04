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
    const { uid, email, name } = req.user;

    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email }]
    });

    if (!user) {
      // Create user if they don't exist in Mongo but are authed in Firebase
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        firebaseUid: uid,
        totalScore: 0,
        subjectScores: {}
      });
    }

    // Optional: Recalculate score if it's 0 or to ensure subjectScores are synced
    if (user.totalScore === 0 || !user.subjectScores || user.subjectScores.size === 0) {
      const AssessmentResult = require("../models/AssessmentResult");
      const Assessment = require("../models/Assessment"); // Ensure model is loaded
      const results = await AssessmentResult.find({ userId: uid }).populate("assessmentId");

      if (results.length > 0) {
        let total = 0;
        let subjectMap = new Map();

        for (const r of results) {
          total += r.score;
          if (r.assessmentId && r.assessmentId.subject) {
            const currentSubScore = subjectMap.get(r.assessmentId.subject) || 0;
            subjectMap.set(r.assessmentId.subject, currentSubScore + r.score);
          }
        }

        user.totalScore = total;
        user.subjectScores = subjectMap;
        await user.save();
      }
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
