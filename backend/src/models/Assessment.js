const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    referencePage: String,
});

const assessmentSchema = new mongoose.Schema(
    {
        title: String,
        subject: String,
        type: String,
        difficulty: String,
        duration: Number,
        questions: [questionSchema],
        createdBy: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);