const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const noteRoutes = require('./src/routes/noteRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const userRoutes = require("./src/routes/userRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const assessmentRoutes = require("./src/routes/assessmentRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const setupSocket = require('./src/sockets/socketHandler');


/* ================= INIT ================= */

connectDB();

const app = express();
const server = http.createServer(app);


/* ================= SOCKET SETUP ================= */

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

setupSocket(io);


/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());


/* ================= ROUTES ================= */

app.use('/api/notes', noteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api', aiRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/events", eventRoutes);


/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {

    console.error("Server Error:", err.stack || err);

    const status = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(status).json({
        message: err.message || "Internal Server Error"
    });

});


/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
