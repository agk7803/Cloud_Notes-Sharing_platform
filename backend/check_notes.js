const mongoose = require('mongoose');
require('dotenv').config();
const Note = require('./src/models/Note');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const notes = await Note.find({});
        console.log("TOTAL NOTES FOUND:", notes.length);
        console.log(JSON.stringify(notes.map(n => ({ 
            _id: n._id, 
            title: n.title, 
            authorName: n.authorName, 
            visibility: n.visibility 
        })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
