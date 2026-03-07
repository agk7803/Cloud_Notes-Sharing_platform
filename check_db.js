const mongoose = require('mongoose');
require('dotenv').config();

const Assessment = require('./backend/src/models/Assessment');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const assessments = await Assessment.find({});
    console.log(JSON.stringify(assessments.map(a => ({ _id: a._id, title: a.title, createdBy: a.createdBy })), null, 2));
    process.exit(0);
}

check();
