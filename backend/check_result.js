const mongoose = require('mongoose');
require('dotenv').config();

const AssessmentResult = require('./src/models/AssessmentResult');
const Assessment = require('./src/models/Assessment');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await AssessmentResult.findOne().sort({ createdAt: -1 }).populate('assessmentId').lean();
        if (result) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log("No results found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
