const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Assessment = require('./src/models/Assessment');
const AssessmentResult = require('./src/models/AssessmentResult');
const connectDB = require('./src/config/db');

async function debugScores() {
    await connectDB();

    console.log('--- USERS ---');
    const users = await User.find({});
    users.forEach(u => {
        console.log(`Name: ${u.name}, Email: ${u.email}, FirebaseUID: ${u.firebaseUid}, TotalScore: ${u.totalScore}, SubjectScores: ${JSON.stringify(u.subjectScores)}`);
    });

    console.log('\n--- ASSESSMENT RESULTS ---');
    const results = await AssessmentResult.find({}).populate('assessmentId', 'title subject');
    results.forEach(r => {
        console.log(`User: ${r.userId}, Score: ${r.score}, Percentage: ${r.percentage}%, Assessment: ${r.assessmentId?.title} (${r.assessmentId?.subject})`);
    });

    mongoose.disconnect();
}

debugScores();
