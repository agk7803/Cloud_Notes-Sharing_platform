const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

router.post("/academic-chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Academic AI request:", message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash
:generateContent?key=${process.env.GEMINI_API_KEY}
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
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

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({ reply });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI failed to generate response" });
  }
});

module.exports = router;
