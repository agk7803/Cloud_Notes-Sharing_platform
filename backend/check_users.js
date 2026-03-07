const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log(JSON.stringify(users.map(u => ({ _id: u._id, name: u.name, firebaseUid: u.firebaseUid })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
