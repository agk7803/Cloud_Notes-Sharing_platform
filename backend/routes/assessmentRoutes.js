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

module.exports = router;