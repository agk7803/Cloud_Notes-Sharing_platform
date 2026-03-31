const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Note = require('../src/models/Note');

    // First find a real user's authorId (string UID)
    const User = require('../src/models/User');
    const user = await User.findOne();
    if (!user) {
        console.error('No users found in DB. Please register first.');
        process.exit(1);
    }
    const authorId = user.uid || user._id.toString();
    const authorName = user.name || user.email || 'Student';

    console.log(`Seeding notes with authorId: ${authorId}, name: ${authorName}`);

    const seeds = [
        { title: 'Introduction to Machine Learning', subject: 'Machine Learning', fileType: 'pdf', difficulty: 'easy' },
        { title: 'Cloud Computing Architectures', subject: 'Cloud Computing', fileType: 'pdf', difficulty: 'medium' },
        { title: 'Advanced Data Structures & Algorithms', subject: 'Data Structures', fileType: 'pdf', difficulty: 'hard' },
        { title: 'Software Engineering Best Practices', subject: 'Software Engineering', fileType: 'pdf', difficulty: 'medium' },
        { title: 'Compiler Design Fundamentals', subject: 'Compiler Design', fileType: 'pdf', difficulty: 'hard' },
        { title: 'Computer Networks — OSI Model Deep Dive', subject: 'Computer Networks', fileType: 'pdf', difficulty: 'easy' },
        { title: 'Calculus III: Multivariable & Vector Calculus', subject: 'Calculus', fileType: 'pdf', difficulty: 'medium' },
        { title: 'Web Engineering: React & Node.js', subject: 'Web Engineering', fileType: 'pdf', difficulty: 'easy' },
    ];

    const notes = seeds.map(s => ({
        title: s.title,
        subject: s.subject,
        fileUrl: `https://stunotes-bucket.s3.amazonaws.com/notes/sample-${s.subject.toLowerCase().replace(/\s/g, '-')}.pdf`,
        s3Key: `notes/sample-${s.subject.toLowerCase().replace(/\s/g, '-')}.pdf`,
        fileType: s.fileType,
        difficulty: s.difficulty,
        visibility: 'public',
        authorId: authorId,
        authorName: authorName,
        size: '1.2 MB',
    }));

    await Note.insertMany(notes);
    console.log(`✅ Successfully seeded ${notes.length} public notes.`);
    process.exit(0);
}).catch(err => {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
});
