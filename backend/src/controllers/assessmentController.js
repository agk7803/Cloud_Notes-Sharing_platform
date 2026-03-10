const PDFDocument = require("pdfkit");
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
            You are an expert educator. Generate a ${difficulty} difficulty ${type} assessment on the subject "${subject}" based on the following content:
            "${extractedText}"

            The assessment should have exactly ${questionsCount} questions.
            
            ${type === "mcq" ? `
            Format: Multiple Choice Questions (MCQ).
            For each question, provide:
            - questionText (string)
            - options (array of 4 strings)
            - correctAnswer (string, matching one of the options)
            - explanation (string)
            - referencePage (optional string)
            ` : `
            Format: Written/Subjective Questions.
            For each question, provide:
            - questionText (string)
            - options (MUST be an empty array [])
            - correctAnswer (string, provide a comprehensive model answer)
            - explanation (string, explaining key points that should be in the answer)
            - referencePage (optional string)
            `}

            Return ONLY a valid JSON array of objects. Do not include any markdown formatting or extra text.
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

exports.getAnswerKey = async (req, res) => {
    try {
        const assessmentId = req.params.id;
        const assessment = await Assessment.findById(assessmentId);

        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        const doc = new PDFDocument({ margin: 50 });

        const isDownload = req.query.download === "true";

        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `${isDownload ? "attachment" : "inline"}; filename=AnswerKey_${assessment.title.replace(/\s+/g, "_")}.pdf`
        );

        doc.pipe(res);

        // Header
        doc.fontSize(20).text("Assessment Answer Key", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(assessment.title, { align: "center", underline: true });
        doc.fontSize(12).text(`Subject: ${assessment.subject}`, { align: "center" });
        doc.moveDown(2);

        // Questions
        assessment.questions.forEach((q, index) => {
            doc.fontSize(12).font("Helvetica-Bold").text(`Question ${index + 1}:`);
            doc.font("Helvetica").text(q.questionText);
            doc.moveDown(0.5);

            doc.font("Helvetica-Bold").text("Correct Answer: ", { continued: true });
            doc.font("Helvetica").text(q.correctAnswer);

            if (q.explanation) {
                doc.moveDown(0.5);
                doc.font("Helvetica-Bold").text("Explanation: ", { continued: true });
                doc.font("Helvetica").text(q.explanation);
            }

            if (q.referencePage) {
                doc.moveDown(0.5);
                doc.font("Helvetica-Bold").text("Reference Page: ", { continued: true });
                doc.font("Helvetica").text(q.referencePage);
            }

            doc.moveDown();
            doc.lineWidth(0.5).moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Check if we need a new page
            if (doc.y > 700) {
                doc.addPage();
            }
        });

        doc.end();
    } catch (error) {
        console.error("PDF GENERATION ERROR:", error);
        res.status(500).json({ message: "Failed to generate answer key PDF" });
    }
};