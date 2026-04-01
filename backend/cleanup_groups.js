const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const cleanup = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        const db = mongoose.connection.db;
        
        // Delete all groups
        const groupResult = await db.collection('groups').deleteMany({});
        console.log(`Deleted ${groupResult.deletedCount} groups.`);

        // Delete all chats
        const chatResult = await db.collection('chats').deleteMany({});
        console.log(`Deleted ${chatResult.deletedCount} chats.`);

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup Error:', error.message);
        process.exit(1);
    }
};

cleanup();
