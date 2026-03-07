const mongoose = require('mongoose');
require('dotenv').config();

const Assessment = require('./src/models/Assessment');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const assessments = await Assessment.find({});
        console.log(JSON.stringify(assessments.map(a => ({ _id: a._id, title: a.title, createdBy: a.createdBy })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
