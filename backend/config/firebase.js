const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Ensure the environment variable for service account key is set
// Ideally, use a service account key file path or credentials object in environment variables.
// For simplicity in this fix, we will initialize with default credentials if available,
// or provide instructions to set up a service account.

// However, to verify ID tokens, the Admin SDK needs to be initialized with a project ID.
// If not running on GCP, we need credentials.
// For now, let's try to initialize with just the project ID if no credentials are provided,
// but usually it requires credentials for full functionality.
// We will check if FIREBASE_SERVICE_ACCOUNT is a path or JSON.

let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Check if it looks like JSON or a path
        if (process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else {
            serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
    } else {
        // If running locally without service account env var, this might fail unless GOOGLE_APPLICATION_CREDENTIALS is set
        // But verifyIdToken might work with just projectId if we are lucky or auth is simple?
        // Actually, verifyIdToken requires project ID to check audience.
        console.warn("FIREBASE_SERVICE_ACCOUNT not set. Attempting to use default credentials.");
    }
} catch (error) {
    console.error("Error loading Firebase credentials:", error);
}

try {
    admin.initializeApp({
        credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
        // If no credentials, applicationDefault() looks for GOOGLE_APPLICATION_CREDENTIALS.
        // If that fails, it might error out on startup or on first use.
    });
    console.log("Firebase Admin Initialized");
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error('Firebase Admin Initialization Error:', error.stack);
    }
}

module.exports = admin;
