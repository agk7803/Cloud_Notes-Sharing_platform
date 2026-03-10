const admin = require('../config/firebase');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, token missing' });
        }

        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token, true);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split('@')[0]
        };

        next();

    } catch (error) {
        console.error("🔥 Firebase Auth Error:", error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Token expired' });
        }

        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };