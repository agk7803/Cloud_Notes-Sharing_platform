const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { generateAssessment } = require("../controllers/assessmentController");
const { protect } = require("../middleware/authMiddleware");

router.post(
    "/generate",
    protect,
    upload.single("file"),
    generateAssessment
);

const Assessment = require("../models/Assessment");

router.get("/", protect, async (req, res) => {
    try {
        console.log("User from GET:", req.user);

        const assessments = await Assessment.find({
            createdBy: req.user._id
        }).sort({ createdAt: -1 });

        res.json(assessments);
    } catch (error) {
        console.error("GET ASSESSMENTS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch assessments" });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const assessment = await Assessment.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        await assessment.deleteOne();

        res.json({ message: "Assessment deleted successfully" });

    } catch (error) {
        console.error("DELETE ASSESSMENT ERROR:", error);
        res.status(500).json({ message: "Failed to delete assessment" });
    }
});

module.exports = router;