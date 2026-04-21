const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { generateAssessment, getAnswerKey, getQuestionPaper } = require("../controllers/assessmentController");
const { protect } = require("../middleware/authMiddleware");
const fetch = require("node-fetch");

// Get Answer Key PDF
router.get("/answerkey/:id", protect, getAnswerKey);

// Get Question Paper PDF
router.get("/questionpaper/:id", protect, getQuestionPaper);

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
        const { answers } = req.body;
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        let processedAnswers = [];
        let correctCount = 0;

        if (assessment.type === "written") {
            try {
                const gradingInput = assessment.questions.map((q, idx) => {
                    const userAnswer = answers.find(a => a.questionIdx === idx);
                    return {
                        questionIdx: idx,
                        modelAnswer: q.correctAnswer,
                        userAnswer: userAnswer ? (userAnswer.answerText || "") : ""
                    };
                });

                const gradePrompt = `
                    You are an academic grader. Grade these subjective answers against the model answers.
                    Return "true" if the user answer is mostly accurate and relevant, or "false" if it is wrong, nonsense (like random characters), or empty.
                    
                    Data: ${JSON.stringify(gradingInput)}

                    Return ONLY a JSON array of booleans. Example: [true, false]
                `;

                const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: gradePrompt }] }] })
                });

                const aiData = await aiRes.json();
                const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
                const gradingResults = JSON.parse(aiText.replace(/```json|```/g, "").trim());

                processedAnswers = assessment.questions.map((q, idx) => {
                    const userAnswer = answers.find(a => a.questionIdx === idx);
                    const isCorrect = Array.isArray(gradingResults) && gradingResults[idx] === true;
                    if (isCorrect) correctCount++;
                    return {
                        questionIdx: idx,
                        answerText: userAnswer ? userAnswer.answerText : null,
                        isCorrect
                    };
                });
            } catch (aiErr) {
                console.error("AI GRADING ERROR:", aiErr);
                // Fallback: mark as submitted but not necessarily correct if AI fails
                processedAnswers = assessment.questions.map((q, idx) => {
                    const userAnswer = answers.find(a => a.questionIdx === idx);
                    return {
                        questionIdx: idx,
                        answerText: userAnswer ? userAnswer.answerText : null,
                        isCorrect: false
                    };
                });
            }
        } else {
            // MCQ Logic
            processedAnswers = assessment.questions.map((q, idx) => {
                const userAnswer = answers.find(a => a.questionIdx === idx);
                const isCorrect = userAnswer !== undefined && q.options[userAnswer.selectedOption] === q.correctAnswer;
                if (isCorrect) correctCount++;
                return {
                    questionIdx: idx,
                    selectedOption: userAnswer ? userAnswer.selectedOption : null,
                    isCorrect
                };
            });
        }

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

        if (assessment.createdBy !== req.user.uid) {
            return res.status(403).json({ message: "Unauthorized deletion" });
        }
        await assessment.deleteOne();
        res.json({ message: "Assessment deleted successfully" });

    } catch (error) {
        console.error("DELETE ASSESSMENT ERROR:", error);
        res.status(500).json({ message: "Failed to delete assessment" });
    }
});

module.exports = router;