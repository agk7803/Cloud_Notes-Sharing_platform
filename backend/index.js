const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notes', noteRoutes);

// Error Handling Middleware
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server Error Stack:", err.stack || err);

    const message = err.message || err.toString();
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({ message: message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
