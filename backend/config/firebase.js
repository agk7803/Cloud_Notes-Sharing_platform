const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase Admin Initialized");

module.exports = admin;
