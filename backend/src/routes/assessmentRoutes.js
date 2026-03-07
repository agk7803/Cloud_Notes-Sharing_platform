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
const AssessmentResult = require("../models/AssessmentResult");
const User = require("../models/User");

// Get all assessments (Public)
router.get("/", protect, async (req, res) => {
    try {
        const assessments = await Assessment.find()
            .sort({ createdAt: -1 });

        // Since Firebase UID is a string, we might need to manually populate names 
        // if the 'ref' isn't working perfectly with strings. 
        // But let's try to fetch user details for each assessment.
        const populatedAssessments = await Promise.all(assessments.map(async (test) => {
            const creator = await User.findOne({ firebaseUid: test.createdBy }).select("name");
            return {
                ...test.toObject(),
                creatorName: creator ? creator.name : "Unknown Scholar"
            };
        }));

        res.json(populatedAssessments);
    } catch (error) {
        console.error("GET ALL ASSESSMENTS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch assessments" });
    }
});

// Get single assessment
router.get("/:id", protect, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        const creator = await User.findOne({ firebaseUid: assessment.createdBy }).select("name");

        res.json({
            ...assessment.toObject(),
            creatorName: creator ? creator.name : "Unknown Scholar"
        });
    } catch (error) {
        console.error("GET ASSESSMENT ERROR:", error);
        res.status(500).json({ message: "Failed to fetch assessment" });
    }
});

// Submit Assessment
router.post("/:id/submit", protect, async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionIdx, selectedOption }
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        let correctCount = 0;
        const processedAnswers = assessment.questions.map((q, idx) => {
            const userAnswer = answers.find(a => a.questionIdx === idx);
            const isCorrect = userAnswer !== undefined && q.options[userAnswer.selectedOption] === q.correctAnswer;
            if (isCorrect) correctCount++;
            return {
                questionIdx: idx,
                selectedOption: userAnswer ? userAnswer.selectedOption : null,
                isCorrect
            };
        });

        const totalQuestions = assessment.questions.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        const scorePerQuestion = 10; // Fixed score per correct answer
        const totalScore = correctCount * scorePerQuestion;

        const result = await AssessmentResult.create({
            assessmentId: assessment._id,
            userId: req.user.uid,
            answers: processedAnswers,
            score: totalScore,
            totalQuestions,
            percentage
        });

        // Update User stats
        await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            {
                $inc: {
                    totalScore: totalScore,
                    [`subjectScores.${assessment.subject}`]: totalScore
                },
                $setOnInsert: {
                    name: req.user.name,
                    email: req.user.email,
                    firebaseUid: req.user.uid
                }
            },
            { upsert: true, returnDocument: 'after' }
        );

        res.status(201).json(result);
    } catch (error) {
        console.error("SUBMIT ASSESSMENT ERROR:", error);
        res.status(500).json({ message: "Failed to submit assessment" });
    }
});

// Get User Results
router.get("/results/user", protect, async (req, res) => {
    try {
        const results = await AssessmentResult.find({ userId: req.user.uid })
            .populate("assessmentId", "title subject type difficulty")
            .sort({ completedAt: -1 });
        res.json(results);
    } catch (error) {
        console.error("GET USER RESULTS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch results" });
    }
});

// Get Specific Result with Details
router.get("/results/:resultId", protect, async (req, res) => {
    try {
        const result = await AssessmentResult.findById(req.params.resultId)
            .populate("assessmentId");

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("GET RESULT DETAIL ERROR:", error);
        res.status(500).json({ message: "Failed to fetch result details" });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const assessment = await Assessment.findOne({
            _id: req.params.id
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