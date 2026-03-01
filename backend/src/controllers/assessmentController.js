const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fetch = require("node-fetch");

const Assessment = require("../models/Assessment");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

exports.generateAssessment = async (req, res) => {
    try {
        console.log("User from POST:", req.user);
        const file = req.file;
        const { subject, type, difficulty, questionsCount, shuffle } = req.body;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (!subject || !type || !difficulty || !questionsCount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // =========================================
        // 1️⃣ DOWNLOAD FILE FROM S3
        // =========================================
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.key,
        });

        const s3Response = await s3.send(command);

        const streamToBuffer = async (stream) => {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks)));
            });
        };

        const fileBuffer = await streamToBuffer(s3Response.Body);

        // =========================================
        // 2️⃣ EXTRACT TEXT (PDF / DOCX)
        // =========================================
        let extractedText = "";

        if (file.mimetype === "application/pdf") {
            const pdf = require("pdf-parse");
            const pdfData = await pdf(fileBuffer);
            extractedText = pdfData.text;
        }

        // DOCX
        else if (
            file.mimetype.includes("word") ||
            file.originalname.endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        }

        else {
            return res.status(400).json({
                message: "Only PDF and DOCX supported for now",
            });
        }

        if (!extractedText || extractedText.length < 50) {
            return res.status(400).json({
                message: "Not enough readable content in file",
            });
        }

        // Prevent token overflow
        extractedText = extractedText.substring(0, 12000);

        // =========================================
        // 3️⃣ GEMINI AI GENERATION (SAME AS CHATBOT)
        // =========================================

        const prompt = `
You are an expert university professor.

Generate ${questionsCount} ${type === "mcq" ? "multiple choice" : "written"
            } questions.

Subject: ${subject}
Difficulty: ${difficulty}

Rules:
- Include explanation (2-3 lines)
- Mention reference page number
- Strictly return valid JSON array
- Do NOT include markdown
- Do NOT include extra text

Format:
[
  {
    "questionText": "",
    "options": [],
    "correctAnswer": "",
    "explanation": "",
    "referencePage": ""
  }
]

Material:
${extractedText}
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(500).json({ error: "Gemini API failed" });
        }

        let rawOutput =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        rawOutput = rawOutput.replace(/```json|```/g, "").trim();

        let questions;

        try {
            questions = JSON.parse(rawOutput);
        } catch (err) {
            console.error("Invalid JSON from Gemini:", rawOutput);
            return res.status(500).json({
                message: "AI returned invalid format",
            });
        }

        if (!Array.isArray(questions)) {
            return res.status(500).json({
                message: "AI did not return question array",
            });
        }

        // =========================================
        // 4️⃣ SHUFFLE QUESTIONS
        // =========================================
        if (shuffle === "true") {
            questions = questions.sort(() => Math.random() - 0.5);
        }

        // =========================================
        // 5️⃣ SAVE TO DATABASE
        // =========================================
        const newAssessment = await Assessment.create({
            title: `${type.toUpperCase()} - ${subject}`,
            subject,
            type,
            difficulty,
            duration: type === "mcq" ? 30 : 60,
            questions,
            createdBy: req.user.uid,
        });

        // =========================================
        // 6️⃣ RETURN RESPONSE
        // =========================================
        res.status(200).json(newAssessment);

    } catch (error) {
        console.error("AI GENERATION ERROR:", error);
        res.status(500).json({
            message: "Assessment generation failed",
        });
    }
};