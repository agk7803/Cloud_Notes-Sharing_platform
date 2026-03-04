const mongoose = require("mongoose");

const assessmentResultSchema = new mongoose.Schema(
    {
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true,
        },
        userId: {
            type: String, // Firebase UID
            required: true,
        },
        answers: [
            {
                questionIdx: Number,
                selectedOption: Number,
                isCorrect: Boolean,
            },
        ],
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
        completedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AssessmentResult", assessmentResultSchema);
