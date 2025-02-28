
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT; // Default to 3000 if PORT isn’t set
const passport = require("passport");
const session = require("express-session");
const connectDb = require("./db/mongoDb.js");
const { WebSocketServer } = require("ws");
const cors = require('cors');

// Import Passport Configuration
require("./config/passport.js");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173' }));



// Initialize Passport with session
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Start HTTP server and connect to MongoDB
const server = app.listen(PORT, () => {
    connectDb();
    console.log(`Server listening on http://localhost:${PORT}`);
});

// Initialize WebSocket server
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.on("message", (message) => console.log("Received:", message));
    ws.on("close", () => console.log("WebSocket client disconnected"));
});

// Import routes and pass wss where needed
const authRoute = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js")(wss); // Pass wss to userRoutes
const reelRoutes = require("./routes/reelRoutes.js"); // Assuming reelRoutes.js is renamed to profileRoutes.js

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/profile", reelRoutes);

// Export app and wss
module.exports = { app, wss };


